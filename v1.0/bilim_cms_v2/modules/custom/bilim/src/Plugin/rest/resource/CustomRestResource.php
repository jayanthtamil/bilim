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
 *   id = "custom_rest_resource",
 *   label = @Translation("Custom rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/custom/{id}"
 *   }
 * )
 */
class CustomRestResource extends ResourceBase {

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
      'media_param' => $n->get('field_custom_media_params')->value,
      'cust_prereq_param' => $n->get('field_custom_prereq_params')->value,
      'isevaluation' => $n->get('field_custom_isevaluation')->value,
      'files_param' => $n->get('field_custom_files_param')->value,
      'props_param' => $n->get('field_custom_prop_params')->value,
      'hasassociatecontent' => $n->get('field_custom_hasassociatecontent')->value,
      'note' => $n->get('field_custom_note')->value,
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
      $n->set('field_custom_isevaluation',$data->isevaluation);
      $n->set('field_custom_eval_param',$data->eval_param);
      $n->set('field_custom_media_params',$data->media_param);
      $n->set('field_custom_prereq_params',$data->cust_prereq_param);
      $n->set('field_custom_files_param',$data->files_param);
      $n->set('field_custom_prop_params',$data->props_param);
      $n->set('field_custom_navigation_template',$data->nav_temp);
      $n->set('field_custom_hasassociatecontent',$data->hasassociatecontent);
      $n->set('field_custom_duration',$data->duration);
      $n->setRevisionUserId($uid);

      $bcr = new BilimController();
      if(strtolower($data->hasassociatecontent) == 'true'){
	$pChFld = 'field_custom_children';
        $chldIds = $bcr->getElemChildren($nid,$pChFld);
        $f_id = (int)$bcr->getChildrenByType($chldIds,'associate_content');
	if($f_id == 0){ 
		$sc = Node::create([
		  'type' => 'simple_content',
		  'title' => 'Simple content',
		]);
		$sc->save();

		$associate_content = Node::create([
			'type' => 'associate_content',
			'title' => 'Associate content',
			'field_associate_content_children' => $sc->id()
		]);
		$associate_content->save();

		$ch_ids = $n->get('field_custom_children')->getValue();	
		$ac_id = [['target_id' => $associate_content->id() ]];
		$n->set('field_custom_children',array_merge($ch_ids,$ac_id));
	}
      }

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
