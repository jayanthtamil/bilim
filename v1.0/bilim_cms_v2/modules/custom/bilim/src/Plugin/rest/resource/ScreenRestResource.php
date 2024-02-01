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
 *   id = "screen_rest_resource",
 *   label = @Translation("Screen rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/screen/{id}",
 *     "create" = "/api/screen/new/{id}"
 *   }
 * )
 */
class ScreenRestResource extends ResourceBase {

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
    $nid = \Drupal::request()->get('id');
    $n = Node::load($nid);
    $ownerUser = $n->getOwner()->getAccountName();
    $revisionUser = $n->getRevisionUser()->get('name')->value;

    //$user = User::load(\Drupal::currentUser()->id());
    //$name = $user->get('name')->value;
    //$node->set('field_last_edited', $name);

    $result = array(
      'nid' => $n->id(),
      'type' => $n->getType(),
      'title' => $n->getTitle(),
      'title2' => $n->get('field_scr_title2')->value,
	  'summary' => $n->get('field_scr_summary')->value,
      'description' => $n->get('field_scr_description')->value,
      'metadatas' => $n->get('field_scr_metadatas')->value,
      'note' => $n->get('field_scr_note')->value,
      'nav_temp' => $n->get('field_scr_navigation_template')->value,
      'cust_comp' => ($n->get('field_scr_custom_completion')->value == '1') ? true : false,
      'cust_comp_param' => $n->get('field_scr_cust_comp_param')->value,
      'cust_prereq_param' => $n->get('field_scr_cust_prereq_param')->value,
      'bgm_image' => $n->get('field_scr_backgroundimage')->value,
      'bgm_param' => $n->get('field_scr_background_parameters')->value,
      'media_param' => $n->get('field_scr_media_params')->value,
      'scr_connections' => $n->get('field_scr_connections')->value,
      'duration' => $n->get('field_scr_duration')->value,
      'created' => gmdate('Y-m-d H:i:s',$n->created->value),
      'changed' => gmdate('Y-m-d H:i:s',$n->changed->value),
      'changed_by' => $ownerUser,
      'modified_by' => $revisionUser ? $revisionUser : $ownerUser
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
  public function patch() {
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    $nid = \Drupal::request()->get('id');
    $uid = $this->currentUser->id();

    $param = \Drupal::request()->getContent();
    $data = array();
    if(!empty($param)):
      $data = json_decode($param);
    endif;

    $response = '';
    if(!empty($data)):
      $n = Node::load($nid);     
      
      $n->setTitle($data->title);
      $n->set('field_scr_title2',$data->title2);
      $n->set('field_scr_description',$data->description);
      $n->set('field_scr_metadatas',$data->metadatas);
      //$n->set('field_scr_note',$data->note);
      $n->set('field_scr_navigation_template',$data->nav_temp);
      $n->set('field_scr_custom_completion', ($data->cust_comp == 'true') ? 1 : 0);
      $n->set('field_scr_cust_comp_param',$data->cust_comp_param);
      $n->set('field_scr_cust_prereq_param',$data->cust_prereq_param);
      //$n->set('field_scr_connections',$data->scr_connections);
      $n->set('field_scr_duration',$data->duration);
      $n->set('field_scr_backgroundimage',$data->bgm_image);
      $n->set('field_scr_background_parameters',$data->bgm_param);
      $n->set('field_scr_media_params',$data->media_param);
      //$n->set('field_scr_summary',$data->summary);
      $n->setRevisionUserId($uid);
      $res = $n->save();


      if($res > 0):
          $response = 'screen updated successfully!';
      else:
          $response = 'Unable to update a screen!';
      endif;
    else:
      $response = 'Invalid input parameters';
    endif;
    return new ResourceResponse($response);
  }
  
}
