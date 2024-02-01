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
 *   id = "chapter_rest_resource",
 *   label = @Translation("Chapter rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/chapter/{id}",
 *     "create" = "/api/chapter/new/{id}"
 *   }
 * )
 */
class ChapterRestResource extends ResourceBase {

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
  public function get($nid) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    
    $n = Node::load($nid);

    $result = array(
      'nid' => $n->id(),
      'type' => $n->getType(),
      'title' => $n->getTitle(),
      'title2' => $n->get('field_chap_title2')->value,
      'description' => $n->get('field_chap_description')->value,
      'metadatas' => $n->get('field_chap_metadatas')->value,
      'note' => $n->get('field_chap_note')->value,
      'nav_temp' => $n->get('field_chap_navigation_template')->value,
      'eval_param' => $n->get('field_chap_eval_param')->value,
      'cust_comp' => $n->get('field_chap_custom_completion')->value,
      'cust_comp_param' => $n->get('field_chap_cust_comp_param')->value,
      'media_param' => $n->get('field_chap_media_param')->value,
      'isevaluation' => $n->get('field_chap_isevaluation')->value,
      'hasfeedback' => $n->get('field_chap_hasfeedback')->value,
      'duration' => $n->get('field_chap_duration')->value,
      'theme_ref' => $n->get('field_theme_ref')->value,
      'created' => gmdate('Y-m-d H:i:s',$n->created->value),
      'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
    );

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
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
  public function patch($nid,$data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';
    //$nid = $node->id();
    if(!empty($data)):
      $cncs = array();
      $n = Node::load($nid);     
      $n->setTitle($data['title']);
      $n->set('field_chap_title2',$data['title2']);
      $n->set('field_chap_description',$data['description']);
      $n->set('field_chap_metadatas',$data['metadatas']);
      $n->set('field_chap_note',$data['note']);
      $n->set('field_chap_navigation_template',$data['nav_temp']);
      $n->set('field_chap_eval_param',$data['eval_param']);
      $n->set('field_chap_custom_completion',$data['cust_comp']);
      $n->set('field_chap_cust_comp_param',$data['cust_comp_param']);
      $n->set('field_chap_isevaluation',$data['isevaluation']);
      $n->set('field_chap_hasfeedback',$data['hasfeedback']);
      $n->set('field_chap_duration',$data['duration']);
      $n->set('field_chap_media_param',$data['media_param']);
      $n->set('field_theme_ref',$data['theme_ref']);
      $res = $n->save();

      if(strtolower($data['hasfeedback']) == 'true' && (strtolower($data['isevaluation']) == 'true' || $data['isevaluation'] == 'placementTest')):
        $bcr = new BilimController();
        $ftype = 'feedback';
        $pch_fld = 'field_chap_children';
        $chlds = $bcr->getElemChildren($nid,$pch_fld);
        $fid = (int)$bcr->getChildrenByType($chlds,$ftype);
        if($fid == 0):
          $ftitle = $ftype;
          $bcr->addChildElem($nid,$chlds,$ftype,$ftitle,$pch_fld);
        endif;
      endif;

      if($res > 0):
          $response = 'element updated successfully!';
      else:
          $response = 'Unable to update a element!';
      endif;
    else:
      $response = 'Invalid input parameters';
    endif;
    return new ResourceResponse($response);
  }
  
}
