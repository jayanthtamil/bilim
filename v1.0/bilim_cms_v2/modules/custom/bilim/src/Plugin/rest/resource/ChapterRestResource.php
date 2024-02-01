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
      'title2' => $n->get('field_chap_title2')->value,
      'description' => $n->get('field_chap_description')->value,
      'metadatas' => $n->get('field_chap_metadatas')->value,
      'note' => $n->get('field_chap_note')->value,
      'nav_temp' => $n->get('field_chap_nav_temp')->value,
      'eval_param' => $n->get('field_chap_eval_param')->value,
      'cust_comp' => ($n->get('field_chap_cust_comp')->value == '1') ? true : false,
      'cust_comp_param' => $n->get('field_chap_cust_comp_param')->value,
      'cust_prereq_param' => $n->get('field_chap_cust_prereq_param')->value,
      'media_param' => $n->get('field_chap_media_params')->value,
      'props_param' => $n->get('field_chap_prop_params')->value,
      'isevaluation' => $n->get('field_chap_isevaluation')->value,
      'hasfeedback' => $n->get('field_chap_hasfeedback')->value,
      'stylesummary' => $n->get('field_style_summary')->value,
      'screenonsummary' => $n->get('field_screen_on_summary')->value,
      'hasassociatecontent' => $n->get('field_chap_hasassociatecontent')->value,
      'direct_evaluation' => $n->get('field_direct_evaluation')->value,
      'duration' => $n->get('field_chap_duration')->value,
      'theme_ref' => $n->get('field_chap_theme_ref')->value,
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
    $param = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();
    $data = array();
    if(!empty($param)):
      $data = json_decode($param);
    endif;

    $associate_content = [];
    
	
    $response = '';
    if(!empty($data)):
      $cncs = array();
      $n = Node::load($nid);     
      
      $n->setTitle($data->title);
      $n->set('field_chap_title2',$data->title2);
      $n->set('field_chap_description',$data->description);
      $n->set('field_chap_metadatas',$data->metadatas);
      $n->set('field_chap_note',$data->note);
      $n->set('field_chap_nav_temp',$data->nav_temp);
      $n->set('field_chap_eval_param',$data->eval_param);
      $n->set('field_chap_cust_comp', ($data->cust_comp == 'true') ? 1 : 0);
      $n->set('field_chap_cust_comp_param',$data->cust_comp_param);
      $n->set('field_chap_isevaluation',$data->isevaluation);
      $n->set('field_chap_hasfeedback',$data->hasfeedback);
      $n->set('field_chap_duration',$data->duration);
      $n->set('field_style_summary',$data->stylesummary);
      $n->set('field_screen_on_summary',$data->screenonsummary);
      $n->set('field_chap_hasassociatecontent',$data->hasassociatecontent);
      $n->set('field_direct_evaluation',$data->direct_evaluation);
      $n->set('field_chap_media_params',$data->media_param);
      $n->set('field_chap_cust_prereq_param',$data->cust_prereq_param);
      $n->set('field_chap_prop_params',$data->props_param);
      $n->set('field_chap_theme_ref',$data->theme_ref);
      $n->setRevisionUserId($uid);
      
      if(strtolower($data->isevaluation) == 'false'){
      	$chld_ids = $n->get('field_chap_children')->getValue();
      	if($chld_ids){
      		foreach($chld_ids as $key => $chld_id){
      			$chld_n = Node::load($chld_id['target_id']);
      			if($chld_n && $chld_n->getType() == 'feedback'){
      				$chld_n->delete();
      				unset($chld_ids[$key]);
      			}
      		}
      	}
      	$n->set('field_chap_children',$chld_ids);
      }
      

      
      $bcr = new BilimController();

      if(strtolower($data->hasfeedback) == 'true' &&  (strtolower($data->isevaluation) == 'true' || $data->isevaluation == 'placementTest')):        
        $ftype = 'feedback';
        $pch_fld = 'field_chap_children';
        $chlds = $bcr->getElemChildren($nid,$pch_fld);
        $fid = (int)$bcr->getChildrenByType($chlds,$ftype);
        if($fid == 0):
          $ftitle = $ftype;
          $bcr->addChildElem($nid,$chlds,$ftype,$ftitle,$pch_fld);
        endif;
      endif;

      if(strtolower($data->hasassociatecontent) == 'true'){
	$pChFld = 'field_chap_children';
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

		$ch_ids = $n->get('field_chap_children')->getValue();	
		$ac_id = [['target_id' => $associate_content->id() ]];
		$n->set('field_chap_children',array_merge($ch_ids,$ac_id));
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
