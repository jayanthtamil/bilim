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
 *     "canonical" = "/api/template/{type}"
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

  public function getTemplates($ids,$type){
    //get values 
    $nodes = Node::loadMultiple($ids);

    $result = array();  
    $bcr = new BilimController();  
    if($type == 'template'):

      if(!empty($nodes)):
        foreach($nodes as $n):
          $dark_uri = '';
          $light_uri = '';
          $html_node = '';
          
          $l_file = $n->field_t_thumbnaillight->entity->getFileUri();
          if (!$n->get('field_t_thumbnaildark')->isEmpty()):
            $d_file = $n->field_t_thumbnaildark->entity->getFileUri();
            $dark_uri = file_create_url($d_file);
          endif;
          if($l_file):
            $light_uri = file_create_url($l_file);
          endif;
          //$html_node = file_create_url($n->field_t_htmlnode->entity->getFileUri());
          $file_url = $n->field_t_htmlnode->entity->getFileUri();
          $html_node = file_create_url($file_url);
          $relative_path = \Drupal::service('file_system')->realpath($file_url);
          

          $in_t_var = $n->get('field_t_variants')->getValue();
          $in_t_var_res = $bcr->getTargetIds($in_t_var);
          if(!empty($in_t_var_res)):
            $t_chld_elem = $this->getTemplates($in_t_var_res,'variant');
            if(!empty($t_chld_elem)):
              $this->getTemplates($t_chld_elem,'templatevariant');
            endif;
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
          
          $result[] = array(
            'nid' => $n->id(),
            'type' => $n->getType(),
            'title' => $n->getTitle(),
            'name' => $n->get('field_t_name')->value,
            'canAddButton' => $n->get('field_t_canaddbutton')->value,
            'canAddSound' => $n->get('field_t_canaddsound')->value,
            'context' => $n->get('field_t_context')->value,
            'description' => $n->get('field_t_description')->value,
            'display' => $n->get('field_t_display')->value,
            'hasButton' => $n->get('field_t_hasbutton')->value,
            'hasSound' => $n->get('field_t_hassound')->value,
            'hasTarget' => $n->get('field_t_hastarget')->value,
            'htmlNode' => $html_node,
            'html' => file_get_contents($relative_path),
            'info' => $n->get('field_t_info')->value,
            'interaction' => $n->get('field_t_interaction')->value,
            'name' => $n->get('field_t_name')->value,
            'nbColumn' => $n->get('field_t_nbcolumn')->value,
            'nbMedia' => $n->get('field_t_nbmedia')->value,
            'nbTextLevel' => $n->get('field_t_nbtextlevel')->value,
            'order' => $n->get('field_t_order')->value,
            'scope' => $scope_str,
            'theme' => $n->get('field_t_theme')->value,
            'thumbnailDark' => $dark_uri,
            'thumbnailLight' => $light_uri,
            'variants' => $t_chld_elem,
            'warning' => $n->get('field_t_warning')->value,
            'created' => gmdate('Y-m-d H:i:s',$n->created->value),
            'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
          );
        endforeach;
      endif;

    elseif($type == 'category'):

      $chld_elem = array();
      $in_chld = array();

      if(!empty($nodes)):
        foreach($nodes as $n):

          $nid = $n->id();
          $nc = Node::load($nid);
          
          $in_cat_chld = $nc->get('field_tc_template_category')->getValue();
          if(!empty($in_cat_chld)):
            $in_chld_cat_res = $bcr->getTargetIds($in_cat_chld);
            $chld_elem = $this->getTemplates($in_chld_cat_res,'category');
          else: 
            $in_chld = $nc->get('field_tc_children')->getValue();
            if(!empty($in_chld)):
              $in_chld_res = $bcr->getTargetIds($in_chld);
              $chld_elem = $this->getTemplates($in_chld_res,'template');
            endif; 
          endif;
          

          $result[] = array(
            'nid' => $nid,
            'title' => $n->getTitle(),
            'name' => $n->getTitle(),
            'description' => $n->get('field_tc_description')->value,
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
          if(!empty($n->field_temvar_thumbnaildark->getValue())):
            $t_dark_uri = file_create_url($n->field_temvar_thumbnaildark->entity->getFileUri());
          endif;
          if(!empty($n->field_temvar_thumbnaillight->getValue())):
            $t_light_uri = file_create_url($n->field_temvar_thumbnaillight->entity->getFileUri());
          endif;
          if(!empty($n->field_temvar_htmlnode->getValue())):
            $file_url = $n->field_temvar_htmlnode->entity->getFileUri();
            $t_html_node = file_create_url($file_url);
            $relative_path = \Drupal::service('file_system')->realpath($file_url);
          endif;
          

          $result[] = array(
            'nid' => $n->id(),
            'title' => $n->getTitle(),
            'type' => 'template-variant',
            'name' => $n->getTitle(),
            'warning' => $n->get('field_temvar_warning')->value,
            'type' => 'template-category',
            'info' => $n->get('field_temvar_info')->value,
            'thumbnailDark' => $t_dark_uri,
            'thumbnailLight' => $t_light_uri,
            'htmlNode' => $t_html_node,
            'html' => file_get_contents($relative_path)
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
  public function get($type) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    
    //$n = Node::load($type);

    if($type == 'template'):
        //$nids = \Drupal::entityQuery('node')->condition('type','domain')->condition('uid',$uid)->execute();
        /* $display = \Drupal::request()->query->get('display');
        if($display != ''):
            $nids = \Drupal::entityQuery('node')->condition('type','template')->condition('field_t_dispaly',$display)->execute();
        else:
            
        endif; */
        $bcr = new BilimController();
        /* $nids = \Drupal::entityQuery('node')
                ->condition('type','template_category') 
                ->condition('field_tc_template_category','template_category') 
                ->execute(); */
        $nids = array(3524,3525,3526,3527,3718);
        $nodes = Node::loadMultiple($nids); 
        $result = array();    
        //'children' => $n->get('field_tc_children')->value,
        //'category' => $n->get('field_tc_template_category')->value,
        if(!empty($nodes)):
            foreach($nodes as $n):
              $in_chld = $n->get('field_tc_template_category')->getValue();
              $in_chld_res = $bcr->getTargetIds($in_chld);
              $chld_elem = $this->getTemplates($in_chld_res,'category');

              $result[] = array(
                'nid' => $n->id(),
                'title' => $n->getTitle(),
                'name' => $n->getTitle(),
                'description' => $n->get('field_tc_description')->value,
                'type' => "template-category",
                'info' => $n->get('field_tc_info')->value,
                'helpurl' => $n->get('field_tc_helpurl')->value,
                'menu' => $n->get('field_tc_menu')->value,
                'children' => $chld_elem
              );
            endforeach;
        endif;
    elseif($type == 'category'):
        //template_category
        $nids = \Drupal::entityQuery('node')->condition('type','template_category') ->execute();
        $nodes = Node::loadMultiple($nids); 
        
        if(!empty($nodes)):
            foreach($nodes as $n):
                $result[] = array(
                    'nid' => $n->id(),
                    'type' => "template-category",
                    'title' => $n->getTitle(),
                    'children' => $n->get('field_tc_children')->value,
                    'description' => $n->get('field_tc_description')->value,
                    'helpurl' => $n->get('field_tc_helpurl')->value,
                    'info' => $n->get('field_tc_info')->value,
                    'menu' => $n->get('field_tc_menu')->value,
                    'name' => $n->get('field_tc_name')->value,
                    'category' => $n->get('field_tc_template_category')->value,
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                  );
            endforeach;
        endif;

    elseif($type == 'templatevariant'):
        //templatevariant
        $nids = \Drupal::entityQuery('node')->condition('type','templatevariant') ->execute();
        $nodes = Node::loadMultiple($nids); 
        
        if(!empty($nodes)):
            foreach($nodes as $n):
                $result[] = array(
                    'nid' => $n->id(),
                    'type' => $n->getType(),
                    'title' => $n->getTitle(),
                    'children' => $n->get('field_temvar_display')->value,
                    'htmlNode' => $n->get('field_temvar_htmlnode')->value,
                    'info' => $n->get('field_temvar_info')->value,
                    'name' => $n->get('field_temvar_name')->value,
                    'order' => $n->get('field_temvar_order')->value,
                    'thumbnailDark' => $n->get('field_temvar_thumbnaildark')->value,
                    'thumbnailLight' => $n->get('field_temvar_thumbnaillight')->value,
                    'warning' => $n->get('field_temvar_warning')->value,
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                  );
            endforeach;
        endif;
    elseif($type == 'theme'):
      //theme
      $nids = \Drupal::entityQuery('node')->condition('type','theme') ->execute();
      $nodes = Node::loadMultiple($nids); 
      
      if(!empty($nodes)):
          foreach($nodes as $n):
              $uri = '';
              $uri = file_create_url($n->field_theme_thumbnail->entity->getFileUri());
              $result[] = array(
                  'nid' => $n->id(),
                  'url' => $uri,
                  'name' => $n->get('field_theme_name')->value
                );
          endforeach;
      endif;
    endif;

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }
  
}