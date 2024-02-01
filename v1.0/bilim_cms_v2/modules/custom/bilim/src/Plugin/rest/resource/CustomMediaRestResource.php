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
 *   id = "custom_media_rest_resource",
 *   label = @Translation("Custom media rest resource"),
 *   uri_paths = {
 *     "create" = "/api/custom_media/elem",
 *     "canonical" = "/api/custom_media/{id}"
 *   }
 * )
 */
class CustomMediaRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;


  /**
  * Constructs a new CustomMediaRestResource object.
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
    
    /* $nid = \Drupal::entityQuery('node')
			->condition('type', 'course_medias')
			->condition('field_cm_course_element',$pp_id)
			->execute();
    
    $nid = implode('',$nid); */
    $n = Node::load($nid);
    
    $file_system = \Drupal::service('file_system');
    $cm_path = $n->get('field_cm_file_path')->getString();
    $cm_abs_path = $file_system->realpath($cm_path);
    
    $cm_dir = scandir($cm_abs_path);
	$matches = array_filter($cm_dir, function ($haystack) {
	    return(strpos($haystack, '.js'));
	});
	
	if($matches){
		$js = implode('',$matches);
	    
	    $js_file = file_get_contents($cm_abs_path.'/'.$js);
	    preg_match_all('`Text\("([^"]*)"`', $js_file, $results);
	    
	    $translations = [];
		foreach ($results[1] as $key => $str){
			$translations[] = [ 
					'id' => $key, 
					'text' => $str
			]; 
		}
	}
	else{
		$html_filter = array_filter($cm_dir, function ($haystack) {
				    return(strpos($haystack, '.html'));
				});
		$html = implode('',$html_filter);
    	$index_html = file_get_contents($cm_abs_path.'/'.$html);
		$index_html = str_replace(['<br>','<br />','<br/>','\n','\r'],[PHP_EOL,PHP_EOL,PHP_EOL,PHP_EOL,PHP_EOL],$index_html);
		$dom = new \DomDocument;
		$dom->loadHTML($index_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

		$xpath = new \DOMXPath($dom);
		$blm_text = $xpath->query('//@blm-text');
		
		$blm_values = [];
		foreach($blm_text as $blm){
			$attr = $blm->value;
			$ele = $xpath->query('//*[@blm-text="'.$attr.'"]')->item(0);
			$blm_values[] = $ele->nodeValue;
		}

		/*$body = $dom->getElementsByTagName('body')->item(0);
		$body_str = $body->textContent;

		$body_str = trim($body_str);

		$body_arr = explode(PHP_EOL, $body_str);*/

		$translations = [];
		foreach ($blm_values as $key => $str){
		if(strpos($str, '\\') !== false){
			$str = preg_replace("/\\n/", PHP_EOL, $str);

		}
				$translations[] = [ 
						'id' => $key, 
						'text' => trim($str)
				]; 
		}

		$script = $dom->getElementsByTagName('script');
	
		$options = [];
		foreach ($script as $i => $val){
			if($script[$i]->nodeValue){
				$options[] = json_decode(explode('=',$script[$i]->nodeValue)[1],true);	
			}
		}
		
		$external_files = scandir($cm_abs_path.'/external');
		$attachments = [];
		foreach ($external_files as $x => $item){
			if($item != "." && $item != ".."){
					$rand_id = rand(1,100);
					$media_file = $cm_path.'/external/'.$external_files[$x];
					$media_file_path = file_create_url($media_file);
					$media_path = explode($_SERVER['HTTP_HOST'],$media_file_path)[1];
					$attachments[] = [
							"id"=> $nid.'-'.$rand_id,
							"name" => $external_files[$x],
							"path" => $media_path,
							"mimeType" => mime_content_type($media_file)
						];
			}
		}
	}
	
	
    $result = array(
      'translations' => $translations,
      'options' => $options ? $options : null,
      'attachments' => $attachments ? $attachments : null,
    );

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response;
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
      $data = json_decode($datas,true);
    endif;
    

    $n = Node::load($nid);
    
    $file_system = \Drupal::service('file_system');
    $cm_path = $n->get('field_cm_file_path')->getString();
    $cm_abs_path = $file_system->realpath($cm_path);
    
    $cm_dir = scandir($cm_abs_path);
	$matches = array_filter($cm_dir, function ($haystack) {
	    return(strpos($haystack, '.js'));
	});
	
    if($matches){
    	
    	$js = implode('',$matches);
    	
    	$js_file = file_get_contents($cm_abs_path.'/'.$js);
	    preg_match_all('`Text\("([^"]*)"`', $js_file, $results);
	    
	    $translations = [];
		foreach($data['translations'] as $key => $val){
			$breaks = array("<br />","<br>","<br/>");
			$text = str_ireplace($breaks, "&lt;br&gt;", $val['text']);
			$translations[] = $text;
		}

		$replace = $js_file;
	    foreach($translations as $i => $val){

		if($results[1][$i] == ''){
		  $replace = preg_replace('/\"\"/','"'.$translations[$i].'"',$replace, 1);
		}else{
	    		$replace = str_replace($results[1][$i],$translations[$i],$replace);
		}
	    }
	    
	    $html_filter = array_filter($cm_dir, function ($haystack) {
				    return(strpos($haystack, '.html'));
			});
			
			if(!empty($html_filter)){
				$html = implode('', $html_filter);
				rename($cm_abs_path.'/'.$html, $cm_abs_path.'/index.html');
			}
			
			if(file_exists($cm_abs_path.'/'.$js)){
	  		rmdir($cm_abs_path.'/'.$js);
	  	}
	  	
	  	$new_js = fopen($cm_abs_path.'/'.$js, 'w+');
	  	fwrite($new_js,$replace);
	  	fclose($new_js);
    }
	else{
	    if(in_array('translations',array_keys($data))){
			$html_filter = array_filter($cm_dir, function ($haystack) {
				    return(strpos($haystack, '.html'));
				});
			$html = implode('',$html_filter);
			$index_html = file_get_contents($cm_abs_path.'/'.$html);

			$translations = [];
			foreach($data['translations'] as $key => $val){
				$breaks = array("<br />","<br>","<br/>");
				//$text = str_ireplace($breaks, "&lt;br&gt;", $val['text']);
				$text = html_entity_decode($val['text']);
				$translations[] = $text;
			}

			$dom = new \DomDocument;
			$dom->loadHTML($index_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);


			$xpath = new \DOMXPath($dom);
			$blm_text = $xpath->query('//@blm-text');
			
			$blm_values = [];
			foreach($blm_text as $i => $blm){
				$attr = $blm->value;
				$ele = $xpath->query('//*[@blm-text="'.$attr.'"]')->item(0);
				$ele->nodeValue = $translations[$i];
			}
			$new_html = html_entity_decode($dom->saveHTML());


			/*$body = $dom->getElementsByTagName('body')->item(0);
			$str = $body->textContent;
			$str = trim(preg_replace( "/\s\s+/", "\n",$str));
			$old_arr = explode(PHP_EOL, $str);
			$old_arr = $blm_values;
			$index_html = str_replace('<br />',PHP_EOL,$index_html);

			$replace = str_replace($old_arr,$translations,$index_html);*/

			if(file_exists($cm_abs_path.'/'.$html)){
				rmdir($cm_abs_path.'/'.$html);
			}
				
		
			$index_file = fopen($cm_abs_path.'/'.$html, 'w+');
			fwrite($index_file,$new_html);
			fclose($index_file);
	    }
	    
	    if(in_array('options',array_keys($data))){
			$html_filter = array_filter($cm_dir, function ($haystack) {
				    return(strpos($haystack, '.html'));
				});
			$html = implode('',$html_filter);
	    	$index_html = file_get_contents($cm_abs_path.'/'.$html);
			
			$options = json_encode($data['options'],JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
			
			$dom = new \DomDocument;
			$dom->loadHTML($index_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
	    	$script = $dom->getElementsByTagName('script');
	
			foreach ($script as $i => $val){
				if($script[$i]->nodeValue && (strpos($script[$i]->nodeValue,'options =') !== false)){
					$old_options = trim(explode('=',$script[$i]->nodeValue)[1]);
				}
			}
	
			$replace = str_replace($old_options,$options,$index_html);
			
			if(file_exists($cm_abs_path.'/'.$html)){
				rmdir($cm_abs_path.'/'.$html);
			}
			
			$index_file = fopen($cm_abs_path.'/'.$html, 'w+');
			fwrite($index_file,$replace);
			fclose($index_file);
	    }
  	}
    
	    
    //$translated_text = explode(PHP_EOL,$data);
    
    $n->setRevisionUserId($uid);
    $res = $n->save(); 
    $response = 'node not updated yet!';
    if($res):
      $response = 'node saved!';
    endif;
    return new ResourceResponse($response);
  }

}
