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
 *   id = "simple_content_rest_resource",
 *   label = @Translation("Simple Content rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/simple_content/{id}",
 *     "create" = "/api/simple_content/new/{id}"
 *   }
 * )
 */
class SimpleContentRestResource extends ResourceBase {

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
      'title2' => $n->get('field_sc_title2')->value,
      'description' => $n->get('field_sc_desc')->value,
      'metadatas' => $n->get('field_sc_metadatas')->value,
      'media_param' => $n->get('field_sc_media_params')->value,
      'summary' => $n->get('field_sc_summary')->value,
      'note' => $n->get('field_sc_note')->value,
      'temp' => $n->get('field_sc_template')->value,
      'temp_type' => $n->get('field_sc_template_type')->value,
      'bgm_image' => $n->get('field_sc_bgm_image')->value,
      'bgm_param' => $n->get('field_sc_bgm_params')->value,
      'bgm_sound' => $n->get('field_sc_bgm_sound')->value,
      'content_medias' => $n->get('field_sc_content_medias')->value,
      'html' => $n->get('field_sc_html')->value,
      'duration' => $n->get('field_sc_duration')->value,
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
	  $n->set('field_sc_title2',$data->title2);
      $n->set('field_sc_desc',$data->description);
      $n->set('field_sc_metadatas',$data->metadatas);
     // $n->set('field_sc_note',$data->note);
      //$n->set('field_sc_template',$data->template);
      //$n->set('field_sc_template_type',$data->template_type);
      $n->set('field_sc_bgm_image',$data->bgm_image);
      $n->set('field_sc_bgm_params',$data->bgm_params);
      $n->set('field_sc_bgm_sound',$data->bgm_sound);
      $n->set('field_sc_media_params',$data->media_param);
      $n->set('field_sc_duration',$data->duration);
      $n->setRevisionUserId($uid);
      $res = $n->save();


      if($res > 0):
          $response = 'Simple content updated successfully!';
      else:
          $response = 'Unable to update a simple content!';
      endif;
    else:
      $response = 'Invalid input parameters';
    endif;
    return new ResourceResponse($response);
  }
  
}
