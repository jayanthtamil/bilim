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
 *   id = "course_document_rest_resource",
 *   label = @Translation("Course document rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/course_document_module/{id}"
 *   }
 * )
 */
class CourseDocumentRestResource extends ResourceBase {

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
    $uri = '';
    //$uri = file_create_url($n->field_crs_thumbnail->entity->getFileUri());
    $result = array(
      'nid' => $n->id(),
      'type' => $n->getType(),
      'title' => $n->getTitle(),
      'dispaly' => $n->get('field_crs_display')->value,
      'duration' => $n->get('field_crs_duration')->value,
      'eval_param' => $n->get('field_crs_evaluation_parameters')->value,
      'desc' => $n->get('field_crs_full_description')->value,
      'isevaluation' => $n->get('field_crs_isevaluation')->value,
      'keywords' => $n->get('field_crs_keywords')->value,
      'language' => $n->get('field_crs_language')->value,
      'metadatas' => $n->get('field_crs_metadatas')->value,
      'no_of_words' => $n->get('field_crs_no_of_words')->value,
      'objectives' => $n->get('field_crs_objectives')->value,
      'short_desc' => $n->get('field_crs_short_description')->value,
      'taxonomy' => $n->get('field_crs_taxonomy')->value,
      'thumbnail' => $uri,
      'url_edit' => $n->get('field_crs_url_edit')->value,
      'crs_version' => $n->get('field_crs_version')->value,
      'created' => gmdate('Y-m-d H:i:s',$n->created->value),
      'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
    );

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }
  
}