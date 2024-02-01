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
 *   id = "template_rest_resource",
 *   label = @Translation("Template rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/template/{type}/{id}"
 *   }
 * )
 */
class TemplateRestResource extends ResourceBase {

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

  public function getTemplates($ids,$type,$crs_id){

    //get values 
    $nodes = Node::loadMultiple($ids);

    $result = array();  
    $bcr = new BilimController(); 
    
    $protocol = $_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
    $server = $protocol.'://'.$_SERVER['HTTP_HOST'];
    
    
    if($crs_id){
	  $style_ids = \Drupal::entityQuery('node')
		->condition('type', 'style')
		->condition('field_s_courses',$crs_id)
		->execute();
        
	  $style_id = implode('',$style_ids);
	  $style = Node::load($style_id);
	  $st_fw_version = $style->get('field_s_framework')->getString();
    }
    
    if($type == 'template'):

      if(!empty($nodes)):
        foreach($nodes as $n):
          $t_chld_elem = array();
          $dark_uri = '';
          $light_uri = '';
          $html_node = '';
          
          //$style_id = $bcr->getStyleByTemplate($n->id());
          
          $l_file = $n->field_t_thumbnaillight->entity->getFileUri();
          if (!$n->get('field_t_thumbnaildark')->isEmpty()):
            $d_file = $n->field_t_thumbnaildark->entity->getFileUri();
          //  $dark_uri = file_create_url($d_file);
            $furl = file_url_transform_relative(file_create_url($d_file));
            $dark_uri = $server.$furl;
          endif;
          if($l_file):
            //$light_uri = file_create_url($l_file);
            $furl = file_url_transform_relative(file_create_url($l_file));
            $light_uri = $server.$furl;
          endif;
          $file_url = $n->field_t_htmlnode->entity->getFileUri();
          $furl = file_url_transform_relative(file_create_url($file_url));
          $html_node = $server.$furl;
          $relative_path = \Drupal::service('file_system')->realpath($file_url);
          

          $in_t_var = $n->get('field_t_variants')->getValue();
          $in_t_var_res = $bcr->getTargetIds($in_t_var);
          if(!empty($in_t_var_res)):
            $t_chld_elem = $this->getTemplates($in_t_var_res,'variant',$crs_id);
            /* if(!empty($t_chld_elem)):
              $this->getTemplates($t_chld_elem,'variant');
            endif; */
          endif;

          $arr = array();
          $scope = array();
          $arr = $n->get('field_t_scope')->getValue();
          if(!empty($arr)):
            foreach($arr as $a):
              $scope[] = $a['value'];
            endforeach;
          endif;

          $scope_str = '';
          if(!empty($scope)):
            $scope_str = implode('|',$scope);
          endif;
          
          $temp_fw_version = $n->get('field_t_framework_min')->getString();

          if(version_compare($st_fw_version, $temp_fw_version,'>=')){
	          $result[] = array(
	            'nid' => $n->id(),
	            'type' => $n->getType(),
	            //'title' => $n->getTitle(),
	            'name' => $n->getTitle(),
	            //'canAddButton' => $n->get('field_t_canaddbutton')->value,
	            //'canAddSound' => $n->get('field_t_canaddsound')->value,
	            'context' => $n->get('field_t_context')->value,
	            'description' => $n->get('field_t_desc')->value,
	            'display' => $n->get('field_t_display')->value,
	            //'hasButton' => $n->get('field_t_hasbutton')->value,
	            //'hasSound' => $n->get('field_t_hassound')->value,
	            //'hasTarget' => $n->get('field_t_hastarget')->value,
	            //'htmlNode' => $html_node,
	            //'html' => file_get_contents($relative_path),
	            'info' => $n->get('field_t_info')->value,
	            'interaction' => $n->get('field_t_interaction')->value,
	            //'nbColumn' => $n->get('field_t_nbcolumn')->value,
	            //'nbMedia' => $n->get('field_t_nbmedia')->value,
	            //'nbTextLevel' => $n->get('field_t_nbtextlevel')->value,
	            'order' => $n->get('field_t_order')->value,
	            'scope' => $scope_str,
	            'theme' => $n->get('field_t_theme')->value,
	            'thumbnailDark' => $dark_uri,
	            'thumbnailLight' => $light_uri,
	            'variants' => $t_chld_elem,
	            'framework_min' => $n->get('field_t_framework_min')->value,
 	            'framework_max' => $n->get('field_t_framework_max')->value,
 	            'substitute_template' => $n->get('field_t_substitute_template')->getValue()[0]['target_id'],
 	            'course_context' => $n->get('field_t_course_context')->value,
	            'switchable' => $n->get('field_t_switchable')->value,
	            'warning' => $n->get('field_t_warning')->value,
	            //'created' => gmdate('Y-m-d H:i:s',$n->created->value),
	            //'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
	          );
          }
        endforeach;
      endif;

    elseif($type == 'category'):


      if(!empty($nodes)):
        foreach($nodes as $n):
	      $chld_elem = array();
	      $in_chld = array();
	      
          $nid = $n->id();
          $nc = Node::load($nid);
          
          $in_cat_chld = $nc->get('field_tc_template_category')->getValue();
          if(!empty($in_cat_chld)):
            $in_chld_cat_res = $bcr->getTargetIds($in_cat_chld);
            $chld_elem = $this->getTemplates($in_chld_cat_res,'category',$crs_id);
          else: 
            $in_chld = $nc->get('field_tc_children')->getValue();
            if(!empty($in_chld)):
              $in_chld_res = $bcr->getTargetIds($in_chld);
              $chld_elem = $this->getTemplates($in_chld_res,'template',$crs_id);
            endif; 
          endif;
          

          $result[] = array(
            'nid' => $nid,
            'title' => $n->getTitle(),
            'name' => $n->getTitle(),
            'description' => $n->get('field_tc_desc')->value,
            'type' => 'template-category',
            'info' => $n->get('field_tc_info')->value,
            'helpurl' => $n->get('field_tc_helpurl')->value,
            'menu' => $n->get('field_tc_menu')->value,
            'children' => $chld_elem
          );
        endforeach;
      endif;

    elseif($type == 'variant'):

      if(!empty($nodes)):
        foreach($nodes as $n):
          $t_dark_uri = '';
          $t_light_uri = '';
          $t_html_node = '';
          if(!empty($n->field_tv_thumbnaildark->getValue())):
            $t_dark = $n->field_tv_thumbnaildark->entity->getFileUri();
            $furl = file_url_transform_relative(file_create_url($t_dark));
            $t_dark_uri = $server.$furl;
          endif;
          
          if(!empty($n->field_tv_thumbnaillight->getValue())):
            $t_light = $n->field_tv_thumbnaillight->entity->getFileUri();
            $furl = file_url_transform_relative(file_create_url($t_light));
            $t_light_uri = $server.$furl;
          endif;

          if(!empty($n->field_tv_htmlnode->getValue())):
            $file_url = $n->field_tv_htmlnode->entity->getFileUri();
            $furl = file_url_transform_relative(file_create_url($file_url));
            $t_html_node = $server.$furl;
            $relative_path = \Drupal::service('file_system')->realpath($file_url);
          endif;

          $result[] = array(
            'nid' => $n->id(),
            //'title' => $n->getTitle(),
            'type' => 'template-variant',
            'name' => $n->getTitle(),
            'warning' => $n->get('field_tv_warning')->value,
            'info' => $n->get('field_tv_info')->value,
            'thumbnailDark' => $t_dark_uri,
            'thumbnailLight' => $t_light_uri,
            //'htmlNode' => $t_html_node,
            //'html' => file_get_contents($relative_path)
          );
        endforeach;
      endif;

    endif;
    
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
    
    $type = \Drupal::request()->get('type');
    $crs_id = \Drupal::request()->get('id');
    //$n = Node::load($type);
    $result = array();
    
    
    if($type == 'template'):
        //$nids = \Drupal::entityQuery('node')->condition('type','domain')->condition('uid',$uid)->execute();
        /* $display = \Drupal::request()->query->get('display');
        if($display != ''):
            $nids = \Drupal::entityQuery('node')->condition('type','template')->condition('field_t_dispaly',$display)->execute();
        else:
            
        endif; */
        $bcr = new BilimController();
        $nids = \Drupal::entityQuery('node')
                ->condition('type','templates_root') 
		->sort('field_tr_order', 'ASC')
                //->condition('field_tc_template_category','','<>')
                //->condition('field_tc_parent','1')
                ->execute();  
                //top, main, misc, bottom, course template
        //$nids = array(1,5,23,24,25);

        $nodes = Node::loadMultiple($nids); 
        $result = array();    
        
        if(!empty($nodes)):
            foreach($nodes as $n):
              $in_chld = $n->get('field_tr_children')->getValue();
              $in_chld_res = $bcr->getTargetIds($in_chld);
              $chld_elem = $this->getTemplates($in_chld_res,'category',$crs_id);

              $result[] = array(
                'nid' => $n->id(),
                //'title' => $n->getTitle(),
                'name' => $n->getTitle(),
                'description' => $n->get('field_tr_desc')->value,
                'type' => "template-root",
                //'info' => $n->get('field_tc_info')->value,
                //'helpurl' => $n->get('field_tc_helpurl')->value,
                'menu' => $n->get('field_tr_menu')->value,
                'children' => $chld_elem
              );
            endforeach;
        endif;
    elseif($type == 'category'):
        //template_category
        $nids = \Drupal::entityQuery('node')->condition('type','template_category')->execute();
        $nodes = Node::loadMultiple($nids); 
        
        if(!empty($nodes)):
            foreach($nodes as $n):
                $result[] = array(
                    'nid' => $n->id(),
                    'type' => "template-category",
                    'title' => $n->getTitle(),
                    'children' => $n->get('field_tc_children')->value,
                    'description' => $n->get('field_tc_desc')->value,
                    'helpurl' => $n->get('field_tc_helpurl')->value,
                    'info' => $n->get('field_tc_info')->value,
                    'menu' => $n->get('field_tc_menu')->value,
                    //'name' => $n->get('field_tc_name')->value,
                    'category' => $n->get('field_tc_template_category')->value,
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                  );
            endforeach;
        endif;

    elseif($type == 'templatevariant'):
        //templatevariant
        $nids = \Drupal::entityQuery('node')->condition('type','templatevariant')->execute();
        $nodes = Node::loadMultiple($nids); 
        
        if(!empty($nodes)):
            foreach($nodes as $n):
                $result[] = array(
                    'nid' => $n->id(),
                    'type' => $n->getType(),
                    'title' => $n->getTitle(),
                    'name' => $n->getTitle(),
                    'children' => $n->get('field_tv_display')->value,
                    'htmlNode' => $n->get('field_tv_htmlnode')->value,
                    'info' => $n->get('field_tv_info')->value,
                    'order' => $n->get('field_tv_order')->value,
                    'thumbnailDark' => $n->get('field_tv_thumbnaildark')->value,
                    'thumbnailLight' => $n->get('field_tv_thumbnaillight')->value,
                    'warning' => $n->get('field_tv_warning')->value,
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                  );
            endforeach;
        endif;
    elseif($type == 'theme'):
      //theme
      $nids = \Drupal::entityQuery('node')->condition('type','theme')->execute();
      $nodes = Node::loadMultiple($nids); 
      
      if(!empty($nodes)):
          foreach($nodes as $n):
              $furl = '';
              if (!$n->get('field_theme_thumbnail')->isEmpty()):
                $uri = $n->field_theme_thumbnail->entity->getFileUri();
                $furl = file_url_transform_relative(file_create_url($uri));
                $protocol = $_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
                $server = $protocol.'://'.$_SERVER['HTTP_HOST'];
                $url = $server.$furl;
                $allowIntroduction = $n->get('field_allow_introduction')->getString();
              endif;
              $result[] = array(
                  'nid' => $n->id(),
                  'url' => $url,
                  'name' => $n->getTitle(),
                  'allowIntroduction' => $allowIntroduction,
                );
          endforeach;
      endif;
    endif;

    $response = new ResourceResponse((array)$result);
    //$response->addCacheableDependency($result);
    return $response; 
  }
  
}
