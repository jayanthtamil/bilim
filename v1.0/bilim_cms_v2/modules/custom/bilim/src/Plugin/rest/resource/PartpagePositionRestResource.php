<?php  namespace Drupal\bilim\Plugin\rest\resource;

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
 *   id = "parpage_position_rest_resource",
 *   label = @Translation("Partpage position rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/pp_position/{id}",
 *     "create" = "/api/pp_position/new/{id}"
 *   }
 * )
 */
class PartpagePositionRestResource extends ResourceBase {

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

    $ptype = $pn->getType();
    if($ptype == 'page'):
        $chld = $pn->field_page_children->getValue();
        $chlds = $bcr->getTargetIds($chld);

        $result = array();
        $nodes = Node::loadMultiple($chlds);

        if(!empty($nodes)):
            foreach($nodes as $n):
                $type = $n->getType();
                $phtml = '';
                $template = array();
                $pp_temp_id = $n->field_pp_template->getValue();
                if(!empty($pp_temp_id)):
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
                    'dark_thumb' => $dark_uri,
                    'light_uri' => $light_uri
                  );
                endif;

                $phtml = $n->get('field_pp_html');
                $pp_type = $n->get('field_pp_template_type');
                
                $result['templates'][] = array(
                    'nid' => $n->id(),
                    'type' => $pp_type,
                    'name' => $n->getTitle(),
                    'template' => $template,
                    'html' => $phtml,
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                );
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
                if(!empty($pp_temp_id)):
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
                        'dark_thumb' => $dark_uri,
                        'light_uri' => $light_uri
                    );
                endif;
                
                $phtml = $n->get('field_spp_html');
                $pp_type = $n->get('field_spp_template_type');
                
                $result['templates'][] = array(
                    'nid' => $n->id(),
                    'type' => $pp_type,
                    'name' => $n->getTitle(),
                    'template' => $template,
                    'html' => $phtml,
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                );
            endforeach;
        endif;
        //$result['htmlDoc'] = $pn->field_sp_html->getValue();

    elseif($ptype == 'screen'):
        $temp_id = $pn->field_scr_template->getValue();
        if(!empty($temp_id)):
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

          $result['mainTemplate'] = array(
            'id' => $tn->id(),
            'name' => $tn->getTitle(),
            'dark_thumb' => $dark_uri,
            'light_uri' => $light_uri
          );

        endif;
        
        
        $result['templates'] = array(
          'nid' => $pn->id(),
          'type' => $pn->getType(),
          'title' => $pn->getTitle(),
          'tempType' => $pn->get('field_scr_template_type'),
          'html' => $pn->get('field_scr_html'),
          'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
          'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
        );
        //$result['htmlDoc'] = $pn->field_scr_html_doc->getValue();

    elseif($ptype == 'question'):

      $temp_id = $pn->field_ques_template->getValue();
      if(!empty($temp_id)):
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
        
        $result['mainTemplate'] = array(
          'id' => $tn->id(),
          'name' => $tn->getTitle(),
          'dark_thumb' => $dark_uri,
          'light_uri' => $light_uri
        );
      endif;
      
      $result['templates'] = array(
        'nid' => $pn->id(),
        'type' => $pn->getType(),
        'title' => $pn->getTitle(),
        'tempType' => $pn->get('field_ques_template_type'),
        'html' => $pn->get('field_ques_html'),
        'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
        'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
      );
      //$result['htmlDoc'] = $pn->field_ques_html_doc->getValue();
      
    elseif($ptype == 'simple_content'):
      $temp_id = $pn->field_sc_template->getValue();
      if(!empty($temp_id)):
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
          
          $result['mainTemplate'] = array(
              'id' => $tn->id(),
              'name' => $tn->getTitle(),
              'dark_thumb' => $dark_uri,
              'light_uri' => $light_uri
          );
      
      endif;
      
      
      $result['templates'] = array(
          'nid' => $pn->id(),
          'type' => $pn->getType(),
          'title' => $pn->getTitle(),
          'tempType' => $pn->get('field_sc_template_type'),
          'html' => $pn->get('field_sc_html'),
          'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
          'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
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

    $data = array();
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;

    $action = 'new';
    if(!empty($data->action)): 
      $action = 'duplicate';
    endif;

    if(isset($action) && $action == 'duplicate'):

      $n = Node::load($nid);
      $n->setRevisionUserId($uid);
      $n->save();

      // clone a node
      $p_cloned_node = $n->createDuplicate();
      $par_type = $p_cloned_node->getType();
      $p_ctitle = $p_cloned_node->getTitle();
      $p_cloned_node->setTitle($p_ctitle.'-duplicated');
      $p_cloned_node->save();
      $last_pnode_id = $p_cloned_node->id();

      if(!empty($data)):
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
      endif;
      $response = 'element duplicated successfully!';

    endif;
    
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
    if(!empty($datas)):
      $data = json_decode($datas);
    endif;

    if(!empty($data)){
        
      $n = Node::load($nid);
      $pType = $n->getType();

      if($pType == 'simple_page'){
        $new_chld = array();
        //for($i=0;$i<$count;$i++):
        foreach($data->templateIds as $pp_id){
                $new_chld[] = array(
                    'target_id' => $pp_id
                );
        }
        
        //$n->set('field_page_template',$data['temp_id']);
        $n->set('field_sp_children',$new_chld);
        //$n->set('field_sp_html',$data->htmlDoc);
        $n->setRevisionUserId($uid);
        $n->save(); 
        
      }
      elseif ($pType == 'page'){
        $new_chld = array();
        //for($i=0;$i<$count;$i++):
        foreach($data->templateIds as $pp_id){
                $new_chld[] = array(
                    'target_id' => $pp_id
                );
        }
        
        //$n->set('field_page_template',$data['temp_id']);
        $n->set('field_page_children',$new_chld);
        //$n->set('field_page_html',$data->htmlDoc);
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
  
}
