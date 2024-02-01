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
 *   id = "auto_summary_rest_resource",
 *   label = @Translation("Auto summary rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/autosummary/{id}"
 *   }
 * )
 */
class AutoSummaryRestResource extends ResourceBase {

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
    $styleSummary = $data->styleSummary;
    
    $node = Node::load($nid);
    $type = $node->getType();
    if($type == 'structure'):
    	$pfield = 'field_struct_style_summary';
    elseif($type == 'chapter'):
    		$pfield = 'field_style_summary';
    endif;
    		
  	$node->set($pfield, $styleSummary);
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
