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
use FFMpeg\Format\Audio\Mp3;
use FFMpeg\Format\Video\X264;
use maximal\audio\Waveform;
use FFMpeg\FFProbe\DataMapping\Stream;
use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "media_rest_resource",
 *   label = @Translation("Media rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/media",
 *     "create" = "/api/media/new"
 *   }
 * )
 */
class MediaRestResource extends ResourceBase {

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
   * Responds to POST requests.
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

    //$nid = \Drupal::request()->get('id');
    $payload = \Drupal::request()->getContent();
    $uid = $this->currentUser->id();
    $file_system = \Drupal::service('file_system');
    
    $data = array();
    if(!empty($payload)):
      $data = json_decode($payload);
    endif;
    
    if(!empty($data->parent)): 
      $parent_id = $data->parent;
    endif;

    if(!empty($data->mediatype)): 
      $media_type = $data->mediatype;
    endif;  

    $parent = Node::load($parent_id);

    //print_r($parent_id);
    //echo "\n";
    //print_r($parent->getType()); die();

   /*  if(isset($data->image_id) && !empty($data->image_id)): 
      $nid = $data->image_id;
    elseif(isset($data->out) && !empty($data->out)):
      $nid = $data->out;
    endif; */


    if(isset($data->clickAction) && $data->clickAction!=""){
      $click_action = explode("-",$data->clickAction);
    }
    else {
      $click_action = array();
    }
    if(isset($data->overAction) && $data->overAction!=""){
      $over_action = explode("-",$data->overAction);
    }
    else {
      $over_action = array();
    }

    if($media_type == 'button') {
      //$nid_arr = array($data->out,$data->over,$data->click,$data->icon,$data->onclick,$data->onrollover);
      //$media_elem_arr = array("out","over","click","icon","onclick","onrollover");
      $nid_arr = array("out"=>$data->out,"over"=>$data->over,"click"=>$data->click,"icon"=>$data->icon,"clickAction"=>$click_action[1],"overAction"=>$over_action[1]);
    }
    elseif($media_type == 'regularButton') {
      //$nid_arr = array($data->out,$data->over,$data->click,$data->icon,$data->onclick,$data->onrollover);
      //$media_elem_arr = array("out","over","click","icon","onclick","onrollover");
      $nid_arr = array("icon"=>$data->icon,"clickAction"=>$click_action[1],"overAction"=>$over_action[1]);
    }
    elseif($media_type == 'flipcard') {
      //$nid_arr = array($data->recto,$data->recto_icon,$data->verso,$data->verso_icon,$data->onclick,$data->onrollover);
      //$media_elem_arr = array("recto","recto_icon","verso","verso_icon","onclick","onrollover");
      $nid_arr = array("recto"=>$data->recto,"recto_icon"=>$data->recto_icon,"verso"=>$data->verso,"verso_icon"=>$data->verso_icon,"clickAction"=>$click_action[1],"overAction"=>$over_action[1]);
    }
    elseif($media_type == 'pp_sound') {
      //$nid_arr = array($data->recto,$data->recto_icon,$data->verso,$data->verso_icon,$data->onclick,$data->onrollover);
      //$media_elem_arr = array("recto","recto_icon","verso","verso_icon","onclick","onrollover");
      $nid_arr = array("sound"=>$data->sound,"thumbnail"=>$data->thumbnail,"marker"=>$data->marker,"subtitle"=>$data->subtitle
    );
    }
    else {
      //$nid_arr = array($data->image_id);
      //$media_elem_arr = array("image");
      $nid_arr = array("image"=>$data->image);
    }
    
    //print_r($nid_arr); die();
    //$bcr->cloneElemChildren($parent_id);

    $action = 'new';
    if(!empty($data->action)): 
      $action = 'duplicate';
    endif;

    if(isset($action) && $action == 'duplicate'){

      //if(!empty($nid_arr))
      if(count($nid_arr)>0) { 

        $result_arr = array();
      
        foreach($nid_arr as $nid_key => $nid){
          if($nid!=""){
            //echo $nid_key."=".$nid."--"; die();
            $cm = Node::load($nid);

            /* print_r($cm->getTitle()); echo "\n";            
            print_r($cm->getType()); echo "\n";            
            print_r($cm->get('field_cm_type')->getString()); echo "\n"; */
                       
            // clone a node
            $dup_cm = $cm->createDuplicate();
            $par_type = $dup_cm->getType();
            $p_ctitle = $dup_cm->getTitle();   

            $parts = explode(".", $p_ctitle);
            $last = array_pop($parts);
            $new_p_ctitle_array = array(implode(".", $parts), $last);
            $new_p_ctitle = $new_p_ctitle_array[0];
            
            $new_media_title = $new_p_ctitle.'-'.$nid_key.'-duplicated.'.$new_p_ctitle_array[1];

            //$dup_cm->setTitle($new_p_ctitle.'-duplicated.'.$new_p_ctitle_array[1]);  
            $dup_cm->setTitle($p_ctitle);  
            
            $cm_type = $cm->get('field_cm_type')->getString();
        
            $dup_file_path = $dup_cm->get('field_cm_file_path')->getString();
            $file_name = end(explode('/',$dup_file_path));
            $oldUniqueId = current(explode('_',$file_name));
            $newUniqueId = uniqid(); 
            $dest_src = str_replace($oldUniqueId, $newUniqueId, $dup_file_path); 
            $full_path = $file_system->realpath($dup_file_path);
            $dest_path = $file_system->realpath($dest_src);

            $final_file_url1 = file_create_url($dest_src);
            $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];

            // print_r($dup_file_path); echo "\n";
            // print_r($dest_src); echo "\n";
            // print_r($final_file_url1); echo "\n";
            // print_r($final_file_path1); echo "\n"; 
      
            if(strpos($cm_type,'image') !== false || strpos($cm_type,'text') !== false) {	
              $file_save = $file_system->copy($full_path, $dest_path, FileSystemInterface::EXISTS_RENAME);
            }
            elseif(strpos($cm_type,'audio') !== false || strpos($cm_type,'octet') !== false || strpos($cm_type,'stream') !== false){
              $dup_cm->save();
              $wav_json_path = $dup_cm->get('field_cm_wav_json_path')->getString();
              
              //print_r($wav_json_path); echo "audio file \n";

              if($wav_json_path){
                $dest_json_path = str_replace($cm->id(), $dup_cm->id(), $wav_json_path); 

                $final_json_file_path = end(explode($_SERVER['HTTP_HOST'],file_create_url($dest_json_path)));

                $src_json_path = $file_system->realpath($wav_json_path);
                $dest_json_realpath = $file_system->realpath($dest_json_path);
                $file_copy = $file_system->copy($src_json_path,
                $dest_json_realpath, FileSystemInterface::EXISTS_RENAME);
                $dup_cm->set('field_cm_wav_json_path',$dest_json_path);
              }
              $mp3_path = $dup_cm->get('field_cm_audio_path')->getString();

              //print_r($mp3_path); echo "\n";

              if($mp3_path){
                $dest_mp3_path = str_replace($cm->id(), $dup_cm->id(), $mp3_path); 
                $src_mp3_path = $file_system->realpath($mp3_path);
                $dest_mp3_realpath = $file_system->realpath($dest_mp3_path);
                $file_copy = $file_system->copy($src_mp3_path,
                $dest_mp3_realpath, FileSystemInterface::EXISTS_RENAME);
                $dup_cm->set('field_cm_audio_path',$dest_mp3_path);

                //print_r($dest_mp3_path); echo "\n";
	            }
	            $file_save = $file_system->copy($full_path, $dest_path, FileSystemInterface::EXISTS_RENAME);
	          }
            
            if(strpos($cm->getTitle(), $parent_id) !== false){
              $old_title = $cm->getTitle();
              //$new_title = str_replace($nid, $parent_id, $old_title);
              //$new_title = str_replace($nid, $parent_id, $old_title);
              //$dup_cm->setTitle($new_title);
              $dup_cm->set('field_cm_subtitle',$p_ctitle);
            }
          
            $dup_cm->set('field_cm_file_path',$dest_src);
            $dup_cm->set('field_cm_course_element',$parent_id);
            $dup_cm->save();
            $last_pnode_id = $dup_cm->id();
	    
            //Update Templates HTML & Media Params
            $mdata = [];
            $mdata = [
              'cm_id' => $cm->id(),
              'cloned_id' => $dup_cm->id(),
              'old_path' => $oldUniqueId,
              'new_path' => $newUniqueId
            ];
            $updateHtml = $bcr->updateTempHtml($parent_id, $mdata);

            /* if(!empty($data->parent)){
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
              
              // new child to parent
              $pn->set($pfield, $new_upd_chld);
              $pn->setRevisionUserId($uid);
              $pn->save();       
            } */

            /* $result_arr[] = array(
              'id' => $last_pnode_id,
              'name' => $p_ctitle,
              'type' => $cm_type,
              'mtype'=> $nid_key,
              'url' => $final_file_path1
            ); */

            if($nid_key == "clickAction")
            {
              $result_arr[$nid_key] = array(
                  'action' => $click_action[0],
                  'value' => array(
                    "background"=> array(  
                      'id' => $last_pnode_id,
                      'name' => $p_ctitle,
                      'type' => $cm_type,
                      'url' => $final_file_path1
                      )
                    )
              );
            }
            elseif($nid_key == "overAction")
            {
              $result_arr[$nid_key] = array(
                  'action' => $over_action[0],
                  'value' => array(
                    "background"=> array(  
                      'id' => $last_pnode_id,
                      'name' => $p_ctitle,
                      'type' => $cm_type,
                      'url' => $final_file_path1
                      )
                    )
              );
            }
            elseif($nid_key == "recto" || $nid_key == "verso") 
            {              
              $result_arr[$nid_key] = array(
                'media' => array(                  
                    'id' => $last_pnode_id,
                    'name' => $p_ctitle,
                    'type' => $cm_type,
                    'url' => $final_file_path1                   
                )              
              );
            }
            elseif($nid_key == "sound")
            {
              $result_arr[] = array(
                'id' => $last_pnode_id,
                'name' => $p_ctitle,
                'type' => $cm_type,
                'url' => $final_file_path1,
                'waveform' => $final_json_file_path
              );
            } 
            else {
              //echo "nid-key:".$nid_key;
              if($nid_key == "image"){
                $result_arr[] = array(
                  'id' => $last_pnode_id,
                  'name' => $p_ctitle,
                  'type' => $cm_type,
                  'url' => $final_file_path1
                );
              } else{                
                  $result_arr[$nid_key] = array(
                    'id' => $last_pnode_id,
                    'name' => $p_ctitle,
                    'type' => $cm_type,
                    'url' => $final_file_path1
                  );                                
              }
              
            }
            
            /* $result_arr[] = array(
              $nid_key => array(  
                'id' => $last_pnode_id,
                'name' => $p_ctitle,
                'type' => $cm_type,
                'url' => $final_file_path1
                )
            ); */

            //////////////////////////
            //Updating action id
            if($parent->getType() == 'partpage'){
              $orig_pp_chld = $parent->get('field_pp_children')->getValue();
              $orig_pp_chld = array_column($orig_pp_chld,'target_id');

              $pp_node = Node::load($parent_id);
              
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

            ///////////////////////
          }
        } 


        
      }  

      //$response = 'element duplicated successfully!'.$last_pnode_id;

      /* $result['media'] = array(
        'id' => $last_pnode_id,
        'name' => $p_ctitle,
        'type' => $cm_type,
        'url' => $final_file_path1
      ); */

      /* $result['media'] = array(
        $media_type => $result_arr
      ); */
      $result['media'] = $result_arr;

    }
    
    //return new ResourceResponse($response);

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
    $param = \Drupal::request()->getContent();

    $data = array();
    if(!empty($param)):
      $data = json_decode($param,true);
    endif;

    if(isset($data['media_ids']) && $data['media_ids']!="") {

      $mid = $data['media_ids'];
      $media = Node::load($mid);

      $file_system = \Drupal::service('file_system');

      $file_path = $media->get('field_cm_file_path')->getString();
      $wav_json_path = $media->get('field_cm_wav_json_path')->getString();
      $real_file_path = $file_system->realpath($file_path);
      $file = array_shift(explode('.',end(explode('/',$file_path))));
      $file = str_replace(' ', '_', $file);
      $uniqueId = array_shift(explode('-',$file));
      $dir_path = $file_system->realpath('public://editor');
      $mp3_file = $dir_path.'/'.$mid.'_audio.mp3';
      $mp3_file_path = 'public://editor/'.$mid.'_audio.mp3';
      $final_mp3_file_path = end(explode($_SERVER['HTTP_HOST'],file_create_url($mp3_file_path)));
      $json_file = $dir_path.'/'.$mid.'_wav_file.json';
      $json_file_path = 'public://editor/' . $mid . '_wav_file.json';
      $final_json_file_path = end(explode($_SERVER['HTTP_HOST'],file_create_url($json_file_path)));


      //Extracting Audio from Video
      if(!file_exists($mp3_file)){
        $ffmpeg = \Drupal::service('php_ffmpeg');
        $video = $ffmpeg->open($real_file_path);
        $streams = $video->getStreams();

        if(count($streams->audios())){
          $format = new Mp3();
          $format->on('progress', function ($video, $format, $percentage) {
            //echo "$percentage % transcoded";
          });
          $format->setAudioChannels(1);

          $video->filters()
            ->resample(8000);

          $audio = $video->save($format, $mp3_file);
        }
        
      }

      /*$ff_probe = \Drupal::service('php_ffmpeg_probe');
      $mp3_info = $ff_probe->streams($mp3_file);

      $subtitle_path = $media->get('field_cm_subtitle_path')->getString();
      $subtitle_relative_path = $subtitle_path ? end(explode($_SERVER['HTTP_HOST'],file_create_url($subtitle_path))) : '';
      $marker = $media->get('field_cm_marker')->getString();
      $marker_relative_path = $marker ? end(explode($_SERVER['HTTP_HOST'],file_create_url($marker))) : '';*/

      if(!file_exists($json_file)){
        if(file_exists($mp3_file)){
          $outputs = [
          0 => ['pipe', 'r'],  
          1 => ['pipe', 'w'],  
                2 => ["file", "/tmp/error-output.txt", "a"]
      ];
          $pipes = null;

          //$command = 'ffmpeg -i ' . $real_file_path . ' -f wav -ar 8000 -ac 1 - | audiowaveform --input-format wav --pixels-per-second 100 --output-format json > ' . $json_file;
          $command = 'audiowaveform -i ' . $mp3_file . ' -o ' . $json_file . ' --pixels-per-second 100 -b 8';
    
          $proc = proc_open($command,$outputs,$pipes);

          $err = stream_get_contents($pipes[1]);
          $pclose = proc_close($proc);
      
          //$metadata = exec('audiowaveform -i ' . $mp3_file . ' -o ' . $json_file . ' --pixels-per-second 100 -b 8 --split-channels',$output);
        
          $media->set('field_cm_audio_path',$mp3_file_path);   
        }  
        else{
          $json = '{"version":2,"channels":1,"sample_rate":8000,"samples_per_pixel":80,"bits":8,"length":0,"data":[]}';
          $file = fopen($json_file,'w+');
          fwrite($file,$json);
          fclose($file);
        }
        if(file_exists($json_file)){
          $media->set('field_cm_wav_json_path',$json_file_path);
        }
        $media->save();
      }
    
      if(file_exists($json_file)){
        $result[] = [
      'wav_json_file' => $final_json_file_path
        ];
      }
    /* elseif(!file_exists($mp3_file)){
    $result = [ 
            'error_no' => '101',
            'error_msg' => 'No Audio found in the Video'
        ];
      }*/
      else{
        $result = [ 
            'error_no' => '102',
            'error_msg' => 'Failed to run `audiowaveform` command'
        ];
      }
      
    }
    

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
   
  }


  /**
   * Responds to DELETE requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function delete(){

    //$nid = \Drupal::request()->get('id');
    $uid = $this->currentUser->id();

    $param = \Drupal::request()->getContent();

    $data = array();
    if(!empty($param)):
      $data = json_decode($param,true);
    endif;

    $elem_id = $data['element_id'];
    $element = Node::load($elem_id);
    $element_title = $element->getTitle();
    $element_type = $element->getType();
    $element->setRevisionUserId($uid);
    $element->save();

    $nids = $data['media_ids'];
    if(!empty($nids)){
      $nodes = Node::loadMultiple($nids);
    }

    if($element_type == 'partpage'){
      $p_ids = \Drupal::entityQuery('node')
	->condition('type','page')
	->condition('field_page_children',$elem_id)
	->execute();

      $p_title = '';
      if(!empty($p_ids)){
	$pid = implode('',$p_ids);
	$parent = Node::load($pid);
	$p_title = $parent->getTitle();
	$count_elem = "";
        foreach($nodes as $n){
	  $cm_elem_values = $n->get('field_cm_course_element')->getValue();
	  $cm_elem_ids = array_column($cm_elem_values,'target_id');
          $cm_elem_count = count($cm_elem_ids);
          $count_elem .= $cm_elem_count.",";
	  if($cm_elem_count > 1 && in_array($pid,$cm_elem_ids)){
	    $target_key = array_search($pid, $cm_elem_ids);
	    unset($cm_elem_values[$target_key]);
	    $n->set('field_cm_course_element',$cm_elem_values);
            $n->setRevisionUserId($uid);
	    $n->save();
	  }
	  else{
	    $n->delete();
           $cm_elem_values = $n->get('field_cm_file_path')->getValue();
           //bilim-555 fix
	   $dir = $cm_elem_values[0]['value'];     
	   $final_file_url1 = file_create_url($dir);
	   $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
	   $final_file_path11 = $_SERVER['DOCUMENT_ROOT'].$final_file_path1;
           $this->deleteAll($final_file_path11);
           	  }
	}
      }
      
    }
    elseif($element_type == 'simple_partpage'){
      $p_ids = \Drupal::entityQuery('node')
	->condition('type','simple_page')
	->condition('field_sp_children',$elem_id)
	->execute();

      $p_title = '';
      if(!empty($p_ids)){
	$pid = implode('',$p_ids);
	$parent = Node::load($pid);
	$p_title = $parent->getTitle();
	
        foreach($nodes as $n){
	  $cm_elem_values = $n->get('field_cm_course_element')->getValue();
	  $cm_elem_ids = array_column($cm_elem_values,'target_id');
          $cm_elem_count = count($cm_elem_ids);

	  if($cm_elem_count > 1 && in_array($pid,$cm_elem_ids)){
	    $target_key = array_search($pid, $cm_elem_ids);
	    unset($cm_elem_values[$target_key]);
	    $n->set('field_cm_course_element',$cm_elem_values);
            $n->setRevisionUserId($uid);
	    $n->save();
	  }
	  else{
	   $n->delete();
	     $cm_elem_values = $n->get('field_cm_file_path')->getValue();
	    //bilim-555 fix
	     $dir = $cm_elem_values[0]['value'];     
	     $final_file_url1 = file_create_url($dir);
	     $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
	     $final_file_path11 = $_SERVER['DOCUMENT_ROOT'].$final_file_path1;
	     $this->deleteAll($final_file_path11);


	  }
	}
      }
      
    }
    else{
      foreach($nodes as $n){
	  $cm_elem_values = $n->get('field_cm_course_element')->getValue();
	  $cm_elem_ids = array_column($cm_elem_values,'target_id');
          $cm_elem_count = count($cm_elem_ids);

	  if($cm_elem_count > 1 && in_array($elem_id,$cm_elem_ids)){
	    $target_key = array_search($elem_id, $cm_elem_ids);
	    unset($cm_elem_values[$target_key]);
	    $n->set('field_cm_course_element',$cm_elem_values);
            $n->setRevisionUserId($uid);
	    $n->save();
	  }
	  else{
	    $n->delete();

      $cm_elem_values = $n->get('field_cm_file_path')->getValue();
      //bilim-555 fix
     $dir = $cm_elem_values[0]['value'];     
     $final_file_url1 = file_create_url($dir);
     $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
     $final_file_path11 = $_SERVER['DOCUMENT_ROOT'].$final_file_path1;
     $this->deleteAll($final_file_path11);          
	  }
     }
    }
    

    /*if($element_type == 'partpage'){
      $p_ids = \Drupal::entityQuery('node')
	->condition('type','page')
	->condition('field_page_children',$elem_id)
	->execute();

      $p_title = '';
      if($p_ids){
	$pid = implode('',$p_ids);
	$parent = Node::load($pid);
	$p_title = $parent->getTitle();
	
      } 

      if(strpos($p_title,'duplicated') !== false){
        if(!empty($nodes)){
	  foreach($nodes as $n){
	    $cm_elem_id = $n->get('field_cm_course_element')->getString();
	    if($cm_elem_id == $elem_id){
	      $n->delete();
	    }
	  }
        }
      }
      else{
	if(!empty($nodes)){
	  foreach($nodes as $n){
	    $n->delete();
	  }
	}
      }
    }
    else{
      if(strpos($element_title,'duplicated') !== false){
        if(!empty($nodes)){
	  foreach($nodes as $n){
	    $cm_elem_id = $n->get('field_cm_course_element')->getString();
	    if($cm_elem_id){
		$cm_elem = Node::load($cm_elem_id);
		$cm_elem_name = $cm_elem->getTitle();
		if(strpos($cm_elem_name,'duplicated') !== false){
		  $n->delete();
		}
	    }
	  }
        }
      }
      else{
	if(!empty($nodes)){
	  foreach($nodes as $n){
	    $n->delete();
	  }
	}
      }
    }*/

    $response = "File Node Removed Successfully!-".$element_type;
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
