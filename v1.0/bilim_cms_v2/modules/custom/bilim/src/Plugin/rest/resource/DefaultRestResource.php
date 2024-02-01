<?php

namespace Drupal\bilim\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
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
 *   id = "default_rest_resource",
 *   label = @Translation("Default rest resource"),
 *   uri_paths = {
 *     "create" = "/api/create/elem",
 *     "canonical" = "/api/elem/rename/{id}"
 *   }
 * )
 */
class DefaultRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;


  /**
  * Constructs a new DefaultRestResource object.
  *
  * @param array $configuration
  *   A configuration array containing information about the plugin instance.
  * @param string $plugin_id
  *   The plugin_id for the plugin instance.
  * @param mixed $plugin_definition
  *   The plugin implementation definition.
  * @param array $serializer_formats
  *   The available serialization formats.
  * @param \Psr\Log\LoggerInterface $logger
  *   A logger instance.
  * @param \Drupal\Core\Session\AccountProxyInterface $current_user
  *   A current user instance.
  */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
     AccountProxyInterface $current_user) {
     parent::__construct($configuration, $plugin_id, 
     $plugin_definition, $serializer_formats, $logger);
  
    $this->currentUser = $current_user;
  }

  /**
  * {@inheritdoc}
  */
  public static function create(ContainerInterface $container, array 
  $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('import_json_test'),
      $container->get('current_user')
    );
  }


  /**
   * Responds to POST requests.
   *
   * @param string $payload
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post() {

      // You must to implement the logic of your REST Resource here.
      // Use current user after pass authentication to validate access.
      $bcr = new BilimController();
      $datas = \Drupal::request()->getContent();
      $uid = \Drupal::currentUser()->id();

      $data = array();
      if(!empty($datas)){
        $data = json_decode($datas);
      }

      $response = '';
      $type = $data->type;
      $title = $data->title;
      $summary = $data->summary;
      $pos = $data->position;
      
      $styleSummary = '';
      if($type == 'chapter'){
          $pid = $data->parent;
          if(!empty($pid)){
            $parent = Node::load($pid);
            $p_type = $parent->getType();
            /*if($p_type == 'chapter'){
              $styleSummary = 'false';
            }
            else {
              $styleSummary = 'true';
            }*/
          }
            
          $da = array(
            'type' => $type,
            'title' => $title,
            'field_chap_isevaluation' => $data->isevaluation,
            'field_chap_hasfeedback' => $data->hasfeedback,
            'field_direct_evaluation' => $data->direct_evaluation,
            'field_style_summary' => $styleSummary,
            'field_screen_on_summary' => '',
            'field_chap_eval_param' => $data->eval_param
          );
      }
      else{
        $da = array(
          'type' => $type,
          'title' => $title,
        );
      }
      
      if($summary){
      	$summary_field = $bcr->getFieldNameByKey($type, 'summary');
      	if($summary_field){
      		$da[$summary_field] = $summary; 
      	}
      }

      $node = Node::create($da);
      $node->set('uid',[['target_id' => $uid]]);
      $res = $node->save(); 

      if($res > 0){
        $nid = $node->id();
        if($type == 'chapter'){
          $cnid = Node::load($nid);
          $c_filed_name = $bcr->getNodeRelFieldName($type);
          $nfield = $cnid->get('field_chap_children')->getValue();
        }

        $pnode = Node::load($data->parent);
        
        $ptype = $pnode->getType();
        $pfield = $bcr->getNodeRelFieldName($ptype);
        
        $ex_chld = $pnode->get($pfield)->getValue();

        if($type == 'chapter'){
          if($data->hasfeedback == 'true' && (strtolower($data->isevaluation) == 'true' || $data->isevaluation == 'placementTest')){
            $chlds = $bcr->getElemChildren($nid,$c_filed_name);
            $ftitle = 'feedback';
            $ftype = 'feedback';
            $bcr->addChildElem($nid,$chlds,$ftype,$ftitle,$c_filed_name);
          }
        }
        

        if(!empty($ex_chld)){
          $f_type = 'feedback';
          if($pos){
          	$new_chld = array_merge([['target_id' => $nid]], $ex_chld);
          }
          else{
          	$new_chld = $bcr->arrayMnp($ex_chld,$nid);
          }

          $ex_children = $bcr->getTargetIds($ex_chld);
          $f_id = $bcr->getChildrenByType($ex_children,$f_type);
          if(!empty($f_id)){
        		if (($x = array_search($f_id, $ex_children)) !== false) {
              if(!$pos){
              	$pnode->get($pfield)->removeItem($x);
              	$pnode->get($pfield)->appendItem(['target_id' => $nid]);
              	$pnode->save();
		            $rm_ex_chlds = $pnode->get($pfield)->getValue();
		            $rm_ex_res = $bcr->getTargetIds($rm_ex_chlds);
		            $f_position = sizeof($rm_ex_res);
								$new_chld = $bcr->array_insert($rm_ex_res, $f_position, $f_id);
              }
              	
            }
          }
        }
        else{
          $new_chld = array(
            "target_id" => $nid
          );
        }
        
        $pnode->set($pfield, $new_chld);
        $pnode->setRevisionUserId($uid);
        $pnode->save();
        
        //chapter has parent to sort feedback.
        if($ptype == 'chapter'){
          if(!empty($ex_chld)){
            $ftype = 'feedback';
            $chlds = $bcr->getElemChildren($data->parent,$pfield);
            $fid = $bcr->getChildrenByType($chlds,$ftype);
            $ac_type = 'associate_content';
            $ac_id = $bcr->getChildrenByType($chlds,$ac_type);
            if($fid != '' || $ac_id != ''){
              if (($key = array_search($fid, $chlds)) !== false) {
                $pnode->get($pfield)->removeItem($key);
                $pnode->setRevisionUserId($uid);
                $pnode->save();
                $rm_chlds = $pnode->get($pfield)->getValue();
                $rm_res = $bcr->getTargetIds($rm_chlds);
              }
							else{
								$rm_res = $chlds;
							}
              if($ac_id && ($i = array_search($ac_id, $rm_res)) !== false){
                $pnode->get($pfield)->removeItem($i);
                $pnode->setRevisionUserId($uid);
                $pnode->save();
                $rm_chlds = $pnode->get($pfield)->getValue();
                $rm_res = $bcr->getTargetIds($rm_chlds);
	      			}
	      
              $position = sizeof($rm_res);
              $new_chld = $bcr->array_insert($rm_res, $position, $fid);
              if($ac_id){
							  $new_chld = $bcr->array_insert($rm_res, $position+1, $ac_id);
							}
              $pnode->set($pfield, $new_chld);
              $pnode->setRevisionUserId($uid);
              $pnode->save();
            }
          }
        }

        $response = 'Children created successfully! ';
      }
      else{
        $response = 'Unable to create a children!';
      }
      
      return new ResourceResponse($response);
  }


  /**
   * Responds to PATCH requests.
   *
   * @param string $payload
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function patch() {
    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;
    
    $node = Node::load($nid);
    $node->set('title',$data->title);
    $node->setRevisionUserId($uid);
    $res = $node->save(); 
    $response = 'node not renamed yet!';
    if($res):
      $response = 'node renamed!';
    endif;
    return new ResourceResponse($response);
  }

}
