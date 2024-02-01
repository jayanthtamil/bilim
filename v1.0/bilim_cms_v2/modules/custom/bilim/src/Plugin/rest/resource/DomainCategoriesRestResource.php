<?php

namespace Drupal\bilim\Plugin\rest\resource;

use Drupal\rest\ModifiedResourceResponse;
use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
//use Drupal\Core\Render\Element;
use Drupal\rest\ResourceResponse;
use Drupal\bilim\Controller\BilimController;
use Drupal\Component\Utility\NestedArray;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Log\LoggerInterface;
use Psy\Exception\Exception;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "domain_cat_rest_resource",
 *   label = @Translation("Domain Category rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/domain_categories/{id}"
 *   }
 * )
 */

 class DomainCategoriesRestResource extends ResourceBase {

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
      global $base_url;
      // You must to implement the logic of your REST Resource here.
      // Use current user after pass authentication to validate access.
      if (!$this->currentUser->hasPermission('access content')) {
        throw new AccessDeniedHttpException();
      }

      $nid = \Drupal::request()->get('id');
      //$payload = \Drupal::request()->getContent();
      $uid = $this->currentUser->id();

      /* if(!empty($payload)):
        $data = json_decode($payload);
      endif;
      
      if(!empty($data->id)): 
        $nid = $data->id;
      endif; */ 
  
      $bcr = new BilimController();

      $domain = Node::load($nid);
      $root = 0;
      $cf = 0;

      $domains = $bcr->getCFbyDomain($nid,$root,$cf);
      $courses = $bcr->getContentbyDomain($nid,$root,$cf);

      //print_r($domains[0]); die();
      //print_r($courses); die();
      
      $domain_folders = $domains[0]['children'];

      //print_r($domains[0]); die();
      //print_r($domain_folders); die();

      //echo $base_url."\n"; 
      $module_handler = \Drupal::service('module_handler');
      $module_path = $module_handler->getModule('bilimauth')->getPath();
      //echo $module_path."\n"; 

      $global_flag_image_path = $base_url."/".$module_path."/images/flags/global.png";
      //echo $global_flag_image_path;
      //die();

      $result_arr = array();

      for($i = 0; $i < count($domain_folders); $i++) {
        $item = $domain_folders[$i];
        
        $id = $item['id'];

        $title = $item['title'];
        $type = $item['type'];
        $uri = $item['link'];
        $children = $item['children'];
        $status = $item['status'];
        $curnode = $item['curnode'];

        //$hasChildren = $children && count($children) > 0;
        $hasChildren = isset($children) && count($children) > 0;

        //echo "main folder :: ".$id."==".$title."==".$uri."\n";
        //echo "<pre>";
        //print_r($children);
        //echo "\n";

        $link_arr1 = explode("/domainview/",$uri);
        $link_arr2 = explode("/",$link_arr1[1]);
        $main_cat_courses = $bcr->getContentbyDomain($nid,$link_arr2[1],$link_arr2[2]);

        //echo "MAIN CAT COURSES: ";
        //print_r($main_cat_courses); echo "\n";

        /* $result_main_course_arr = array();
        foreach($main_cat_courses as $mc_course){
          if($mc_course['type'] == "course") {

            if($mc_course['flag_url'] == "")
            {
              $mc_flag_url = $global_flag_image_path;
            }
            else {
              $mc_flag_url = $mc_course['flag_url'];
            }

            $main_cat_temp_courses_arr = array(
              'id' => $mc_course['id'],
              'title' => $mc_course['title'],
              'type' => $mc_course['type'],
              'language' => $mc_course['language'],
              'flag_url' => $mc_flag_url,
              'style_id' => $mc_course['style_id'],
              'style_name' => $mc_course['style_name']
            );

            array_push($result_main_course_arr, $main_cat_temp_courses_arr);
          }  
        }  

        $category_courses = array_merge($children,$result_main_course_arr); */

        $result_arr[] = array(
          'id' => $id,
          'title' => $title,
          'type' => $type,
          'link' => $uri,
          'status' => $status,
          'curnode' => $curnode
        );    
        
        /* $result_arr[] = array(
          'id' => $id,
          'title' => $title,
          'type' => $type,
          'link' => $uri,
          'status' => $status,
          'curnode' => $curnode,
          'children' => $children
        ); */            

      }

      foreach($courses as $dcourse){

        if($dcourse['type'] == "course") {

          if($dcourse['flag_url'] == "")
          {
            $dc_flag_url = $global_flag_image_path;
          }
          else {
            $dc_flag_url = $dcourse['flag_url'];
          }

          $result_arr[] = array(
            'id' => $dcourse['id'],
            'title' => $dcourse['title'],
            'type' => $dcourse['type'],
            'language' => $dcourse['language'],
            'flag_url' => $dc_flag_url,
            'style_id' => $dcourse['style_id'],
            'style_name' => $dcourse['style_name']
          );   
        }  
      }  
      
      $result['domain'] = $result_arr;
  
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
    /* public function patch() {
  
      // You must to implement the logic of your REST Resource here.
      // Use current user after pass authentication to validate access.
      if (!$this->currentUser->hasPermission('access content')) {
        throw new AccessDeniedHttpException();
      }
      $response = '';
  
      
      return new ResourceResponse($response);
    } */
    
  }
