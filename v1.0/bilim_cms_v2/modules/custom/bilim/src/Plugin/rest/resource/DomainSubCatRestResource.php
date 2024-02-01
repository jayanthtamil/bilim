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
 *   id = "domain_subcat_rest_resource",
 *   label = @Translation("Domain Sub Categories rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/domain_sub_categories/{id}/{root}/{domainId}"
 *   }
 * )
 */

 class DomainSubCatRestResource extends ResourceBase {

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
      $root = \Drupal::request()->get('root');
      $domainId = \Drupal::request()->get('domainId');
      //$payload = \Drupal::request()->getContent();
      $uid = $this->currentUser->id();

      //echo $nid."==".$root."==".$domainId; die();

      /* if(!empty($payload)):
        $data = json_decode($payload);
      endif;
      
      if(!empty($data->link)): 
        $uri = $data->link;
      endif; */ 
  
      $bcr = new BilimController();

      $category = Node::load($nid);
      //echo $nid."==".$uri."\n";

      $module_handler = \Drupal::service('module_handler');
      $module_path = $module_handler->getModule('bilimauth')->getPath();
      $global_flag_image_path = $base_url."/".$module_path."/images/flags/global.png";

      //$link_arr1 = explode("/domainview/",$uri);
      //$link_arr2 = explode("/",$link_arr1[1]);
      $domains = $bcr->getCFbyDomain($domainId,$root,$nid);
      $category_courses = $bcr->getContentbyDomain($domainId,$root,$nid);
      $domain_folders = $domains[0]['children'];

      

      //print_r($category_courses); die();
      //print_r($domains); die();

      $result_course_arr = array();
      foreach($category_courses as $cat_course){
        if($cat_course['type'] == "course") {

          if($cat_course['flag_url'] == "")
          {
            $course_flag_url = $global_flag_image_path;
          }
          else {
            $course_flag_url = $cat_course['flag_url'];
          }

          $cat_temp_courses_arr = array(
            'id' => $cat_course['id'],
            'title' => $cat_course['title'],
            'type' => $cat_course['type'],
            'language' => $cat_course['language'],
            'flag_url' => $course_flag_url,
            'style_id' => $cat_course['style_id'],
            'style_name' => $cat_course['style_name']
          );

          array_push($result_course_arr, $cat_temp_courses_arr);
        }  
        else {
          //$cf_val = $cat_course['id'];
          //$cf_root = $domains[0]['id'];
          //echo $cf_root." > ".$cf_val."\n";
          $cat_link = $base_url . '/platform/domainview/' . $domainId . '/' . $root . '/' . $cat_course['id'];
          //echo $cat_course['title']."====".$link."\n";
          $cat_temp_courses_arr = array(
            'id' => $cat_course['id'],
            'title' => $cat_course['title'],
            'type' => $cat_course['type'],
            'link' => $cat_link
            
          );

          array_push($result_course_arr, $cat_temp_courses_arr);
        }

      }   
      //print_r($result_course_arr); die();
      
      $result['categories'] = $result_course_arr;
  
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
