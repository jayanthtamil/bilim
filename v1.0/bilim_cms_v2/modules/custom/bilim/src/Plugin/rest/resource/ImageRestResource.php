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
 *   id = "image_rest_resource",
 *   label = @Translation("Image rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/image/{id}"
 *   }
 * )
 */
class ImageRestResource extends ResourceBase {

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

    $result = array(
      'nid' => $n->id(),
      'type' => $n->getType(),
      'title' => $n->getTitle(),
      'title2' => $n->get('field_custom_title2')->value,
      'description' => $n->get('field_custom_description')->value,
      'metadatas' => $n->get('field_custom_metadatas')->value,
      'duration' => $n->get('field_custom_duration')->value,
      'nav_temp' => $n->get('field_custom_navigation_template')->value,
      'eval_param' => $n->get('field_custom_eval_param')->value,
      'note' => $n->get('field_custom_note')->value,
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
  public function patch() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';

    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;
    
    //$nid = $node->id();
    if(!empty($data)):
      $cncs = array();
      $n = Node::load($nid);     
      $n->setTitle($data->title);
      $n->set('field_custom_title2',$data->title2);
      $n->set('field_custom_description',$data->description);
      $n->set('field_custom_metadatas',$data->metadatas);
      $n->set('field_custom_note',$data->note);
      $n->set('field_custom_isevaluation',$data->is_evaluation);
      $n->set('field_custom_eval_param',$data->eval_param);
      $n->set('field_custom_navigation_template',$data->nav_temp);
      $n->set('field_custom_duration',$data->duration);
      $n->setRevisionUserId($uid);
      $res = $n->save();
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
