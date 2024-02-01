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
 *   id = "summary_rest_resource",
 *   label = @Translation("Summery rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/summary/{id}"
 *   }
 * )
 */
class SummaryRestResource extends ResourceBase {

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
   * Save summary for page/screen
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
    if(!empty($datas)){
    	$data = json_decode($datas);
    }
    $response = '';
    if(!empty($data)){
    	$summary = $data->summary;
    	$node = Node::load($nid);
    	$type = $node->getType();
    	if($type == 'screen'):
    		$pfield = 'field_scr_summary';
    	elseif($type == 'page'):
    		$pfield = 'field_page_summary';
    	elseif($type == 'simple_page'):
    		$pfield = 'field_sp_summary';
    	elseif($type == 'simple_content'):
    		$pfield = 'field_sc_summary';
    	endif;
    	$node->set($pfield,$summary);
    	$node->setRevisionUserId($uid);
    	$res = $node->save();
    }
    if($res > 0):
        $response = 'element updated successfully!';
    else:
        $response = 'Unable to create a children!';
    endif;
   
    return new ResourceResponse($response);
  }

}
