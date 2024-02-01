<?php

namespace Drupal\bilim\Plugin\rest\resource;

use Drupal\rest\ModifiedResourceResponse;
use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\bilim\Controller\BilimController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Psr\Log\LoggerInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "structure_rest_resource",
 *   label = @Translation("Structure rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/structure/{id}"
 *   }
 * )
 */
class StructureRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = parent::create($container, $configuration, $plugin_id, $plugin_definition);
    $instance->logger = $container->get('logger.factory')->get('bilim');
    $instance->currentUser = $container->get('current_user');
    return $instance;
  }
  
  
  /**
   * Responds to GET requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    $id = \Drupal::request()->get('id');
		$data = [];
		
    $node = Node::load($id);
    if ($node){
		  $data = [
		  	'nid' => $node->id(),
		  	'title' => $node->getTitle(),
		  	'type' => $node->getType(),
		  	'stylesummary' => $node->get('field_struct_style_summary')->value,
		  	'screenonsummary' => $node->get('field_struct_screen_on_summary')->value,
		  ];
    }
    

    $response = new ResourceResponse((array)$data);
    $response->addCacheableDependency($data);
    return $response; 
  }

  /**
   * Responds to PATCH requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function patch() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    
		$nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;
    
    $type = $data->type;
    $title = $data->title;
    $styleSummary = $data->stylesummary;
    $screen_on_summary = $data->screenonsummary;
    
    
    $node = Node::load($nid);
  	$node->set('field_struct_style_summary', $styleSummary);
  	$node->set('field_struct_screen_on_summary', $screen_on_summary);
  	$node->setTitle($title);
  	$node->setRevisionUserId($uid);
  	$res = $node->save();
    
    if($res > 0):
        $response = 'Summary updated successfully!';
    else:
        $response = 'Unable to update summary!';
    endif;
   
    return new ResourceResponse($response);
  }

}
