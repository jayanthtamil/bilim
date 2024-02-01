<?php
namespace Drupal\bilim\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\Core\Session\SessionManager;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Access\AccessResult;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Drupal\Component\Utility;
use Drupal\Core\Entity;
use Drupal\Core\EventSubscriber;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Archiver\Zip;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;
use function GuzzleHttp\json_decode;

/**
 * Class UploadController.
 */
class UploadController extends ControllerBase {

    public function __construct() {
        global $bcr;
    }

    /**
     * Handle the check user.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function checkAccess(){
      global $base_url;
      $curr_user = \Drupal::currentUser();
      if ($curr_user->isAuthenticated()) {
        // This user is logged in.
        $curr_user_roles = $curr_user->getRoles();
        if(in_array('domain_admin',$curr_user_roles) || in_array('supervisor',$curr_user_roles)){
        	$tempstore = \Drupal::service('tempstore.shared')->get('bilim');
        	//$user_data = $tempstore->get('user_data');
        	//$pass = $tempstore->get('pass');
                $name = $curr_user->getAccountName();
                $pass = $tempstore->get($name);

        	
        	 $body = array(
        			'grant_type' => 'password',
        			'client_id' => '68c28aab-53ca-4bac-be62-fbf285425e05',
        			'client_secret' => 'bilim123',
        			'username' => $name,
        			'password' => $pass
        	);
        	
        	
        	$url = 'http://192.168.1.63:8081/bilim/v1.0/bilim_cms_v2/oauth/token';
        	/* $client = \Drupal::httpClient();

			$response = $client->request('GET', $url);
			$code = $response->getStatusCode();
			if ($code == 200) {
				$body = $response->getBody()->getContents();
			} */

        	/*$ch = curl_init();

			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS,
			            "grant_type=password&client_id=68c28aab-53ca-4bac-be62-fbf285425e05&client_secret=bilim123&username=".$name."&password=".$pass."");
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			$server_output = curl_exec($ch);
			curl_close ($ch); */ 

		$client = \Drupal::httpClient();
		$response = $client->request('POST', $url, [                    
		     'form_params' => $body
		]);
		$code = $response->getStatusCode();
		if ($code == 200) {
		  $output = json_decode($response->getBody()->getContents(),true);
		}


			$result = array(
	          'error_no' => '0',
	          'error_msg' => 'success',
	          'redirect_url' => '',
	          'access_token' => !empty($output) ? $output['access_token'] : ''
	        );
        }
        else{
        	$result = array(
	          'error_no' => '0',
	          'error_msg' => 'success',
	          'redirect_url' => '',
	        );
        }
        
      } else {
        // This user is not logged in.
        $result = array(
          'error_no' => '1001',
          'error_msg' => 'Logged user not a part of this course',
          'redirect_url' => $base_url.'/user/logout'
        );
      }
      return new JsonResponse($result);
    }

    /**
   * Handle the file upload.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
    public function Upload() {
        $fileData = [];
        $fileData = $this->saveFile();
        return new JsonResponse($fileData);
    }
    
     /**
   * Handle the file upload.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
    public function Replace() {
        $fileData = [];
        $cm_id = \Drupal::request()->request->get('id');

        $file_path = \Drupal::request()->request->get('path');
        $file = \Drupal::request()->files->get('file', []);
        $filePath = end(explode('/files/',$file_path));
        $file_system = \Drupal::service('file_system');
        $file_url = $file_system->realpath('public://'.$filePath);
        if(file_exists('public://'.$filePath)){
        	unlink($file_url);
        }
        
		$path = $file->getPathName();
      	$file_data = file_get_contents($path, FILE_USE_INCLUDE_PATH);
        $file = file_save_data($file_data, 'public://' . urldecode($filePath) , FileSystemInterface::EXISTS_REPLACE);
		$final_file_url = file_create_url('public://' . $filePath);
	
		$fileData = [
			'file_path' => $final_file_url
		];
      
        return new JsonResponse($fileData);
    }

    /**
     * Handle the file upload.
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function Remove() {
      $element_id = \Drupal::request()->request->get('element_id');
      $image_id = \Drupal::request()->request->get('image_id');
      echo $element_id.' '.$image_id;
      $fileData = "Removed Successfully!";
      return new JsonResponse($fileData);
    }

    

    protected function saveFile() {
      

      $element_id = \Drupal::request()->request->get('elementId');
      $course_id = \Drupal::request()->request->get('courseId');
      $style_id = \Drupal::request()->request->get('style_id');
      $final_file_path = [];
      $error = [];
      $files = \Drupal::request()->files->get('file', []);
      $file_system = \Drupal::service('file_system');

      foreach($files as $key => $file){

        //$all_files = $this->getRequest()->files->get('files', []);
        //$files = $this->currentRequest->files;
        if (!$file) {
          return FALSE;
        }
        //$keys = $files->keys();
        /** @var \Symfony\Component\HttpFoundation\File\UploadedFile $uploadedFile */
        //$uploadedFile = $this->currentRequest->files->get($keys[0]);

        // Check File Size
          $supported_file_size = 104857600; // 100MB.
          $fileSize = $file->getClientSize();

          if ($fileSize > $supported_file_size) {
              $error = [
            		"error_no" => "1",
			"error_msg" => "File Size must be less than 100MB."
		     ];
          }
          // Check Extensions
          $supported_extensions = array('gif', 'jpeg', 'jpg', 'png', 'mp3', 'mp4', 'mpeg', 'mpv', 'm4v', 'ogg', 'webm', 'avi', 'wmv', 'mov', 'mp2', 'zip', 'ppt', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'vtt', 'svg');
          $extension = strtolower($file->getClientOriginalExtension());
          if (!empty($extension) && !in_array($extension, $supported_extensions)) {
			  $error = [
		          		"error_no" => "2",
				"error_msg" => "File Extension must be either pdf, jpg or png"
				   ];
          }
          // Check File Name.
          $fileName = $file->getClientOriginalName();
          if (empty($fileName)) {
	    $error = [
            		"error_no" => "2",
			"error_msg" => "File name not found"
		     ];
          }

          $filePath = uniqid().'_file.' . $extension;;
          $mimeType = $file->getClientMimeType();
          $dimension = array();
          $path = $file->getPathName();
          $fileData = file_get_contents($path, FILE_USE_INCLUDE_PATH);
          if (empty($error)) {
            if (!file_exists('public://editor')) {
              mkdir('public://editor/', 0777, true);
            }
            
            $html_filter = [];
            $html = '';
            
            if($extension == 'zip'){
            	$zip = new Zip($path);
				$zipList = $zip->listContents();
				
				$html_filter = array_filter($zipList, function($value) {
				    return strpos($value, ".html") !== false;
				});
				
            }
            
            if($extension != 'zip' || ($extension == 'zip' && count($html_filter) == 1)){
            	if($extension != 'zip'){
		            $saved_file = file_save_data($fileData, 'public://editor/' . $filePath , FileSystemInterface::EXISTS_REPLACE);
		            $final_file_url1 = file_create_url('public://editor/' . $filePath);
			     	$final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
			     	
			        $file_url = $file_system->realpath('public://editor/'.$filePath);
			     	if($extension == 'jpg' || $extension == 'jpeg' || $extension == 'png' || $extension == 'gif'){
		              $imagedata = getimagesize($file_url);
		              $dimension = array(
		                'width' => $imagedata[0],
		                'height' => $imagedata[1]
		              );
		            }
            	}
            	else{
            		$new_path = explode('.',$filePath)[0];
            		if (!file_exists('public://editor/custom_media/'.$new_path)) {
		              mkdir('public://editor/custom_media/'.$new_path, 0777, true);
		            }
		            
		            $file_path = 'public://editor/custom_media/'.$new_path;
		            $final_file_url1 = file_create_url($file_path);
		            $final_file_path1 = explode($_SERVER['HTTP_HOST'],$final_file_url1)[1];
		            
            		$zip = new Zip($path);
					$zipList = $zip->listContents();
					$zip->extract($file_path);
					$abs_path = $file_system->realpath($file_path);
					if(!empty($html_filter)){
						$old_html = implode('', $html_filter);
						$new_html = 'index.html';
						rename($abs_path.'/' . $old_html, $abs_path.'/' . $new_html);
					}
            	}
		        $uid = \Drupal::currentUser()->id();
                     
		     	$element = Node::load($element_id);
		     	$element->setRevisionUserId($uid);
		     	$element->save();
	
          $elementId = array(
            "target_id" => $element_id
          );
          
          
          $styleId = array(
            "target_id" => $style_id
          );
	                
		    
	            
	            $courseId = array(
	              "target_id" => $course_id
	            );

		    $media_ids = \Drupal::request()->request->get('mediaId');
		    $media_id = $media_ids[$key];	
                    if(!empty($media_id)){
		      $media = Node::load($media_id);
		      $media->setTitle($fileName);
		      $media->set('field_cm_course', $courseId);
		      $media->set('field_cm_course_element', $elementId);
		      $media->set('field_cm_course_style', $styleId);
		      $media->set('field_cm_subtitle', $fileName);
		      $media->set('field_cm_size', $fileSize);
		      $media->set('field_cm_file_path', $saved_file->getFileUri());
		      $media->set('field_cm_type', $mimeType);
		      $media->save();
                    } 
		    else{
	              $da = array(
	                'type' => 'course_medias',
	                'title' => $fileName,
	                'field_cm_course' => $courseId,
	                'field_cm_course_element' => $elementId,
	                'field_cm_course_style' => $styleId,
	                'field_cm_subtitle' => $fileName,
	                'field_cm_size' => $fileSize,
	                'field_cm_file_path' => ($extension == 'zip') ? $file_path : $saved_file->getFileUri(),
	                'field_cm_type' => $mimeType
	              ); 
	
	              $node = Node::create($da);
	              $node->save();
		      $media_id = $node->id();
	            }
	            
	            if($extension == 'zip'){
	            	 $final_file_path['file'][] = array(
		              "id" => $media_id,
		              "path" => $final_file_path1,
		              "fileSize" => $fileSize,
		              "fileName" => $fileName,
	            	  "rootFile" => $new_html,	
	            	  "mimeType" => $mimeType,
		              "extension" => $extension,
		            );
	            }
	            else{
	            	$final_file_path['file'][] = array(
		              "id" => $media_id,
		              "path" => $final_file_path1,
		              "fileSize" => $fileSize,
		              "fileName" => $fileName,
		              "extension" => $extension,
		              "mimeType" => $mimeType,
		              "dimension" => $dimension
		            );
	            }
            }
            else{
            	$err = [
            		"error_no" => "1", 
            		"error_msg" => "uploaded animation is not a valid zip"
            	];
            	return $err;
            }

          }
 	}
        if (empty($error)) {
          return $final_file_path;
        }  
        return $error;
      
    }
   

    public function subtitleMarkerSave($media_id){
      $media = Node::load($media_id);
      
      $subtitle = \Drupal::request()->files->get('subtitle',[]);
      $marker = \Drupal::request()->files->get('marker',[]);

      if(!$subtitle) {
        return FALSE;
      }
    
      $subtitle_name = $subtitle->getClientOriginalName();
      $subtitle_path = $subtitle->getPathName();
      $subtitle_data = file_get_contents($subtitle_path, FILE_USE_INCLUDE_PATH);
      $subtitle_dest = 'public://editor/'.$subtitle_name;
      $subtitle_save = file_save_data($subtitle_data, $subtitle_dest, FileSystemInterface::EXISTS_REPLACE);

      $marker_name = $marker->getClientOriginalName();
      $marker_path = $marker->getPathName();
      $marker_data = file_get_contents($marker_path, FILE_USE_INCLUDE_PATH);
      $marker_dest = 'public://editor/'.$marker_name;
      $marker_save = file_save_data($marker_data, $marker_dest, FileSystemInterface::EXISTS_REPLACE);

      $file_system = \Drupal::service('file_system');

      $media = Node::load($media_id);
    
      $media->set('field_cm_subtitle_path', $subtitle_dest);
      $media->set('field_cm_marker', $marker_dest);
      $media->save();
  
      $subtitle_relative_path = end(explode($_SERVER['HTTP_HOST'], file_create_url($subtitle_dest)));
      $marker_relative_path = end(explode($_SERVER['HTTP_HOST'], file_create_url($marker_dest)));
    
      $result[] = [
	  'subtitle_path' => $subtitle_relative_path,
	  'marker_path' => $marker_relative_path
      ];

      return $result;
    }
    
    /**
     * Handle style import, extract and validate zip
     * 
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function styleImport(UploadedFile $uploadedFile = null) {

    	$final_file_path = [];
        $error = [];
        
    	$uploadedFile = \Drupal::request()->files->get('file');
    	$nid = \Drupal::request()->request->get('nid');
    	$type = \Drupal::request()->request->get('type');
    	$path = $uploadedFile->getPathName();
    	$fileSize = $uploadedFile->getClientSize();
    	$extension = $uploadedFile->getClientOriginalExtension();
    	$fileName = $uploadedFile->getClientOriginalName();
    	if (empty($fileName)) {
    		$error['message'][] =  'File name not found';
    	}

    	$mimeType = $uploadedFile->getClientMimeType();
			$dimension = array();
	
			$fileData = file_get_contents($path, TRUE );
	
			if (empty($error)) {
				if (!file_exists( 'public://course-styles' )) {
					mkdir( 'public://course-styles/', 0777, true );
				}
				
				$uniqueId = uniqid();
				$crs_unique_folder = 'public://course-styles/course_'.$uniqueId;
				
				if(!file_exists( $crs_unique_folder )) {
					mkdir( $crs_unique_folder, 0777, true );
				}
				
				$zipArchiver = new Zip($path);
				$zipList = $zipArchiver->listContents();

				if(!empty($this->existInArray('fmk/',$zipList)) 
					&& !empty($this->existInArray('css/assets/',$zipList))
					&& !empty($this->existInArray('css/templates.css',$zipList))
					&& !empty($this->existInArray('css/libs/custom-bootstrap.css',$zipList)) 
					&& !empty($this->existInArray('js/',$zipList)) 
					&& !empty($this->existInArray('blmconfig.json',$zipList))
					&& !empty($this->existInArray('index.html',$zipList))){
	
					$zipArchiver->extract($crs_unique_folder);
					$blmconfig_data = file_get_contents($crs_unique_folder.'/blmconfig.json');
					$blmconfig = json_decode($blmconfig_data,true);
					
					if($blmconfig['name']){
						$styleName = $blmconfig['name'];
					}
					else{
						$styleName = str_replace('.zip','',$fileName);
					}
					
					$displayValue = $blmconfig['display'];
					$framework = $blmconfig['framework'];
					
					if($displayValue == 'fullresponsive' || $displayValue == 'desktop' || $displayValue == 'smartphone'){
						$file = file_save_data($fileData, $crs_unique_folder . '/' . $fileName, FileSystemInterface::EXISTS_REPLACE);
						$final_file_path1 = file_create_url( $crs_unique_folder . '/' . $fileName );
						$fid = $file->id();


			            $node = Node::create([
			              'type' => 'style',
			              'title' => $styleName,
			              'field_s_style_file' => $fid,
			              'field_s_name' => $styleName,
			              'field_s_display' => $displayValue,
			            	'field_s_framework' => $framework,
			            ]); 
			            $node->save();
	            	
						$tree_node = Node::load($nid);
						
						if($type == 'domain'){
							$bcr = new BilimController();
							$dsr_ids = $bcr->getElemChildren($nid, 'field_domain_children');
							$dsr_nodes = Node::loadMultiple($dsr_ids);
							
							foreach ($dsr_nodes as $dsr){
								if($dsr->getType() == 'domain_styles_root'){
									$dsr->field_dsr_children[] = ['target_id' => $node->id()];
									$dsr->save();
								}
							}
							
						}
						else{
							if($type == 'domain_styles_root'){
								$tree_node->field_dsr_children[] = ['target_id' => $node->id()];
							}
							elseif($type == 'style_folder'){
								$tree_node->field_sf_children[] = ['target_id' => $node->id()];
							}
							$tree_node->save();
						}
						
						$final_file_path['file'][] = array (
								"path" => $final_file_path1,
								"fileSize" => $fileSize,
								"fileName" => $fileName,
								"extension" => $extension,
								"mimeType" => $mimeType,
								'folder_path' => $crs_unique_folder,
						);
						
						return new JsonResponse([
								'result' => 'OK',
								'id' => $node->id(),
								'file_path' => $final_file_path
							]);
					}
					elseif ($displayValue == ''){
						return new JsonResponse([
								'result' => 'Display value not found'
						]);
					}
					else{
						return new JsonResponse([
								'result' => 'Display value is invalid'
						]);
					}
				}
				elseif (empty($this->existInArray('fmk/',$zipList))){
					return new JsonResponse([
								'result' => 'Fmk not found'
						]);
				}
				elseif (empty($this->existInArray('css/templates.css',$zipList))){
					return new JsonResponse([
								'result' => 'templates.css not found'
						]);
				}
				elseif (empty($this->existInArray('css/libs/custom-bootstrap.css',$zipList))){
					return new JsonResponse([
								'result' => 'custom-bootstrap.css not found'
						]);
				}
				elseif (empty($this->existInArray('css/assets/',$zipList))){
					return new JsonResponse([
								'result' => 'Assets not found'
						]);
				}
				elseif (empty($this->existInArray('js/',$zipList))){
					return new JsonResponse([
								'result' => 'Js not found'
						]);
				}
				elseif (empty($this->existInArray('blmconfig.json',$zipList))){
					return new JsonResponse([
								'result' => 'blmconfig.json not found'
						]);
				}
				elseif (empty($this->existInArray('index.html',$zipList))){
					return new JsonResponse([
								'result' => 'index.html not found'
						]);
				}
			}
			else{
				return new JsonResponse([ 
						'result' => $error
						
				]);
			}
    }
    
    public function existInArray($find, $arr) {
			$result = array_filter($arr, function($val) use ($find) {
					return strpos($val, $find) !== FALSE;
				}
			);

			return $result;
		}

    /**
     * Handle style import, extract and validate zip
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function updateStyle(UploadedFile $uploadedFile = null) {
    	
    	$final_file_path = [];
    	$error = [];
    	    	
    	$uploadedFile = \Drupal::request()->files->get('file');
    	$sid =  \Drupal::request()->request->get('sid');
    	$path = $uploadedFile->getPathName();
    	$fileSize = $uploadedFile->getClientSize();
    	$extension = $uploadedFile->getClientOriginalExtension();
    	$fileName = $uploadedFile->getClientOriginalName();
    	if (empty($fileName)) {
    		$error['message'][] =  'File name not found';
    	}
    	
    	$mimeType = $uploadedFile->getClientMimeType();
    	$fileData = file_get_contents($path, FILE_USE_INCLUDE_PATH );
    	
    	if (empty($error)) {    
    		$uniqueId = uniqid();
    		$crs_unique_folder = 'public://course-styles/course_'.$uniqueId;
    		
    		if(!file_exists( $crs_unique_folder )) {
    			mkdir( $crs_unique_folder, 0777, true );
    		}
    		$zipArchiver = new Zip($path);
    		$zipList = $zipArchiver->listContents();
    		
    		if(in_array('fmk/',$zipList) == true && in_array('css/assets/',$zipList) == true && in_array('css/templates.css',$zipList) == true && 
				in_array('css/libs/custom-bootstrap.css',$zipList) == true && in_array('js/',$zipList) == true && in_array('blmconfig.json',$zipList) == true && 
				in_array('index.html',$zipList) == true){
    					
    					$zipArchiver->extract($crs_unique_folder);
    					$blmconfig_data = file_get_contents($crs_unique_folder.'/blmconfig.json');
    					$blmconfig = json_decode($blmconfig_data,true);
    					
    					if($blmconfig['name']){
    						$styleName = $blmconfig['name'];
    					}
    					else{
    						$styleName = str_replace('.zip','',$fileName);
    					}
    					
    					$displayValue = $blmconfig['display'];
    					$framework = $blmconfig['framework'];
    					$fv = str_replace(".", "", $framework,$count);
    					if($count <= 1) {
    						$fv = str_pad($fv,3,"0");
    					}
    					if($displayValue == 'fullresponsive' || $displayValue == 'desktop' || $displayValue == 'smartphone'){
    						$node = Node::load($sid);
    						$display = $node->get('field_s_display')->getString();
    						$fversion = $node->get('field_s_framework')->getString();
    						$fv2 = str_replace(".", "", $fversion, $count2);
    						if($count2 <= 1) {
    							$fv2 = str_pad($fv2,3,"0");
    						}
    						if((int)$fv < (int)$fv2) {
    							return new JsonResponse([
    									'result' => 'You cannot update a style by a lower version package'
    							]);
    						}
    						if($display == $displayValue || $display == 'fullresponsive') {
	    						$file = file_save_data($fileData, $crs_unique_folder . '/' . $fileName, FileSystemInterface::EXISTS_REPLACE);
	    						$final_file_path1 = file_create_url( $crs_unique_folder . '/' . $fileName );
	    						$fid = $file->id();
	    						
	    						
	    						$node->set('field_s_style_file', $fid);
	    						$node->set('field_s_framework', $framework);	
	    						$node->set('field_s_name', $styleName);	
	    						$node->set('field_s_display', $displayValue);	
	    						$node->save();
	    						
	    						$final_file_path['file'][] = array (
	    								"path" => $final_file_path1,
	    								"fileSize" => $fileSize,
	    								"fileName" => $fileName,
	    								"extension" => $extension,
	    								"mimeType" => $mimeType,
	    						);

							//update courses
							if(!empty($blmconfig['externaltexts']) || !empty($blmconfig['navigation'])){
							   $course_values = $node->get('field_s_courses')->getValue();
							   $course_ids = array_column($course_values, 'target_id');

							   if(!empty($course_ids)){
								foreach($course_ids as $course_id){
								   $course = Node::load($course_id);

								   if($course){
                     if(!empty($blmconfig['externaltexts'])){
                     	$external_texts = $course->get('field_external_texts')->value;
                     	if($external_texts){
												$external_texts = json_decode($external_texts, true);
											}
											
											$stlExtNameArr = array_column($blmconfig['externaltexts'],'name');
											$crsExtNameArr = array_column($external_texts,'name');
											
											$stlExtValArr = array_column($blmconfig['externaltexts'],'value');
											$crsExtValArr = array_column($external_texts,'value');
											
											$crs_val_diff = array_diff($crsExtValArr, $stlExtValArr);
											$stl_val_diff = array_diff($stlExtValArr, $crsExtValArr);

											$crs_name_diff = array_diff($crsExtNameArr, $stlExtNameArr);
											$stl_name_diff = array_diff($stlExtNameArr, $crsExtNameArr);
									
											if(!empty($crs_val_diff)){
												foreach($crs_val_diff as $c_diff){
													$c_diff_key = array_search($c_diff, $crsExtValArr);
													if($external_texts[$c_diff_key]['name'] != $blmconfig['externaltexts'][$c_diff_key]['name']){
														unset($external_texts[$c_diff_key]);

													}
												}
											}
											
											if(!empty($stl_val_diff)){
												foreach($stl_val_diff as $s_diff){
													$s_diff_key = array_search($s_diff, $stlExtValArr);
													if($external_texts[$s_diff_key]['name'] != $blmconfig['externaltexts'][$s_diff_key]['name']){
														$external_texts[] = $blmconfig['externaltexts'][$s_diff_key];
													}
												}
											}
											
											/*$new_external_texts = [];
											foreach($blmconfig['externaltexts'] as $key => &$val){
												if(!in_array($val['name'], $stlExtNameArr)){
													unset($val);
												}
												
												if(($val['name'] == $external_texts[$key]['name']) && ($val['value'] != $external_texts[$key]['value'])){
													$new_external_texts[$key] = $val;
												}
												elseif (($val['name'] != $external_texts[$key]['name'])){
													$new_external_texts[$key] = $val;
												}
											}*/
											
								      $course->set('field_external_texts',json_encode(array_values($external_texts)));
                     }
								      elseif(!empty($blmconfig['navigation'])){
								        $blmNavLv = $blmconfig['navigation']['navigationlevel'];
 								        $crs_nav = json_decode($course->get('field_crs_nav_param')->value,true);
                     						        $crs_nav_lv = $crs_nav['nav_param']['navigationlevel'];
								        if($blmNavLv < $crs_nav_lv){
                     							  $crs_nav['nav_param']['navigationlevel'] = $blmNavLv;
									}
                                                                        $blmTocLv = $blmconfig['navigation']['toclevel'];
									$crs_toc_lv = $crs_nav['nav_param']['toclevel'];
									if($blmTocLv < $crs_toc_lv){
									  $crs_nav['nav_param']['toclevel'] = $blmTocLv;
									}
								        $course->set('field_crs_nav_param',json_encode($crs_nav));
								      } 
								      $course->save();
								      
								   }
								   
							    	//Update external files if they are not identical with course.
						      	$media_ids = \Drupal::entityQuery('node')
											->condition('type', 'course_medias')
											->condition('field_cm_course',$course_id)
											->condition('field_cm_course_style', $sid)
											->execute();

										$media_ids = array_values($media_ids);
										
										if(!empty($media_ids)){	
											$medias = Node::loadMultiple($media_ids);
											
											$file_system = \Drupal::service('file_system');
											
											$crs_abs_file_path = $file_system->realpath($crs_unique_folder . '/external/');
											$bcr = new BilimController();		
											$style_ext_files = $bcr->get_files_in_dir($crs_abs_file_path); 
											
											$crs_ext_files = [];
											
											foreach($medias as $m){
												$cm_file_path = $m->get('field_cm_file_path')->getString();
												$cm_file_name = end(explode('/', $cm_file_path));
												$cm_file_dir =  str_replace($cm_file_name, '', $cm_file_path);
												$crs_ext_files[] = $cm_file_name;
											}
											
											$abs_cm_file_path = $file_system->realpath($cm_file_path);
											$abs_cm_file_dir = $file_system->realpath($cm_file_dir);
											$abs_cm_file_main_dir = str_replace('external', '', $abs_cm_file_dir);
											
											$crs_ext_diff = array_diff($crs_ext_files, $style_ext_files);
											$stl_ext_diff = array_diff($style_ext_files, $crs_ext_files);

											if(!empty($stl_ext_diff)){
												foreach($stl_ext_diff as $stl_f){
													$ext_file = $file_system->copy($crs_abs_file_path . '/' . $stl_f, $cm_file_dir, FileSystemInterface::EXISTS_REPLACE);
																	
													// Create course media for the new file.
													$da = array(
															'type' => 'course_medias',
															'title' => $stl_f,
															'field_cm_course' => $course_id,
															'field_cm_course_element' => '',
															'field_cm_course_style' => $sid,
															'field_cm_subtitle' => $stl_f,
															'field_cm_size' => '',
															'field_cm_file_path' => $cm_file_dir . $stl_f,
													);
													
													$cm = Node::create($da);
													$cm->save();
												}
											}
											
											if(!empty($crs_ext_diff)){
												foreach($crs_ext_diff as $crs_f){
													foreach($medias as $m){
														$cm_file_path = $m->get('field_cm_file_path')->getString();
														$abs_cm_file_path = $file_system->realpath($cm_file_path);
														$cm_file_name = end(explode('/', $cm_file_path));
														if($crs_f == $cm_file_name){
															$isReplaced = $m->get('field_cm_is_replaced')->value;
															if(!$isReplaced){
																$m->delete();
																if(file_exists($cm_file_path)){
																	unlink($abs_cm_file_path);
																}
															}
														}
													}
												}
											}


										}
								}
							   }
							}
							
	    						
	    						return new JsonResponse([
	    								'result' => 'OK',
	    								'id' => $node->id(),
	    								'file_path' => $final_file_path
	    						]);
    						}
    						else {
    							if($display == 'desktop') {
    								$result = 'You are trying to update a style defined for desktop templates by a zip defined for {{Smartphone|Full responsive}}. This style may be updated only by similar template definitions';
    							}
    							else {
    								$result = 'You are trying to update a style defined for smartphone templates by a zip defined for {{desktop|Full responsive}}. This style may be updated only by similar template definitions';
    							}
    							return new JsonResponse([
    									'result' => $result
    							]);
    						}
    					}
    					elseif ($displayValue == ''){
    						return new JsonResponse([
    								'result' => 'Display value not found'
    						]);
    					}
    					else{
    						return new JsonResponse([
    								'result' => 'Display value is invalid'
    						]);
    					}
    		}
    		elseif (in_array('fmk/',$zipList) == false){
    			return new JsonResponse([
    					'result' => 'Fmk not found'
    			]);
    		}
    		elseif (in_array('css/templates.css',$zipList) == false){
					return new JsonResponse([
								'result' => 'templates.css not found'
						]);
			}
			elseif (in_array('css/libs/custom-bootstrap.css',$zipList) == false){
				return new JsonResponse([
							'result' => 'custom-bootstrap.css not found'
					]);
			}
			elseif (in_array('css/assets/',$zipList) == false){
				return new JsonResponse([
							'result' => 'Assets not found'
					]);
			}
			elseif (in_array('js/',$zipList) == false){
				return new JsonResponse([
							'result' => 'Js not found'
					]);
			}
			elseif (in_array('blmconfig.json',$zipList) == false){
				return new JsonResponse([
							'result' => 'blmconfig.json not found'
					]);
			}
			elseif (in_array('index.html',$zipList) == false){
				return new JsonResponse([
							'result' => 'index.html not found'
					]);
			}
    	}
    	else{
    		return new JsonResponse([
    				'result' => $error
    				
    		]);
    	}
    }
    
    /**
     * Change Course style
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function changeStyle() {
    	$new_sid = \Drupal::request()->request->get('sid');
    	$crs_id = \Drupal::request()->request->get('crs_id');
    	
    	$old_sids = \Drupal::entityQuery('node')
				->condition('type', 'style')
				->condition('field_s_courses', $crs_id)
				->execute();
    		
    	$old_sid = implode('', $old_sids);
    	
    	$old_style = Node::load($old_sid);
    	$crs_ref = $old_style->get('field_s_courses')->getValue();
    	$crs_arr = array_column($crs_ref, 'target_id');
    	$crs_key = array_search($crs_id, $crs_arr);
    	unset($crs_ref[$crs_key]);
    	$old_style->set('field_s_courses', $crs_ref);
    	$old_style->save();
    	
    	$new_style = Node::load($new_sid);
    	
    	$fid = $new_style->get('field_s_style_file')->getValue()[0]['target_id'];

			if($fid){
				$file = File::load($fid);
				$uri = $file->get('uri')->getString();
			}
			$absolute_path = \Drupal::service('file_system')->realpath($uri);
			$blmconfig_data = file_get_contents('zip://'.$absolute_path.'#blmconfig.json');
			$blmconfig = json_decode($blmconfig_data,true);
			$externalTexts = json_encode($blmconfig['externaltexts']);
    	
    	$new_crs_ref = [];
    	$new_crs_ref = $new_style->get('field_s_courses')->getValue();
    	$new_crs_ref[]['target_id'] = $crs_id;
    	$new_style->set('field_s_courses', $new_crs_ref);
    	$new_style->save();
    	
    	$crs = Node::load($crs_id);
    	$crs->set('field_external_texts', $externalTexts);
    	$crs->save();
    	
    	return new JsonResponse([
    				'result' => 'OK'
    		]);
    }
    
  /**
   * Handle the style external files replace.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
    public function ReplaceExternalFile() {
        $fileData = [];
        $cm_id = \Drupal::request()->request->get('id');

				$cm = Node::load($cm_id);
				$old_filepath = $cm->get('field_cm_file_path')->getString();
 
        $file_path = \Drupal::request()->request->get('path');
        $file = \Drupal::request()->files->get('file', []);
        $filePath = end(explode('/files/',$file_path));
        $file_system = \Drupal::service('file_system');
        $file_url = $file_system->realpath('public://'.$filePath);
        if(file_exists('public://'.$filePath)){
        	unlink($file_url);
        }
        
        $old_file_url = $file_system->realpath($old_filepath);
        unlink($old_file_url);

		$path = $file->getPathName();
      	$file_data = file_get_contents($path, FILE_USE_INCLUDE_PATH);
        $file = file_save_data($file_data, 'public://' . urldecode($filePath) , FileSystemInterface::EXISTS_REPLACE);
        
        rename($file_url, $old_file_url);
        if(!empty($file)){
        	$cm->set('field_cm_is_replaced', 1);
        	$cm->save();
        }
		$final_file_url = file_create_url('public://' . $old_filepath);
	
		$fileData = [
			'file_path' => $final_file_url
		];
      
        return new JsonResponse($fileData);
    }
    
    
    
    /**
     * Check whether 2 given files are identical or not.
     */
    function compareFiles($file_a, $file_b)
		{
		  if (filesize($file_a) != filesize($file_b))
		      return false;

		  $chunksize = 4096;
		  $fp_a = fopen($file_a, 'rb');
		  $fp_b = fopen($file_b, 'rb');
		      
		  while (!feof($fp_a) && !feof($fp_b))
		  {
		      $d_a = fread($fp_a, $chunksize);
		      $d_b = fread($fp_b, $chunksize);
		      if ($d_a === false || $d_b === false || $d_a !== $d_b)
		      {
		          fclose($fp_a);
		          fclose($fp_b);
		          return false;
		      }
		  }
	 
		  fclose($fp_a);
		  fclose($fp_b);
		        
		  return true;
		}
}
