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
 *   id = "course_properties_rest_resource",
 *   label = @Translation("Course properties rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/course_properties_module/{id}"
 *   }
 * )
 */
class CoursePropertiesRestResource extends ResourceBase {

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
		global $base_url;
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $nid = \Drupal::request()->get('id');

    $n = Node::load($nid);
	//$author_id = $n->getOwnerId();

    $uri = '';
    //$uri = file_create_url($n->field_crs_thumbnail->entity->getFileUri());
    $result = array(
      'nid' => $n->id(),
      'type' => $n->getType(),
      'title' => $n->getTitle(),
      'dispaly' => $n->get('field_crs_display')->value,
      'duration' => $n->get('field_crs_duration')->value,
      'eval_param' => $n->get('field_crs_eval_param')->value,
      'desc' => $n->get('field_crs_full_desc')->value,
      'isevaluation' => $n->get('field_crs_isevaluation')->value,
      'keywords' => $n->get('field_crs_keywords')->value,
      'language' => $n->get('field_crs_language')->value,
      'metadatas' => $n->get('field_crs_metadatas')->value,
      'no_of_words' => $n->get('field_crs_no_of_words')->value,
      'objectives' => $n->get('field_crs_objectives')->value,
      'short_desc' => $n->get('field_crs_short_desc')->value,
      'thumbnail' => $uri,
      'url_edit' => $n->get('field_crs_url_edit')->value,
      'crs_version' => $n->get('field_crs_version')->value,
      'nav_param' => $n->get('field_crs_nav_param')->value,
      'comp_param' => $n->get('field_crs_comp_param')->value,
      'created' => gmdate('Y-m-d H:i:s',$n->created->value),
      'changed' => gmdate('Y-m-d H:i:s',$n->changed->value),
    );

    
    $bcr = new BilimController();
    $ids = $bcr->getDomainFromCourse($nid, 'course');
    $domainId = $ids['ids']['d_id'];
    $node = Node::load($domainId);
    $result['parent'] = array(
    	'id' => $node->id(),
	    'title' => $node->getTitle(),
	    'type' => $node->getType(),
    	'link' =>  $base_url . '/platform/domainview/'.$domainId.'/0/0',
    	'children' => $bcr->getCbyDomain($ids['ids'],$nid)
    );
    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }

   public function patch() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    $uid = $this->currentUser->id();
    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;

    $response = '';

    $n = Node::load($nid);

    $crs_nav = $n->get('field_crs_nav_param')->value;

    
    $blmNav = json_decode($data->nav_param);
    $blmNavLv = $navigation->navigationlevel;
    $crs_nav = json_decode($n->get('field_crs_nav_param')->value,true);
    /*if($crs_nav){
      $crs_nav_lv = $crs_nav['nav_param']['navigationlevel'];
      if($blmNavLv < $crs_nav_lv){
        $crs_nav['nav_param']['navigationlevel'] = $blmNavLv;
      }
      $blmTocLv = $navigation->toclevel;
      $crs_toc_lv = $crs_nav['nav_param']['toclevel'];
      if($blmTocLv < $crs_toc_lv){
        $crs_nav['nav_param']['toclevel'] = $blmTocLv;
      }
      $n->set('field_crs_nav_param',json_encode($crs_nav));
    }
    else{
      $n->set('field_crs_nav_param',$data->nav_param);
    }*/
    $n->set('field_crs_nav_param',$data->nav_param);
    $n->set('field_crs_comp_param',$data->comp_param);    
    $n->setRevisionUserId($uid);
    
    $res = $n->save();

    if($res > 0){
      $response = 'element updated successfully!';
    }
    else{
      $response = 'Unable to create a children!';
    }

    return new ResourceResponse($response);

  }
  
  
}
