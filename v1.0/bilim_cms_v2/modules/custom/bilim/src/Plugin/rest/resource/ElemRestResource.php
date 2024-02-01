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
 *   id = "elem_rest_resource",
 *   label = @Translation("Elem rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/elem/{id}"
 *   }
 * )
 */
class ElemRestResource extends ResourceBase {

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

    $val = array();
    $n = Node::load($id);
    $rc = array();
    if(!empty($n)){
      $type = $n->getType();

      if($type == 'screen'){
        $chld = $n->get('field_scr_connections')->getValue();
        if(!empty($chld)){
			foreach($chld as $c){
            	$rc[] = $c['value'];
        	}
        }
        $val = array(
          'id' => $n->id(),
          'title' => $n->getTitle(),
          'connections' => $rc
        );
      }
      elseif($type == 'page'){
        $chld = $n->get('field_page_connections')->getValue();
        if(!empty($chld)){
        	foreach($chld as $c){
         	   $rc[] = $c['value'];
        	}
        }
        $val = array(
          'id' => $n->id(),
          'title' => $n->getTitle(),
          'connections' => $rc
        );
      }
    }

    $response = new ResourceResponse((array)$val);
    $response->addCacheableDependency($val);
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

    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();

    $multiple_data = array();
    if(!empty($datas)):
      $multiple_data = json_decode($datas);
    endif;
    $data_array = $multiple_data->elements;
    $response = '';
    foreach($data_array as $data){
    	$id = $data->id;
    	$connections = array();
    	if(!empty($data->connections)) {
    		foreach($data->connections as $cn) {
		    	$connections[] = array(
		    			"value" => $cn
		    	);
    		}
    	}
    	$node = Node::load($id);
    	$type = $node->getType();
    	if($type == 'screen'):
    		$pfield = 'field_scr_connections';
    	elseif($type == 'page'):
    		$pfield = 'field_page_connections';
    	elseif($type == 'partpage'):
    		$pfield = 'field_pp_connections';
    	elseif($type == 'simple_partpage'):
    		$pfield = 'field_spp_connections';
    	endif;
    	$node->set($pfield,$connections);
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
