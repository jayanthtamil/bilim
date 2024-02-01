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
	 * Return an array of files found within a specified directory.
	 * @param  string $dir   A valid directory. If a path, with a file at the end,
	 *                       is passed, then the file is trimmed from the directory.
	 * @param  string $regex Optional. If passed, all file names will be checked
	 *                       against the expression, and only those that match will
	 *                       be returned.
	 *                       A RegEx can be just a string, where a '/' will be
	 *                       prefixed and a '/i' will be suffixed. Alternatively,
	 *                       a string could be a valid RegEx string.
	 * @return array         An array of all files from that directory. If regex is
	 *                       set, then this will be an array of any matching files.
	 */
	function get_files_in_dir(string $dir, $regex = null)
	{
		  $dir = is_dir($dir) ? $dir : dirname($dir);
		  // A RegEx to check whether a RegEx is a valid RegEx :D
		  $pass = preg_match("/^([^\\\\a-z ]).+([^\\\\a-z ])[a-z]*$/i", $regex, $matches);

		  // Any non-regex string will be caught here.
		  if (isset($regex) && !$pass) {
		      //$regex = '/'.addslashes($regex).'/i';
		      $regex = "/$regex/i";
		  }

		  // A valid regex delimiter with different delimiters will be caught here.
		  if (!empty($matches) && $matches[1] !== $matches[2]) {
		      $regex .= $matches[1] . 'i'; // Append first delimiter and i flag
		  }

		  try {
		      $files = scandir($dir);
		  } catch (Exception $ex) {
		      $files = ['.', '..'];
		  }
		  $files = array_slice($files, 2); // Remove '.' and '..'
		  $files = array_reduce($files, function($carry, $item) use ($regex) {
		      if ((!empty($regex) && preg_match($regex, $item)) || empty($regex)) {
		          array_push($carry, $item);
		      }

		      return $carry;
		  }, []);

		  return $files;
	}

	function str_finish($value, $cap)
	{
		  $quoted = preg_quote($cap, '/');

		  return preg_replace('/(?:'.$quoted.')+$/u', '', $value).$cap;
	}

	function get_directory_tree($dir)
	{
		  $fs = $this->get_files_in_dir($dir);
		  $files = array();
		  foreach ($fs as $k => $f) {
		      $s_path = $this->str_finish($dir, '/');
		      if (is_dir($s_path.$f)) {
		          $fs[] = array(
		              'name' => $f,
		              'isFolder' => true,
		              'content' => null,
		              'path' => $s_path.$f,
		              'children' => $this->get_directory_tree($this->str_finish($dir, '/').$f)
		          );
		      } else {
		          $filespath = \Drupal::service('file_system')->realpath('public://');	
		          $f_dir = str_replace($filespath,'',$dir);
		          $folder_path = 'public://'.$f_dir.'/'.$f;
		          $files[] = array(
		              'name' => $f,
		              'isFolder' => false,
		              'content' => strpos($f, 'json') !== false ? file_get_contents($folder_path) : null,
		              'path' => file_create_url($folder_path),
		              'children' => []
		          );
		      }
		      unset($fs[$k]);

		  }

		  $fs = array_merge($fs, $files);

		  return $fs;
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
		global $base_url;
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $nid = \Drupal::request()->get('id');

    $n = Node::load($nid);
	//$author_id = $n->getOwnerId();
	  $ownerUser = $n->getOwner()->getAccountName();
    $revisionUser = $n->getRevisionUser()->get('name')->value;
    
    $bcr = new BilimController();
    $language = $n->get('field_crs_lang')->value;
    $lang_code = '';
    if($language){
			$lang_code = $bcr->getLanguageCode($language);
		}
		
		$sid = \Drupal::entityQuery('node')
			->condition('type', 'style')
			->condition('field_s_courses', $nid)
			->execute();
			
		$sid = implode('', $sid);
		
		$external_files = $this->externalFiles($nid, $sid);

    $uri = '';
    //$uri = file_create_url($n->field_crs_thumbnail->entity->getFileUri());
    $result = array(
      'nid' => $n->id(),
      'type' => $n->getType(),
      'title' => $n->getTitle(),
	    'original_course_name' => $n->get('field_original_course_name')->value, 	
      'dispaly' => $n->get('field_crs_display')->value,
      'duration' => $n->get('field_crs_duration')->value,
      'eval_param' => $n->get('field_crs_eval_param')->value,
      'desc' => $n->get('field_crs_full_desc')->value,
      'isevaluation' => $n->get('field_crs_isevaluation')->value,
      'hasfeedback' => $n->get('field_crs_hasfeedback')->value,
      'keywords' => $n->get('field_crs_keywords')->value,
      'language' => $lang_code ? $lang_code : $language,
      'metadatas' => $n->get('field_crs_metadatas')->value,
      'no_of_words' => $n->get('field_crs_no_of_words')->value,
      'objectives' => $n->get('field_crs_objectives')->value,
      'short_desc' => $n->get('field_crs_short_desc')->value,
      'thumbnail' => $uri,
      'url_edit' => $n->get('field_crs_url_edit')->value,
      'crs_version' => $n->get('field_crs_version')->value,
      'nav_param' => $n->get('field_crs_nav_param')->value,
      'comp_param' => $n->get('field_crs_comp_param')->value,
      'external_texts' => $n->get('field_external_texts')->value,
      'external_files' => $external_files,
      'created' => gmdate('Y-m-d H:i:s',$n->created->value),
      'changed' => gmdate('Y-m-d H:i:s',$n->changed->value),
      'created_by' => $ownerUser,
      'modified_by' => $revisionUser ? $revisionUser : $ownerUser,
    );    
    
    $ids = $bcr->getDomainFromCourse($nid, 'course');
    $domainId = $ids['ids']['d_id'];
    $node = Node::load($domainId);
    $result['parent'] = array(
    	'id' => $node->id(),
	    'title' => $node->getTitle(),
	    'type' => $node->getType(),
    	'link' =>  $base_url . '/platform/domainview/'.$domainId.'/0/0',
    	'children' => $bcr->getCbyDomain($ids['ids'],$nid)
    );
    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }
  
  
  public function externalFiles($cid, $sid){
   	if($sid){
   		
			/*$sn = Node::load($sid);
			$fid = $sn->get('field_s_style_file')->getValue()[0]['target_id'];
			$file = File::load($fid);
			$file_name = $file->getFilename();
			$file_uri = $file->getFileUri();
			
			$stitle = $sn->getTitle();
			if($stitle == 'BASE STYLE'){
				$sf_path = 'public://base-style-01';
			}
			else{
		 		$sf_path = str_replace('/'.$file_name,'',$file_uri);
			}
			    
      $style_path = \Drupal::service('file_system')->realpath($sf_path);
			if (is_dir($style_path . '/external')) {
      	$result = $this->get_directory_tree($style_path . '/external');
      }
      else {
      	$result = '';
      }*/
      
      $media_ids = \Drupal::entityQuery('node')
				->condition('type', 'course_medias')
				->condition('field_cm_course',$cid)
				->condition('field_cm_course_style', $sid)
				->execute();
				
			$medias = Node::loadMultiple($media_ids);
      
      foreach($medias as $m){
      	$result[] = array(
		      		'id' => $m->id(),
              'name' => $m->getTitle(),
              'isFolder' => false,
              'path' => file_create_url($m->get('field_cm_file_path')->getString()),
              'children' => []
          );
      	
      }
      
      
		} 
		else{
			$result = 'No styles found for this course.';
		}

		return $result;
  }

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

    $n = Node::load($nid);

    $crs_nav = $n->get('field_crs_nav_param')->value;
    
    /*$external_texts = $n->get('field_external_texts')->value;
    
    if($external_texts){
    	$external_texts = json_decode($external_texts, true);
    }
    if(!empty($data->external_texts)){
    	$data->external_texts = json_decode($data->external_texts, true);
    }

    
		$translations = [];
		foreach($data->external_texts as $key => $val){
			$external_texts[$key] = $val;
		}*/

    $blmNav = json_decode($data->nav_param);
    $blmNavLv = $navigation->navigationlevel;
    $crs_nav = json_decode($n->get('field_crs_nav_param')->value,true);
    /*if($crs_nav){
      $crs_nav_lv = $crs_nav['nav_param']['navigationlevel'];
      if($blmNavLv < $crs_nav_lv){
        $crs_nav['nav_param']['navigationlevel'] = $blmNavLv;
      }
      $blmTocLv = $navigation->toclevel;
      $crs_toc_lv = $crs_nav['nav_param']['toclevel'];
      if($blmTocLv < $crs_toc_lv){
        $crs_nav['nav_param']['toclevel'] = $blmTocLv;
      }
      $n->set('field_crs_nav_param',json_encode($crs_nav));
    }
    else{
      $n->set('field_crs_nav_param',$data->nav_param);
    }*/
    if($data->title){
    	$n->setTitle($data->title);
		}
    $n->set('field_original_course_name', $data->original_course_name);
    $n->set('field_crs_duration', $data->duration);
    $n->set('field_crs_full_desc', $data->desc);
    $n->set('field_crs_short_desc', $data->short_desc);
    $n->set('field_crs_keywords', $data->keywords);
    $n->set('field_crs_lang', $data->language);
    $n->set('field_crs_no_of_words', $data->words);
    $n->set('field_crs_objectives', $data->objectives);
    $n->set('field_crs_version', $data->crs_version);
    $n->set('field_crs_isevaluation', $data->isevaluation);
    $n->set('field_crs_hasfeedback', $data->hasfeedback);
    $n->set('field_crs_nav_param',$data->nav_param);
    $n->set('field_external_texts', $data->external_texts);
    $n->set('field_crs_comp_param',$data->comp_param);    
    $n->set('field_crs_eval_param',$data->eval_param);
    $n->setRevisionUserId($uid);
    
     if(strtolower($data->isevaluation) == 'false'){
      	$chld_ids = $n->get('field_crs_children')->getValue();
      	if($chld_ids){
      		foreach($chld_ids as $key => $chld_id){
      			$chld_n = Node::load($chld_id['target_id']);
      			if($chld_n && $chld_n->getType() == 'feedback'){
      				$chld_n->delete();
      				unset($chld_ids[$key]);
      			}
      		}
      	}
      	$n->set('field_crs_children',$chld_ids);
      }
      

      
      $bcr = new BilimController();

      if(strtolower($data->hasfeedback) == 'true' && (strtolower($data->isevaluation) == 'true')){        
        $ftype = 'feedback';
        $crs_chld = $n->get('field_crs_children')->getValue();
        $crs_chld = array_column($crs_chld, 'target_id');
        $crs_chld_n = Node::loadMultiple($crs_chld);
        foreach($crs_chld_n as $c){
        	if($c->getType() == 'structure'){
				    $pcrs_fld = 'field_struct_children';
				    $chlds = $bcr->getElemChildren($c->id(),$pcrs_fld);
				    $fid = (int)$bcr->getChildrenByType($chlds,$ftype);
				    if($fid == 0){
				      $ftitle = $ftype;
				      $bcr->addChildElem($c->id(),$chlds,$ftype,$ftitle,$pcrs_fld);	
				    }
		      }
	      }
      }
    
    $res = $n->save();

    if($res > 0){
      $response = 'element updated successfully!';
    }
    else{
      $response = 'Unable to create a children!';
    }

    return new ResourceResponse($response);

  }
  
  
}
