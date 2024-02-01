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
use Drupal\Core\File\FileSystemInterface;
use Psr\Log\LoggerInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "course_rest_resource",
 *   label = @Translation("Course rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/course_tree/{id}",
 *     "create" = "/api/course_tree/duplicate/{id}"
 *   }
 * )
 */
class CourseRestResource extends ResourceBase {

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

  /***
   * Get Children from the node ids
   * 
   * Retruns a array of children for nodes
   * 
   * course - Strucutre | Starting | Annexes | CourseMedias
   * 
   * 
   */

  public function getNodeChildren($param,$folder_name) {

      $style_path = '';
      if($folder_name != ''):
        $folder_path = 'public://'.$folder_name;
        $style_path = \Drupal::service('file_system')->realpath($folder_path);
      endif;

      $result['style_path'] = $style_path;
      //$nids = explode(',',$param);
      $nodes = Node::loadMultiple($param);
      $nres = array();
      foreach ($nodes as $n) {
        $type = $n->getType();
        $chld = '';
        $chld_elem = [];

        if($type == 'starting'):
          $chld = $n->get('field_str_children')->getValue();
        elseif($type == 'structure'):
          $chld = $n->get('field_struct_children')->getValue();
        elseif($type == 'annexes'):
          $chld = $n->get('field_anx_children')->getValue();
        endif;
        $bcr = new BilimController();

        if(!empty($chld)):
          $chld_str = $bcr->getTargetIds($chld);
          $chld_elem = $bcr->getCourseChildrenByChildren($chld_str);
        endif;
        if($type == 'structure'){
        	$da = array(
                    'id' => $n->id(),
                    'type' => $n->getType(),
                    'name' => $n->title->value,
                    'styleSummary' => $n->get('field_struct_style_summary')->value,
                    'children' => $chld_elem
                  );
        }
        else {
					$da = array(
                    'id' => $n->id(),
                    'type' => $n->getType(),
                    'name' => $n->title->value,
                    'children' => $chld_elem
                  );
        }
        $result[$type][] = $da;
      }
      return $result; 
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
    $c_node = Node::load($nid);
    $owner_id = $c_node->getOwnerId();
    $user_id = \Drupal::currentUser()->id();
    /* if($owner_id != $user_id):
      $result = array(
        'error_no' => '1001',
        'error' => 'Logged user not a part of this course'
      );
    else: */
      $bcr = new BilimController();
      $query = \Drupal::entityQuery('node')
                ->condition('type', 'style')
                ->condition('field_s_courses', $nid);
      $nids = $query->execute();
      $folder_name = '';
      if(!empty($nids)):
        foreach($nids as $sid):
            $sn = Node::load($sid);
            $stitle = $sn->getTitle();
            $folder_name = str_replace(' ', '-', $stitle);
        endforeach;
      endif;
      
      //get Course Children
      $crs_children_str = $bcr->getElemChildren($nid,'field_crs_children');
      $result = $this->getNodeChildren($crs_children_str,$folder_name); 
    //endif;
    
    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
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
    $file_system = \Drupal::service('file_system');
    $nid = \Drupal::request()->get('id');
    $uid = $this->currentUser->id();
    $datas = \Drupal::request()->getContent();
    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;
    $n = Node::load($nid);
    $n->setRevisionUserId($uid);
    $n->save();

    // clone a node
    $p_cloned_node = $n->createDuplicate();
    $par_type = $p_cloned_node->getType();
    $p_ctitle = $p_cloned_node->getTitle();
    //$p_cloned_node->setTitle($p_ctitle.'-duplicated');
    if(isset($data->actiontype) && $data->actiontype == "CopyFrom") {
      $p_cloned_node->setTitle($p_ctitle);
    } else {
      $p_cloned_node->setTitle($p_ctitle.'-duplicated');
    }
    $chld = [];
    $orig_pp_chld = [];

    if($par_type == 'screen'):
      $pconn = $p_cloned_node->get('field_scr_connections')->getValue();
      $chld_targets = $n->get('field_scr_children')->getValue();
      $chld = array_column($chld_targets,'target_id');
      // remove home key
      if(!empty($pconn)):
        foreach($pconn as $pc):
          if($pc['value'] != 'home'):
            $pa[] = $pc['value'];
          endif;
        endforeach;
        $p_cloned_node->set('field_scr_connections',$pa);
      endif;

    elseif($par_type == 'page'):
      $pconn = $p_cloned_node->get('field_page_connections')->getValue();
      // remove home key
      if(!empty($pconn)):
        foreach($pconn as $pc):
          if($pc['value'] != 'home'):
            $pa[] = $pc['value'];
          endif;
        endforeach;
        $p_cloned_node->set('field_page_connections',$pa);
      endif;

    endif;

   /* if($par_type == 'question'){
	$p_html = $p_cloned_node->get('field_ques_html')->getString();	
	$p_html_arr = $bcr->htmlStringToArray($p_html);
	$p_cloned_node->save();

	$cm_ids = \Drupal::entityQuery('node')
		->condition('type', 'course_medias')
		->condition('field_cm_course_element',$nid)
		->execute();

	$cm_cloned_ids = [];

	if(!empty($cm_ids)){			
      	  $cm_nodes = Node::loadMultiple($cm_ids);

      	  foreach($cm_nodes as $cm){
            $cm_cloned_node = $cm->createDuplicate();
            //$cm_title = str_replace($oldUniqueId, $newUniqueId, $file_name);
            //$cm_cloned_node->setTitle($cm_title);
            //$cm_cloned_node->set('field_cm_subtitle',$cm_title);
            //$cm_cloned_node->set('field_cm_file_path',$dest_src);
            //$cm_cloned_node->set('field_cm_course_element',$p_cloned_node->id());
            $cm_cloned_node->save();
	    $cm_cloned_ids[] = $cm_cloned_node->id();
      	  }
    	}

        foreach($p_html_arr as $key => $p_html_str){
	  if(stristr($p_html_str, 'src')){
	    $doc = new \DOMDocument;
	    $doc->loadHTML($p_html_arr[$key], LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
	    $xpath = new \DOMXPath($doc);
	    $src = $xpath->evaluate("string(//@src)");
	    $blm_editor_options = $xpath->evaluate("string(//@blm-editor-options)");

	    if($src){
		    $file_name = end(explode('default/files/editor/',$src));
	    	    $src = 'public://editor/' . $file_name; 
		    $oldUniqueId = explode('-',$file_name)[0];
		    $newUniqueId = uniqid(); 
		    $dest_src = str_replace($oldUniqueId, $newUniqueId, $src); 
		    $full_path = \Drupal::service('file_system')->realpath($src);
		    $dest_path = \Drupal::service('file_system')->realpath($dest_src);
		    $file_save = \Drupal::service('file_system')->copy($full_path, $dest_path, FileSystemInterface::EXISTS_RENAME);
		    $p_html_arr[$key] = str_replace($oldUniqueId, $newUniqueId, $p_html_arr[$key]);

 		    if(!empty($cm_cloned_ids)){
			$cloned_cms = Node::loadMultiple($cm_cloned_ids);
			$fileName = explode('-',$file_name)[1];
			foreach($cloned_cms as $cloned_cm){
			  $cloned_cm->set('field_cm_file_path',$dest_src);
           		  $cloned_cm->set('field_cm_course_element',$p_cloned_node->id());
			  $cloned_cm->save();
	
			  if($blm_editor_options){
			    $old_media_id = json_decode($blm_editor_options)->media->id;
			    $p_html_arr[$key] = str_replace($old_media_id, $cloned_cm->id(), $p_html_arr[$key]);
		    	  }
			} 
		    }

		    

		    
	    }
	  }
       	}

        $new_p_html = implode('', $p_html_arr);
	$p_cloned_node->set('field_ques_html', $new_p_html);
    }*/

    $p_cloned_node->save();
  
    $last_pnode_id = $p_cloned_node->id();
    //$cloned_ids = $bcr->cloneElemChildren($last_pnode_id);
	if(isset($data->actiontype) && $data->actiontype == "CopyFrom" && isset($data->ncourseId) && $data->ncourseId != ""){
      //$ncourseId = $data->ncourseId;
      $cloned_ids = $bcr->cloneElemChildrenCourseTree($last_pnode_id,$data->ncourseId);
    }else {
      $cloned_ids = $bcr->cloneElemChildrenCourseTree($last_pnode_id);
    }
    $result = array();
    $result['node_duplicated'] = array(
      'nid' => $p_cloned_node->id(),
      'type' => $p_cloned_node->getType(),
      'name' => $p_cloned_node->getTitle(),
        
    );

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
	  /*if(strpos($cm_type,'image') !== false){
	    $cm_elements = $cm->get('field_cm_course_element')->getValue();
	    $elem_arr = array_column($cm_elements,'target_id');
	    if(!empty($elem_arr)){
	      $elem_arr[] = $p_cloned_node->id();
	      $cm->set('field_cm_course_element',$elem_arr);
	      $cm->save();
	    }
	  }*/
	 
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
	    
	    foreach($cloned_ids as $cid){
	    	$updateChldHtml = $bcr->updateTempHtml($cid, $mdata);
	    }
	  
	}

    }

    //action id
    $keys = array_keys($cloned_ids);
		$values = array_values($cloned_ids);
			
    $dup_pnode = Node::load($last_pnode_id);
    /*if($dup_pnode->getType() == 'screen'){
      $scr_html = $dup_pnode->get('field_scr_html')->getString();
      $scr_chld = $dup_pnode->get('field_scr_children')->getValue();
      $scr_chld = array_column($scr_chld,'target_id');
      $scr_html = str_replace($chld,$scr_chld,$scr_html);
      $dup_pnode->set('field_scr_html',$scr_html);
      $dup_pnode->save();
    }
    elseif($dup_pnode->getType() == 'page'){
     $orig_page_targets = $n->get('field_page_children')->getValue();
     $orig_page_pp_ids = array_column($orig_page_targets,'target_id');
     $orig_pp_nodes = Node::loadMultiple($orig_page_pp_ids);
     $orig_pp_nodes = array_values($orig_pp_nodes);

     $pp_node_ids = $dup_pnode->get('field_page_children')->getValue();
     $pp_node_ids = array_column($pp_node_ids,'target_id');
     $pp_nodes = Node::loadMultiple($pp_node_ids);
     $pp_nodes = array_values($pp_nodes);
     foreach($pp_nodes as $key => $pp_node){
       if($orig_pp_nodes[$key]->getType() == 'partpage'){
         $orig_pp_chld = $orig_pp_nodes[$key]->get('field_pp_children')->getValue();
         $orig_pp_chld = array_column($orig_pp_chld,'target_id');
         $pp_html = $pp_node->get('field_pp_html')->getString();
         $pp_chld = $pp_node->get('field_pp_children')->getValue();
         $pp_chld = array_column($pp_chld,'target_id');
         $pp_html = str_replace($orig_pp_chld,$pp_chld,$pp_html);
         $pp_node->set('field_pp_html',$pp_html);
         $pp_node->save();
       }
     }
    }
    elseif($dup_pnode->getType() == 'question'){
      $chld_targets = $n->get('field_ques_children')->getValue();
      $chld = array_column($chld_targets,'target_id');
      $ques_html = $dup_pnode->get('field_ques_html')->getString();
      $ques_chld = $dup_pnode->get('field_ques_children')->getValue();
      $ques_chld = array_column($ques_chld,'target_id');
      $ques_html = str_replace($chld,$ques_chld,$ques_html);
      $dup_pnode->set('field_ques_html',$ques_html);
      $dup_pnode->save();
    }
    elseif($dup_pnode->getType() == 'chapter'){
    	$chld_targets = $n->get('field_chap_children')->getValue();
      $chld = array_column($chld_targets,'target_id');
	    
      $chap_chld = $dup_pnode->get('field_chap_children')->getValue();
      $chap_chld = array_column($chap_chld,'target_id');
     
      $chap_eval = $dup_pnode->get('field_chap_eval_param')->getString();
			$chap_eval = str_replace($chld, $chap_chld, $chap_eval);
		  $dup_pnode->set('field_chap_eval_param',$chap_eval);
		  
		  $dup_chap_prereq = $dup_pnode->get('field_chap_cust_prereq_param')->getString();
  		$dup_chap_prereq = str_replace($chld, $chap_chld,$dup_chap_prereq);
  		$dup_pnode->set('field_chap_cust_prereq_param',$dup_chap_prereq);
      $dup_pnode->save();
    
    }*/
    
    if($dup_pnode->getType() == 'screen'){
        $scr_html = $dup_pnode->get('field_scr_html')->getString();
        $scr_html = str_replace($keys,$values,$scr_html); //later remove
      //  $scr_html = $data->dhtml; //override html later add
        $dup_pnode->set('field_scr_html',$scr_html);
        
        $scr_prereq = $dup_pnode->get('field_scr_cust_prereq_param')->getString();
        $scr_prereq = str_replace($keys,$values,$scr_prereq);
        $dup_pnode->set('field_scr_cust_prereq_param',$scr_prereq);
        
        $scr_html_param = $dup_pnode->get('field_scr_html_params')->getString();
        $scr_html_param = str_replace($keys,$values,$scr_html_param);
        $dup_pnode->set('field_scr_html_params',$scr_html_param);
      }
      elseif($dup_pnode->getType() == 'page'){
        $orig_page_targets = $n->get('field_page_children')->getValue();
        $orig_page_pp_ids = array_column($orig_page_targets,'target_id');
        $orig_pp_nodes = Node::loadMultiple($orig_page_pp_ids);
        $orig_pp_nodes = array_values($orig_pp_nodes);
        
        $pp_node_ids = $dup_pnode->get('field_page_children')->getValue();
        $pp_node_ids = array_column($pp_node_ids,'target_id');
        $pp_nodes = Node::loadMultiple($pp_node_ids);
        $pp_nodes = array_values($pp_nodes);        
        
        foreach($pp_nodes as $key => $pp_node){
        	if($pp_node->getType() == 'partpage'){
		        $pp_html = $pp_node->get('field_pp_html')->getString();
		        $pp_html = str_replace($keys,$values,$pp_html);
		        $pp_node->set('field_pp_html',$pp_html);
		        
		        $dup_pp_prereq = $pp_node->get('field_pp_cust_prereq_params')->getString();
        		$dup_pp_prereq = str_replace($keys,$values,$dup_pp_prereq);
        		$pp_node->set('field_pp_cust_prereq_params',$dup_pp_prereq);
        		
        		$dup_pp_html_param = $pp_node->get('field_pp_html_params')->getString();
						$dup_pp_html_param = str_replace($keys,$values,$dup_pp_html_param);
						$pp_node->set('field_pp_html_params',$dup_pp_html_param);
						
		        $pp_node->save();
          }
       	}
       	
       	$dup_page_eval = $dup_pnode->get('field_page_eval_param')->getString();
        $dup_page_eval = str_replace($keys,$values,$dup_page_eval);
        $dup_pnode->set('field_page_eval_param',$dup_page_eval);
        
       	$dup_page_prereq = $dup_pnode->get('field_page_cust_prereq_params')->getString();
        $dup_page_prereq = str_replace($keys,$values,$dup_page_prereq);
        $dup_pnode->set('field_page_cust_prereq_params',$dup_page_prereq);
        
        $dup_page_bgm = $dup_pnode->get('field_page_bgm_param')->getString();
        $dup_page_bgm = str_replace($keys,$values,$dup_page_bgm);
        $dup_pnode->set('field_page_bgm_param',$dup_page_bgm);
        
        $dup_page_props = $dup_pnode->get('field_page_prop_params')->getString();
        $dup_page_props = str_replace($keys,$values,$dup_page_props);
        $dup_pnode->set('field_page_prop_params',$dup_page_props);
      }
      elseif($dup_pnode->getType() == 'partpage'){
        $pp_html = $dup_pnode->get('field_pp_html')->getString();
        $pp_html = str_replace($keys,$values,$pp_html);
        $dup_pnode->set('field_pp_html',$pp_html);
        
        $dup_pp_prereq = $dup_pnode->get('field_pp_cust_prereq_params')->getString();
    		$dup_pp_prereq = str_replace($keys,$values,$dup_pp_prereq);
    		$dup_pnode->set('field_pp_cust_prereq_params',$dup_pp_prereq);
    		
    		$dup_pp_html_param = $dup_pnode->get('field_pp_html_params')->getString();
    		$dup_pp_html_param = str_replace($keys,$values,$dup_pp_html_param);
    		$dup_pnode->set('field_pp_html_params',$dup_pp_html_param);
      }
      elseif($dup_pnode->getType() == 'simple_partpage'){
        $spp_html = $dup_pnode->get('field_spp_html')->getString();
        $spp_html = str_replace($keys,$values,$spp_html);
        $dup_pnode->set('field_spp_html',$spp_html);
        
        $dup_spp_prereq = $dup_pnode->get('field_spp_cust_prereq_params')->getString();
    		$dup_spp_prereq = str_replace($keys,$values,$dup_spp_prereq);
    		$dup_pnode->set('field_spp_cust_prereq_params',$dup_spp_prereq);
    		
    		$dup_spp_html_param = $dup_pnode->get('field_spp_html_params')->getString();
    		$dup_spp_html_param = str_replace($keys,$values,$dup_spp_html_param);
    		$dup_pnode->set('field_spp_html_params',$dup_spp_html_param);
      }
      elseif($dup_pnode->getType() == 'question'){
        $ques_html = $dup_pnode->get('field_ques_html')->getString();
        $ques_html = str_replace($keys,$values,$ques_html);
        $dup_pnode->set('field_ques_html',$ques_html);
        
        $dup_ques_prereq = $dup_pnode->get('field_ques_cust_prereq_param')->getString();
    		$dup_ques_prereq = str_replace($keys,$values,$dup_ques_prereq);
    		$dup_pnode->set('field_ques_cust_prereq_param',$dup_ques_prereq);
    		
    		$dup_ques_html_param = $dup_pnode->get('field_ques_html_params')->getString();
    		$dup_ques_html_param = str_replace($keys,$values,$dup_ques_html_param);
    		$dup_pnode->set('field_ques_html_params',$dup_ques_html_param);
      }
      elseif($dup_pnode->getType() == 'chapter'){
        $chap_eval = $dup_pnode->get('field_chap_eval_param')->getString();
				$chap_eval = str_replace($keys, $values, $chap_eval);
			  $dup_pnode->set('field_chap_eval_param',$chap_eval);
			  
			  $dup_chap_prereq = $dup_pnode->get('field_chap_cust_prereq_param')->getString();
    		$dup_chap_prereq = str_replace($keys,$values,$dup_chap_prereq);
    		$dup_pnode->set('field_chap_cust_prereq_param',$dup_chap_prereq);
    		
    		$dup_chap_html_param = $dup_pnode->get('field_chap_prop_params')->getString();
    		$dup_chap_html_param = str_replace($keys,$values,$dup_chap_html_param);
    		$dup_pnode->set('field_chap_prop_params',$dup_chap_html_param);
      }
      elseif($dup_pnode->getType() == 'custom'){
			  $dup_cust_prereq = $dup_pnode->get('field_custom_prereq_params')->getString();
    		$dup_cust_prereq = str_replace($keys,$values,$dup_cust_prereq);
    		$dup_pnode->set('field_custom_prereq_params',$dup_cust_prereq);
      }
      elseif($dup_pnode->getType() == 'simple_content'){
			  $dup_sc_html = $dup_pnode->get('field_sc_html')->getString();
    		$dup_sc_html = str_replace($keys,$values,$dup_sc_html);
    		$dup_pnode->set('field_sc_html',$dup_sc_html);
    		
    		$dup_sc_html_param = $dup_pnode->get('field_sc_html_params')->getString();
    		$dup_sc_html_param = str_replace($keys,$values,$dup_sc_html_param);
    		$dup_pnode->set('field_sc_html_params',$dup_sc_html_param);
      }
      elseif($dup_pnode->getType() == 'simple_page'){
        $spp_node_ids = $dup_pnode->get('field_sp_children')->getValue();
        $spp_node_ids = array_column($spp_node_ids,'target_id');
        $spp_nodes = Node::loadMultiple($spp_node_ids);
        $spp_nodes = array_values($spp_nodes);
        
        foreach($spp_nodes as $key => $spp_node){
        	if($spp_node->getType() == 'simple_partpage'){
		        $spp_html = $spp_node->get('field_spp_html')->getString();
		        $spp_html = str_replace($keys,$values,$spp_html);
		        $spp_node->set('field_spp_html',$spp_html);
		        
		        $dup_spp_prereq = $spp_node->get('field_spp_cust_prereq_params')->getString();
        		$dup_spp_prereq = str_replace($keys,$values,$dup_spp_prereq);
        		$spp_node->set('field_spp_cust_prereq_params',$dup_spp_prereq);
		        
		       	$dup_spp_html_param = $spp_node->get('field_spp_html_params')->getString();
						$dup_spp_html_param = str_replace($keys,$values,$dup_spp_html_param);
						$spp_node->set('field_spp_html_params',$dup_spp_html_param);
						
						$spp_node->save();
          }
       	}

        $dup_sp_bgm = $dup_pnode->get('field_sp_background_parameters')->getString();
        $dup_sp_bgm = str_replace($keys,$values,$dup_sp_bgm);
        $dup_pnode->set('field_sp_background_parameters',$dup_sp_bgm);
      }
      
      $dup_pnode->save();
    

    if(!empty($data)):
      //$parent = $data->parent;
      if(isset($data->actiontype) && $data->actiontype == "CopyFrom" && isset($data->nparent) && $data->nparent != ""){
        $parent = $data->nparent;
      }else {
        $parent = $data->parent;
      }
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
      //$n_pos = $c_pos+1;
      if(isset($data->actiontype) && $data->actiontype == "CopyFrom")
      {
        $n_pos = 0;
      } else {
        $n_pos = $c_pos+1;
      }
      $new_upd_chld = $bcr->array_insert($ex_chld, $n_pos, $new_chld);
      
      // new child to parent
      $pn->set($pfield, $new_upd_chld);
      $pn->save();
			
    endif;  
    $response = new ResourceResponse((array)$result);
    return $response; 
    // return new ResourceResponse('Node Duplicated!');
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

    $uid = $this->currentUser->id();
    $nid = \Drupal::request()->get('id');
    $datas = \Drupal::request()->getContent();

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;

    $response = '';
    if(!empty($data)):
      $id = $data->id;
      $cncs = array();
      $n = Node::load($id);     
      if(!empty($data->connections)):
          foreach($data->connections as $cn):
              $cncs[] = array(
                  "target_id" => $cn
              );
          endforeach;
      endif;
      $n->set('field_scr_connections',$cncs);
      $n->setRevisionUserId($uid);
      $res = $n->save();
      if($res > 0):
          $response = 'element updated successfully!';
      else:
          $response = 'Unable to create a children!';
      endif;
    else:
      $response = 'Invalid input parameters';
    endif;
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
    $nid = \Drupal::request()->get('id');
    $uid = $this->currentUser->id();
    $datas = \Drupal::request()->getContent();

    $media_ids = \Drupal::entityQuery('node')
	->condition('type', 'course_medias')
	->condition('field_cm_course_element',$nid)
	->execute();

    $node = Node::load($nid);

    if($node->getType() == 'page'){
      $pp_values = $node->get('field_page_children')->getValue();

      if(!empty($pp_values)){
        $pp_ids = array_column($pp_values,'target_id');     
        $cm_ids = \Drupal::entityQuery('node')
	  ->condition('type', 'course_medias')
	  ->condition('field_cm_course_element',$pp_ids,'IN')
	  ->execute();

        $media_ids = array_merge($media_ids, $cm_ids);

      }
    }    
    elseif($node->getType() == 'simple_page'){
      $pp_values = $node->get('field_sp_children')->getValue();

      if(!empty($pp_values)){
        $pp_ids = array_column($pp_values,'target_id');     
        $cm_ids = \Drupal::entityQuery('node')
	      ->condition('type', 'course_medias')
	      ->condition('field_cm_course_element',$pp_ids,'IN')
	      ->execute();

        $media_ids = array_merge($media_ids, $cm_ids);
      }
    }
   			
    

    if($media_ids){
	$medias = Node::loadMultiple($media_ids);
		  
	foreach($medias as $media){
	  $cm_elem_values = $media->get('field_cm_course_element')->getValue();
	  $cm_elem_ids = array_column($cm_elem_values,'target_id');
	  if(count($cm_elem_ids) > 1){
	    if($node->getType() == 'page'){
              $elems = Node::loadMultiple($cm_elem_ids);
	      $elems = array_values($elems);
	      if($elems[0]->getType() == 'partpage'){
	        foreach($pp_ids as $pp_id){
	          $key = array_search($pp_id,$cm_elem_ids);
	          unset($cm_elem_values[$key]);
	        }
		$media->set('field_cm_course_element',$cm_elem_values);
	        $media->save();
	      }
	      else{
	        $key = array_search($nid,$cm_elem_ids);
	        unset($cm_elem_values[$key]);
	        $media->set('field_cm_course_element',$cm_elem_values);
	      }
	    }
	    else{
	      $key = array_search($nid,$cm_elem_ids);
	      unset($cm_elem_values[$key]);
	      $media->set('field_cm_course_element',$cm_elem_values);
	    }
	    $media->save();
	  }
	  else{

           $cm_elem_values = $media->get('field_cm_file_path')->getValue();
 	   $dir = $cm_elem_values[0]['value'];      
	   $final_file_url1 = file_create_url($dir);
	   $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
	   $final_file_path11 = $_SERVER['DOCUMENT_ROOT'].$final_file_path1;
           $this->deleteAll($final_file_path11);
	    $media->delete();
	  }
       }
    }
	
    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;

    $bcr = new BilimController();
    $response = 'Nodes Deleted';
    
    //retrieve target element
    $n = Node::load($nid);
    $type = $n->getType();
    if($type != 'simple_content'):

      //remove target id from parent
      if(!empty($data)):
        $parent = $data->parent;
        $pn = Node::load($parent);
        $ptype = $pn->getType();
        $pfield = $bcr->getNodeRelFieldName($ptype);
        $bcr->removeChildFromNode($pn, $pfield, $nid);
        $pn->setRevisionUserId($uid);
        $pn->save();
      endif;

      //delete the children elements
      $field = $bcr->getNodeRelFieldName($type);
      $crs_children = $bcr->getElemDeleteChildren($nid,$field);
      
    endif;

    //delete the target element
    
    if($node->getType() == 'simple_page'){
      $pp_values = $node->get('field_sp_children')->getValue();
      if(!empty($pp_values[0]['target_id'])){
        $cm_ids = \Drupal::entityQuery('node')
	      ->condition('type', 'course_medias')
	      ->condition('field_cm_course_element',$pp_values[0]['target_id'],'IN')
	      ->execute();
        $media_ids = array_merge($media_ids, $cm_ids);
      }
    }
$n->delete();
    return new JsonResponse($response);
  }

  //BILIM-555

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
