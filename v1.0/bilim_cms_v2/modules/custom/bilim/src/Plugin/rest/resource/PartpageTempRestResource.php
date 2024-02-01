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
use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "parpage_temp_rest_resource",
 *   label = @Translation("Partpage template rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/pp_template/{id}",
 *     "create" = "/api/pp_template/new/{id}"
 *   }
 * )
 */
class PartpageTempRestResource extends ResourceBase {

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
    $bcr = new BilimController(); 
    $nid = \Drupal::request()->get('id');
    $pn = Node::load($nid);
    //$isTemplate = \Drupal::request()->query->get('template');
    $file_system = \Drupal::service('file_system');

    $ptype = $pn->getType();
    if($ptype == 'page'):
        $chld = $pn->field_page_children->getValue();
        $chlds = $bcr->getTargetIds($chld);

        $result = array();
        $nodes = Node::loadMultiple($chlds);

        if(!empty($nodes)):
            foreach($nodes as $n):
              $type = $n->getType();
              if($type != 'feedback' && $type != 'associate_content'){
                $phtml = '';
                $template = array();
                $pp_temp_id = $n->get('field_pp_template')->getValue();
                if($pp_temp_id[0]['target_id']):
                  $pp_id = $pp_temp_id[0]['target_id'];
                  $pp_n = Node::load($pp_id);
                  $ppt_type = $pp_n->getType();

                  if($ppt_type == 'template'):
                      if (!$pp_n->get('field_t_course_context')->isEmpty()):
                          $field_t_course_context = $pp_n->get('field_t_course_context')->getValue();  
                            foreach($field_t_course_context as $f){                             
                              $details[]= $f['value']; 
                              }
                              if(!empty($details)){
                                $course_context = '['.implode(',',$details).']';
                              }                             
                      endif;

                    if (!$pp_n->get('field_t_thumbnaildark')->isEmpty()):
                      $d_file = $pp_n->field_t_thumbnaildark->entity->getFileUri();
                      $dark_uri = file_create_url($d_file);
                    endif;

                    if (!$pp_n->get('field_t_thumbnaillight')->isEmpty()):
                      $l_file = $pp_n->field_t_thumbnaillight->entity->getFileUri();
                      $light_uri = file_create_url($l_file);
                    endif;

                  elseif($ppt_type == 'templatevariant'):

                    if (!$pp_n->get('field_tv_thumbnaildark')->isEmpty()):
                      $d_file = $pp_n->field_tv_thumbnaildark->entity->getFileUri();
                      $dark_uri = file_create_url($d_file);
                    endif;

                    if (!$pp_n->get('field_tv_thumbnaillight')->isEmpty()):
                      $l_file = $pp_n->field_tv_thumbnaillight->entity->getFileUri();
                      $light_uri = file_create_url($l_file);
                    endif;

                  endif;

                  $template = array(
                    'id' => $pp_n->id(),
                    'name' => $pp_n->getTitle(),
                    'dark_url' => $dark_uri,
                    'light_url' => $light_uri,
                    'course_context' => $course_context
                  );
                endif;

                $phtml = $n->get('field_pp_html')->getString();
                $pp_type = $n->get('field_pp_template_type')->getString();
				
				/*if($isTemplate == "true"){
					if($ppt_type == 'template'){
						$html_file_id = $pp_n->get('field_t_htmlnode')->getValue()[0]['target_id'];
					}
					elseif($ppt_type == 'templatevariant'){
						$html_file_id = $pp_n->get('field_tv_htmlnode')->getValue()[0]['target_id'];
					}
					if($html_file_id){
					  $file_html = File::load($html_file_id);
					  $htmlFileUri = $file_html->getFileUri();
					  $pp_n_html = file_get_contents($file_system->realpath($htmlFileUri),FILE_USE_INCLUDE_PATH);
					  $template['html'] = $pp_n_html;
					}
				}
				else{
					$template['html'] = '';
				}*/

				//$linkedIds = $n->get('field_pp_linked_elements')->getValue();
				//$linkedIds = array_column($linkedIds, 'target_id');

                $result['templates'][] = array(
                    'nid' => $n->id(),
		    'type' => $n->getType(),
                    'template-type' => $pp_type,
                    'name' => $n->getTitle(),
                    'summary' => $n->get('field_pp_summary')->getString(), 
                    'template' => $template,
                    'html' => $phtml,
                    'htmlParam' => $n->get('field_pp_html_params')->getString(),
                    //'linkedIds' => $linkedIds
                    //'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    //'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                );
        			}
            endforeach;
        endif;
        //$result['htmlDoc'] = $pn->field_page_html->getValue();

    elseif($ptype == 'simple_page'):
        $chld = $pn->field_sp_children->getValue();
        $chlds = $bcr->getTargetIds($chld);
        
        $result = array();
        $nodes = Node::loadMultiple($chlds);
        
        if(!empty($nodes)):
            foreach($nodes as $n):
                $type = $n->getType();
                $phtml = '';
                $template = array();
                $pp_temp_id = $n->field_spp_template->getValue();
                if($pp_temp_id[0]['target_id']):
                    $pp_id = $pp_temp_id[0]['target_id'];
                    $pp_n = Node::load($pp_id);
                    $ppt_type = $pp_n->getType();
                    
                    if($ppt_type == 'template'):
                    
                        if (!$pp_n->get('field_t_thumbnaildark')->isEmpty()):
                            $d_file = $pp_n->field_t_thumbnaildark->entity->getFileUri();
                            $dark_uri = file_create_url($d_file);
                        endif;
                        
                        if (!$pp_n->get('field_t_thumbnaillight')->isEmpty()):
                            $l_file = $pp_n->field_t_thumbnaillight->entity->getFileUri();
                            $light_uri = file_create_url($l_file);
                        endif;
                    
                    elseif($ppt_type == 'templatevariant'):
                    
                        if (!$pp_n->get('field_tv_thumbnaildark')->isEmpty()):
                            $d_file = $pp_n->field_tv_thumbnaildark->entity->getFileUri();
                            $dark_uri = file_create_url($d_file);
                        endif;
                        
                        if (!$pp_n->get('field_tv_thumbnaillight')->isEmpty()):
                            $l_file = $pp_n->field_tv_thumbnaillight->entity->getFileUri();
                            $light_uri = file_create_url($l_file);
                        endif;
                
                    endif;
                    
                    $template = array(
                        'id' => $pp_n->id(),
                        'name' => $pp_n->getTitle(),
                        'dark_url' => $dark_uri,
                        'light_url' => $light_uri
                    );
                endif;
                
                $phtml = $n->get('field_spp_html')->getString();
                $pp_type = $n->get('field_spp_template_type')->getString();
                
				/*if($isTemplate == "true"){
if($ppt_type == 'template'){
						$html_file_id = $pp_n->get('field_t_htmlnode')->getValue()[0]['target_id'];
					}
					elseif($ppt_type == 'templatevariant'){
						$html_file_id = $pp_n->get('field_tv_htmlnode')->getValue()[0]['target_id'];
					}
					if($html_file_id){
					  $file_html = File::load($html_file_id);
					  $htmlFileUri = $file_html->getFileUri();
					  $pp_n_html = file_get_contents($file_system->realpath($htmlFileUri),FILE_USE_INCLUDE_PATH);
					  $template['html'] = $pp_n_html;
					}
				}
				else{
					$template['html'] = '';
				}*/
				
				//$linkedIds = $n->get('field_pp_linked_elements')->getValue();
				//$linkedIds = array_column($linkedIds, 'target_id');
				
                $result['templates'][] = array(
                    'nid' => $n->id(),
		    'type' => $n->getType(),
                    'template-type' => $pp_type,
                    'name' => $n->getTitle(),
                    'summary' => $n->get('field_spp_summary')->value,
                    'template' => $template,
                    'html' => $phtml,
                    'htmlParam' => $n->get('field_spp_html_params')->getString(),
                    //'linkedIds' => $linkedIds
                    //'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    //'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                );
            endforeach;
        endif;
        //$result['htmlDoc'] = $pn->field_sp_html->getValue();

    elseif($ptype == 'screen'):
        $temp_id = $pn->field_scr_template->getValue();
        if($temp_id[0]['target_id']):
          $tid = $temp_id[0]['target_id'];
          $tn = Node::load($tid);
          $temp_type = $tn->getType();
          if($temp_type == 'template'):

            if (!$tn->get('field_t_course_context')->isEmpty()):
              $field_t_course_context = $tn->get('field_t_course_context')->getValue();  
                foreach($field_t_course_context as $f){                             
                  $details[]= $f['value']; 
                  }
                  if(!empty($details)){
                    $course_context = '['.implode(',',$details).']';
                  }                             
          endif;

            if (!$tn->get('field_t_thumbnaildark')->isEmpty()):
              $d_file = $tn->field_t_thumbnaildark->entity->getFileUri();
              $dark_uri = file_create_url($d_file);
            endif;
            if (!$tn->get('field_t_thumbnaillight')->isEmpty()):
              $l_file = $tn->field_t_thumbnaillight->entity->getFileUri();
              $light_uri = file_create_url($l_file);
            endif;

          elseif($temp_type == 'templatevariant'):

            if (!$tn->get('field_tv_thumbnaildark')->isEmpty()):
              $d_file = $tn->field_tv_thumbnaildark->entity->getFileUri();
              $dark_uri = file_create_url($d_file);
            endif;

            if (!$tn->get('field_tv_thumbnaillight')->isEmpty()):
              $l_file = $tn->field_tv_thumbnaillight->entity->getFileUri();
              $light_uri = file_create_url($l_file);
            endif;

          endif;

          $template = array(
            'id' => $tn->id(),
            'name' => $tn->getTitle(),
            'dark_url' => $dark_uri,
            'light_url' => $light_uri,
            'course_context' => $course_context
          );

        endif;
		
		/*if($isTemplate == "true"){
			if($temp_type == 'template'){
				$html_file_id = $tn->get('field_t_htmlnode')->getValue()[0]['target_id'];
			}
			elseif($temp_type == 'templatevariant'){
				$html_file_id = $tn->get('field_tv_htmlnode')->getValue()[0]['target_id'];
			}
                                if($html_file_id){
				  $file_html = File::load($html_file_id);
				  $htmlFileUri = $file_html->getFileUri();
				  $pp_n_html = file_get_contents($file_system->realpath($htmlFileUri),FILE_USE_INCLUDE_PATH);
				  $template['html'] = $pp_n_html;
				}
		}
		else{
			$template['html'] = '';
		}*/
        
        //$linkedIds = $pn->get('field_scr_linked_elements')->getValue();
				//$linkedIds = array_column($linkedIds, 'target_id');
        
        $result['templates'] = array(
          'nid' => $pn->id(),
          'type' => $pn->getType(),
          'name' => $pn->getTitle(),
          'template-type' => $pn->get('field_scr_template_type')->getString(),
          'summary' => $pn->get('field_scr_summary')->getString(),
          'html' => $pn->get('field_scr_html')->getString(),
          'template' => $template,
          'htmlParam' => $pn->get('field_scr_html_params')->getString(),	
          //'linkedIds' => $linkedIds
          //'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
          //'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
        );
        //$result['htmlDoc'] = $pn->field_scr_html_doc->getValue();

    elseif($ptype == 'question'):

      $temp_id = $pn->field_ques_template->getValue();
      if($temp_id[0]['target_id']):
        $tid = $temp_id[0]['target_id'];
        $tn = Node::load($tid);
        $temp_type = $tn->getType();
        if($temp_type == 'template'):
        
          if (!$tn->get('field_t_thumbnaildark')->isEmpty()):
            $d_file = $tn->field_t_thumbnaildark->entity->getFileUri();
            $dark_uri = file_create_url($d_file);
          endif;
          if (!$tn->get('field_t_thumbnaillight')->isEmpty()):
            $l_file = $tn->field_t_thumbnaillight->entity->getFileUri();
            $light_uri = file_create_url($l_file);
          endif;

        elseif($temp_type == 'templatevariant'):

          if (!$tn->get('field_tv_thumbnaildark')->isEmpty()):
            $d_file = $tn->field_tv_thumbnaildark->entity->getFileUri();
            $dark_uri = file_create_url($d_file);
          endif;

          if (!$tn->get('field_tv_thumbnaillight')->isEmpty()):
            $l_file = $tn->field_tv_thumbnaillight->entity->getFileUri();
            $light_uri = file_create_url($l_file);
          endif;

        endif;
        
        $template = array(
          'id' => $tn->id(),
          'name' => $tn->getTitle(),
          'dark_url' => $dark_uri,
          'light_url' => $light_uri
        );
      endif;
	  
	 /* if($isTemplate == "true"){

		  if($temp_type == 'template'){
				$html_file_id = $tn->get('field_t_htmlnode')->getValue()[0]['target_id'];
			}
			elseif($temp_type == 'templatevariant'){
				$html_file_id = $tn->get('field_tv_htmlnode')->getValue()[0]['target_id'];
			}
				if($html_file_id){
				  $file_html = File::load($html_file_id);
				  $htmlFileUri = $file_html->getFileUri();
				  $pp_n_html = file_get_contents($file_system->realpath($htmlFileUri),FILE_USE_INCLUDE_PATH);
				  $template['html'] = $pp_n_html;
				}
	  }
	  else{
		$template['html'] = '';
	  }*/
	  
	  	//$linkedIds = $pn->get('field_ques_linked_elements')->getValue();
			//$linkedIds = array_column($linkedIds, 'target_id');
      
      $result['templates'] = array(
        'nid' => $pn->id(),
        'type' => $pn->getType(),
        'name' => $pn->getTitle(),
        'template-type' => $pn->get('field_ques_template_type')->getString(),
        'summary' => '', 
        'html' => $pn->get('field_ques_html')->getString(),
        'template' => $template,
        'htmlParam' => $pn->get('field_ques_html_params')->getString(),
        //'linkedIds' => $linkedIds
        //'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
        //'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
      );
      //$result['htmlDoc'] = $pn->field_ques_html_doc->getValue();
      
    elseif($ptype == 'simple_content'):
      $temp_id = $pn->field_sc_template->getValue();
      if($temp_id[0]['target_id']):
          $tid = $temp_id[0]['target_id'];
          $tn = Node::load($tid);
          $temp_type = $tn->getType();
          if($temp_type == 'template'):
          
              if (!$tn->get('field_t_thumbnaildark')->isEmpty()):
                  $d_file = $tn->field_t_thumbnaildark->entity->getFileUri();
                  $dark_uri = file_create_url($d_file);
              endif;
              if (!$tn->get('field_t_thumbnaillight')->isEmpty()):
                  $l_file = $tn->field_t_thumbnaillight->entity->getFileUri();
                  $light_uri = file_create_url($l_file);
              endif;
          
          elseif($temp_type == 'templatevariant'):
          
              if (!$tn->get('field_tv_thumbnaildark')->isEmpty()):
                  $d_file = $tn->field_tv_thumbnaildark->entity->getFileUri();
                  $dark_uri = file_create_url($d_file);
              endif;
              
              if (!$tn->get('field_tv_thumbnaillight')->isEmpty()):
                  $l_file = $tn->field_tv_thumbnaillight->entity->getFileUri();
                  $light_uri = file_create_url($l_file);
              endif;
          
          endif;
          
          $template = array(
              'id' => $tn->id(),
              'name' => $tn->getTitle(),
              'dark_url' => $dark_uri,
              'light_url' => $light_uri
          );
      
      endif;
      
	  /*if($isTemplate == "true"){
		  if($temp_type == 'template'){
				$html_file_id = $tn->get('field_t_htmlnode')->getValue()[0]['target_id'];
			}
			elseif($temp_type == 'templatevariant'){
				$html_file_id = $tn->get('field_tv_htmlnode')->getValue()[0]['target_id'];
			}
				if($html_file_id){
				  $file_html = File::load($html_file_id);
				  $htmlFileUri = $file_html->getFileUri();
				  $pp_n_html = file_get_contents($file_system->realpath($htmlFileUri),FILE_USE_INCLUDE_PATH);
				  $template['html'] = $pp_n_html;
				}
	  }
	  else{
		$template['html'] = '';
	  }*/
	  
			//$linkedIds = $pn->get('field_sc_linked_elements')->getValue();
			//$linkedIds = array_column($linkedIds, 'target_id');
      
      $result['templates'] = array(
          'nid' => $pn->id(),
          'type' => $pn->getType(),
          'name' => $pn->getTitle(),
          'template-type' => $pn->get('field_sc_template_type')->getString(),
          'summary' => $pn->get('field_sc_summary')->value,
          'html' => $pn->get('field_sc_html')->getString(),
          'template' => $template,
          'htmlParam' => $pn->get('field_sc_html_params')->getString(),
          //'linkedIds' => $linkedIds
          //'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
          //'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
      );
      //$result['htmlDoc'] = $pn->field_sc_html_doc->getValue();

    endif; 

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }

  /**
   * Responds to POST requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';
    $bcr = new BilimController();

    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();
    $file_system = \Drupal::service('file_system');

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;

    $action = 'new';
    if(!empty($data->action)): 
      $action = 'duplicate';
    endif;

    if(isset($action) && $action == 'duplicate'){

      $n = Node::load($nid);
      // clone a node
      $p_cloned_node = $n->createDuplicate();
      $par_type = $p_cloned_node->getType();
      $p_ctitle = $p_cloned_node->getTitle();
      $p_cloned_node->setTitle($p_ctitle.'-duplicated');
      $p_cloned_node->save();
      $last_pnode_id = $p_cloned_node->id();
      $bcr->cloneElemChildren($last_pnode_id);

      //get Course medias
      $cm_ids = \Drupal::entityQuery('node')
	->condition('type', 'course_medias')
	->condition('field_cm_course_element',$nid)
	->execute();

      //Add elements to course medias
      if(!empty($cm_ids)){
	      $course_medias = Node::loadMultiple($cm_ids);
	      foreach($course_medias as $cm){
          $cm_type = $cm->get('field_cm_type')->getString();
	 
	    $dup_cm = $cm->createDuplicate();
	    $dup_file_path = $dup_cm->get('field_cm_file_path')->getString();
	    $file_name = end(explode('/',$dup_file_path));
	    $oldUniqueId = current(explode('_',$file_name));
	    $newUniqueId = uniqid(); 
	    $dest_src = str_replace($oldUniqueId, $newUniqueId, $dup_file_path); 
	    $full_path = $file_system->realpath($dup_file_path);
	    $dest_path = $file_system->realpath($dest_src);

	    if(strpos($cm_type,'zip') !== false){
	      $file_save = $bcr->recurseCopy($full_path, $dest_path);
	    }
	    elseif(strpos($cm_type,'video') !== false || strpos($cm_type,'audio') !== false || strpos($cm_type,'octet') !== false || strpos($cm_type,'stream') !== false){
	      $dup_cm->save();
	      $wav_json_path = $dup_cm->get('field_cm_wav_json_path')->getString();
	      if($wav_json_path){
	        $dest_json_path = str_replace($cm->id(), $dup_cm->id(), $wav_json_path); 
	        $src_json_path = $file_system->realpath($wav_json_path);
	        $dest_json_realpath = $file_system->realpath($dest_json_path);
	        $file_copy = $file_system->copy($src_json_path,
$dest_json_realpath, FileSystemInterface::EXISTS_RENAME);
		$dup_cm->set('field_cm_wav_json_path',$dest_json_path);
	      }
	      $mp3_path = $dup_cm->get('field_cm_audio_path')->getString();
	      if($mp3_path){
	        $dest_mp3_path = str_replace($cm->id(), $dup_cm->id(), $mp3_path); 
	        $src_mp3_path = $file_system->realpath($mp3_path);
	        $dest_mp3_realpath = $file_system->realpath($dest_mp3_path);
	        $file_copy = $file_system->copy($src_mp3_path,
$dest_mp3_realpath, FileSystemInterface::EXISTS_RENAME);
		$dup_cm->set('field_cm_audio_path',$dest_mp3_path);
	      }
	      $file_save = $file_system->copy($full_path, $dest_path, FileSystemInterface::EXISTS_RENAME);
	    }
	    else{	
	      $file_save = $file_system->copy($full_path, $dest_path, FileSystemInterface::EXISTS_RENAME);
	    }

	    if(strpos($cm->getTitle(), $nid) !== false){
	      $old_title = $cm->getTitle();
	      $new_title = str_replace($nid, $last_pnode_id, $old_title);
	      $dup_cm->setTitle($new_title);
	      $dup_cm->set('field_cm_subtitle',$new_title);
	    }
		
	    $dup_cm->set('field_cm_file_path',$dest_src);
	    $dup_cm->set('field_cm_course_element',$p_cloned_node->id());
	    $dup_cm->save();

	    
	    //Update Templates HTML & Media Params
	    $mdata = [];
	    $mdata = [
				'cm_id' => $cm->id(),
				'cloned_id' => $dup_cm->id(),
				'old_path' => $oldUniqueId,
				'new_path' => $newUniqueId
	    ];
	    $updateHtml = $bcr->updateTempHtml($last_pnode_id, $mdata);
	  
	}

      }

      //Updating action id
      if($n->getType() == 'partpage'){
		    $orig_pp_chld = $n->get('field_pp_children')->getValue();
		    $orig_pp_chld = array_column($orig_pp_chld,'target_id');

		    $pp_node = Node::load($last_pnode_id);
		    
		    $pp_chld = $pp_node->get('field_pp_children')->getValue();
		    $pp_chld = array_column($pp_chld,'target_id');
		    
		    //echo '<pre>';print_r($data->dhtml);die;
		    $pp_html = $pp_node->get('field_pp_html')->getString(); //later remove
        //$pp_html = $data->dhtml; //later add
		    $pp_html = str_replace($orig_pp_chld,$pp_chld,$pp_html);
		    $pp_node->set('field_pp_html',$pp_html);
		    
		    $pp_html_param = $pp_node->get('field_pp_html_params')->getString();
		    $pp_html_param = str_replace($orig_pp_chld,$pp_chld,$pp_html_param);
		    $pp_node->set('field_pp_html_params',$pp_html_param);
		    
		    $pp_node->save();
      }
      elseif($n->getType() == 'simple_partpage'){
      	$orig_spp_chld = $n->get('field_spp_children')->getValue();
		    $orig_spp_chld = array_column($orig_spp_chld,'target_id');

		    $spp_node = Node::load($last_pnode_id);
		   
		    $spp_chld = $spp_node->get('field_spp_children')->getValue();
		    $spp_chld = array_column($spp_chld,'target_id');
		    
		    $spp_html = $spp_node->get('field_spp_html')->getString();
		    $spp_html = str_replace($orig_spp_chld,$spp_chld,$spp_html);
		    $spp_node->set('field_spp_html',$spp_html);
		    
		    $spp_html_param = $spp_node->get('field_spp_html_params')->getString();
		    $spp_html_param = str_replace($orig_pp_chld,$pp_chld,$spp_html_param);
		    $spp_node->set('field_spp_html_params',$spp_html_param);
		    
		    $spp_node->save();
      }
      

      if(!empty($data)){
        $parent = $data->parent;
        $pn = Node::load($parent);
        $ptype = $pn->getType();
        $pfield = $bcr->getNodeRelFieldName($ptype);

        $ex_chld = $pn->get($pfield)->getValue();

        // find current position of the parent node
        $chld_str = $bcr->getTargetIds($ex_chld);
        $c_pos = array_search($nid,$chld_str);

        // add new node
        $new_chld = array(
          "target_id" => $last_pnode_id
        );
        $n_pos = $c_pos+1;
        $new_upd_chld = $bcr->array_insert($ex_chld, $n_pos, $new_chld);

        /*if($ptype == 'partpage'):
          $pn->set('field_page_html',$data->htmlDoc);
        elseif($ptype == 'screen'):
          $pn->set('field_scr_html_doc',$data->htmlDoc);
        elseif($ptype == 'question'):
          $pn->set('field_ques_html_doc',$data->htmlDoc);
        endif;*/
        
        // new child to parent
        $pn->set($pfield, $new_upd_chld);
        $pn->setRevisionUserId($uid);
        $pn->save();
      }
      $response = 'element duplicated successfully!';

    }
    
    return new ResourceResponse($response);
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
    $bcr = new BilimController();

    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();

    $data = array();
    if(!empty($datas)){
      $data = json_decode($datas);
    }

    if(!empty($data)){
        
      $count = count($data->templates);
      
      $n = Node::load($nid);
      $pType = $n->getType();

      if($pType == 'page'){
      	$pg_cncs_value = $n->get('field_page_connections')->getValue();
      	$pg_cncs = array_column($pg_cncs_value,'value');
      	if(in_array('home',$pg_cncs)){
      		$akey = array_search('home',$pg_cncs);
      		unset($pg_cncs[$akey]);
      	}
        $new_chld = array();
        //for($i=0;$i<$count;$i++):
        foreach($data->templates as $t_data){

          $pp_id = (int)$t_data->id;

          if($pp_id > 0){

            $sn = Node::load($pp_id);
            $pp_cncs = $sn->get('field_pp_connections')->getValue();
            if(empty($pp_cncs)){
	            $sn->set('field_pp_connections', $pg_cncs);
            }
            $sn->setTitle($t_data->name);
            $sn->set('field_pp_html',$t_data->html);
            $sn->set('field_pp_template',$t_data->template_id);
            $sn->set('field_pp_summary', $t_data->summary);
            $sn->set('field_pp_template_type',$t_data->template_type);
           	$sn->set('field_pp_html_params', $t_data->htmlParam);
            $sn->setRevisionUserId($uid);
            $sn->save(); 
            $new_chld[] = array(
              'target_id' => $pp_id
            );
          }
          else{

            $da = array(
              'type' => 'partpage',
              'title' => $t_data->name,
              'field_pp_html' => $t_data->html,
              'field_pp_template' => $t_data->template_id,
              'field_pp_connections' => $pg_cncs,
	      			'field_pp_summary' => $t_data->summary,
              'field_pp_template_type' => $t_data->template_type,
              'field_pp_html_params' => $t_data->htmlParam
            ); 

            $tnode = Node::create($da);
            $tnode->set('uid',[['target_id' => $uid]]);
            $tnode->save(); 
            $saved_id = $tnode->id();

            $new_chld[] = array(
              'target_id' => $saved_id
            );
          }
        }
	
	$ex_chld = $n->get('field_page_children')->getValue();
	$ftype = 'feedback';
        $ac_type = 'associate_content';
        $chlds = array_column($ex_chld, 'target_id');
	$fid = $bcr->getChildrenByType($chlds,$ftype);
        $ac_id = $bcr->getChildrenByType($chlds,$ac_type);

	if($fid){
		$fid_arr = array('target_id' => $fid);
		$new_chld[] = $fid_arr;
	}
        if($ac_id){
	  $ac_id_arr = array('target_id' => $ac_id);
	  $new_chld[] = $ac_id_arr;
	}

        $n->set('field_page_children',$new_chld);
        
        //$n->set('field_page_template',$data['temp_id']);
        //$n->set('field_page_html',$data->htmlDoc);
        $n->setRevisionUserId($uid);
        $n->save();  


      }	
      elseif($pType == 'simple_page'){
        
        $new_chld = array();
        //for($i=0;$i<$count;$i++):
        foreach($data->templates as $t_data){
            $pp_id = (int)$t_data->id;
            
            if($pp_id > 0){
            
                $sn = Node::load($pp_id);
                $sn->setTitle($t_data->name);
                $sn->set('field_spp_html',$t_data->html);
                $sn->set('field_spp_template',$t_data->template_id);
                $sn->set('field_spp_summary', $t_data->summary);
                $sn->set('field_spp_template_type',$t_data->template_type);
                $sn->set('field_spp_html_params', $t_data->htmlParam);
                $sn->setRevisionUserId($uid);
                $sn->save();
                $new_chld[] = array(
                    'target_id' => $pp_id
                );
            }
            else{
            
                $da = array(
                    'type' => 'simple_partpage',
                    'title' => $t_data->name,
                    'field_spp_html' => $t_data->html,
                    'field_spp_template' => $t_data->template_id,
                    'field_spp_summary' => $t_data->summary,
                    'field_spp_template_type' => $t_data->template_type,
                    'field_spp_html_params' => $t_data->htmlParam
                );
                
                $tnode = Node::create($da);
                $tnode->set('uid',[['target_id' => $uid]]);
                $tnode->save();
                $saved_id = $tnode->id();
                
                $new_chld[] = array(
                    'target_id' => $saved_id
                );
            
            }
        }
        
        //$n->set('field_page_template',$data['temp_id']);
        $n->set('field_sp_children',$new_chld);
        //$n->set('field_sp_html',$data->htmlDoc);
        $n->setRevisionUserId($uid);
        $n->save(); 
        
      }
      elseif($pType == 'screen'){

        $n->set('field_scr_html',$data->html);
        $n->set('field_scr_template_type',$data->template_type);
        $n->set('field_scr_template',$data->template_id);
        $n->set('field_scr_html_params', $data->htmlParam);
       //$n->set('field_scr_html_doc',$data->htmlDoc);
        $n->setRevisionUserId($uid);
        $n->save();
      }
      elseif($pType == 'simple_content'){
        
        $n->set('field_sc_html',$data->html);
        $n->set('field_sc_template_type',$data->template_type);
        $n->set('field_sc_template',$data->template_id);
        $n->set('field_sc_html_params', $data->htmlParam);
        //$n->set('field_sc_html_doc',$data->htmlDoc);
        $n->setRevisionUserId($uid);
        $n->save();
      }
      elseif($pType == 'question'){

        $n->set('field_ques_html',$data->html);
        $n->set('field_ques_template_type',$data->template_type);
        $n->set('field_ques_template',$data->template_id);
        $n->set('field_ques_html_params', $data->htmlParam);
        //$n->set('field_ques_linked_elements', $data->linkedIds);
        //$n->set('field_ques_html_doc',$data->htmlDoc);
        $n->setRevisionUserId($uid);
        $n->save();
      }

      $response = 'element updated successfully!';
    }
    else{
      $response = 'Invalid input parameters';
    }
    return new ResourceResponse($response);
  } 

  /**
   * Responds to DELETE requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function delete() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $bcr = new BilimController();
    $response = 'Nodes Deleted';

    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;
	
    $media_ids = \Drupal::entityQuery('node')
			->condition('type', 'course_medias')
			->condition('field_cm_course_element',$nid)
			->execute();			
	
	if($media_ids){
		$medias = Node::loadMultiple($media_ids);
		  
		foreach($medias as $media){
     //fix for BIL555
     $image_ids = $media->field_cm_file_path->getValue();       
     $dir =$image_ids[0]['value'];     
     $final_file_url1 = file_create_url($dir);
     $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
     $final_file_path11 = $_SERVER['DOCUMENT_ROOT'].$final_file_path1;
     $this->deleteAll($final_file_path11);
     $media->delete();
		}
	}
	
    //retrieve target element
    $n = Node::load($nid);
    $type = $n->getType();
    
    $pfield = 'field_page_children';
    //remove target id from parent
    if(!empty($data)):
      $parent = $data->parent;
      $pn = Node::load($parent);
      $ptype = $pn->getType();
      
      //$pfield = $bcr->getNodeRelFieldName($ptype);
      $bcr->removeChildFromNode($pn, $pfield, $nid);

      /*if($ptype == 'partpage'):
        $pn->set('field_page_html',$data->htmlDoc);
      elseif($ptype == 'screen'):
        $pn->set('field_scr_html_doc',$data->htmlDoc);
      elseif($ptype == 'question'):
        $pn->set('field_ques_html_doc',$data->htmlDoc);
      endif;*/
      
      $pn->setRevisionUserId($uid);
      $pn->save();
    endif;

    //delete the target element
    $n->delete();
    return new JsonResponse($response);
  }

  public function deleteAll($str) {
      
    // Check for files
    if (is_file($str)) {
          
        // If it is file then remove by
        // using unlink function
        return unlink($str);
    }
      
    // If it is a directory.
    elseif (is_dir($str)) {
          
        // Get the list of the files in this
        // directory
        $scan = glob(rtrim($str, '/').'/*');
          
        // Loop through the list of files
        foreach($scan as $index=>$path) {
              
            // Call recursive function
           $this->deleteAll($path);
        }
          
        // Remove the directory itself
        return @rmdir($str);
    }
}	
  
}
