<?php

namespace Drupal\bilim\Plugin\rest\resource;

use Drupal\rest\ModifiedResourceResponse;
use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\bilim\Controller\BilimController;
use Drupal\Component\Utility\NestedArray;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Log\LoggerInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "template_properties_rest_resource",
 *   label = @Translation("Template Properties rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/temp_properties/{id}"
 *   }
 * )
 */
class TemplatePropertiesRestResource extends ResourceBase {

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
    
    //$type = \Drupal::request()->get('type');
    $t_id = \Drupal::request()->get('id');
    $n = Node::load($t_id);
    $type = $n->getType();
    $result = array();
    
    $protocol = $_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
    $server = $protocol.'://'.$_SERVER['HTTP_HOST'];
    
	/* $l_file = $n->field_t_thumbnaillight->entity->getFileUri();
	if (!$n->get('field_t_thumbnaildark')->isEmpty()){
		$d_file = $n->field_t_thumbnaildark->entity->getFileUri();
		//  $dark_uri = file_create_url($d_file);
		$furl = file_url_transform_relative(file_create_url($d_file));
	}
    	
	if($l_file){
		//$light_uri = file_create_url($l_file);
		$furl = file_url_transform_relative(file_create_url($l_file));
	}    */
	
	
	
    
    if($type == 'template'){
    	$file_url = $n->field_t_htmlnode->entity->getFileUri();
		$furl = file_url_transform_relative(file_create_url($file_url));
		$html_node = $server.$furl;
		$relative_path = \Drupal::service('file_system')->realpath($file_url);

		$in_t_var = $n->get('field_t_variants')->getValue();
		$bcr = new BilimController();
		$var_ids = $bcr->getTargetIds($in_t_var);
	
		$variants = Node::loadMultiple($var_ids);
		$chld_elem = [];
		foreach($variants as $v){
			$h_url = $v->field_tv_htmlnode->entity->getFileUri();
			$hurl = file_url_transform_relative(file_create_url($h_url));
			$html_n = $server.$hurl;
			$rel_path = \Drupal::service('file_system')->realpath($h_url);
		
			$chld_elem[] = array(
		        'nid' => $v->id(),
		        'type' => 'template-variant',
	    		'name' => $v->getTitle(),
		        'htmlNode' => $html_n,
			    'html' => file_get_contents($rel_path),
		      );
	  	}
		
    	$result[] = array(
                'nid' => $n->id(),
                'type' => $n->getType(),
    			'name' => $n->getTitle(),
                'htmlNode' => $html_node,
	            'html' => file_get_contents($relative_path),
				'variants' => $chld_elem
              );
    }
    elseif ($type == 'templatevariant'){
    	$file_url = $n->field_tv_htmlnode->entity->getFileUri();
    	$furl = file_url_transform_relative(file_create_url($file_url));
		$html_node = $server.$furl;
		$relative_path = \Drupal::service('file_system')->realpath($file_url);
		
    	$result[] = array(
                'nid' => $n->id(),
                'type' => 'template-variant',
    			'name' => $n->getTitle(),
                'htmlNode' => $html_node,
	            'html' => file_get_contents($relative_path),
              );
    }
    

    $response = new ResourceResponse((array)$result);
    //$response->addCacheableDependency($result);
    return $response; 
  }
  
}
