<?php

namespace Drupal\bilim\Plugin\rest\resource;

use Drupal\rest\ModifiedResourceResponse;
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
 *   id = "elem_rest_resource",
 *   label = @Translation("Elem rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/elem/{id}"
 *   }
 * )
 */
class ElemRestResource extends ResourceBase {

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
  public function get($id) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $val = array();
    $n = Node::load($id);
    $rc = array();
    if(!empty($n)):
      $type = $n->getType();
      if($type == 'screen'):
        $chld = $n->get('field_scr_connection')->getValue();
        if(!empty($chld)):
          foreach($chld as $c):
            $rc[] = $c['value'];
          endforeach;
        endif;
        $val = array(
          'id' => $n->id(),
          'title' => $n->get('title')->getValue(),
          'connections' => $rc
        );
      elseif($type == 'page'):
        $chld = $n->get('field_page_connection')->getValue();
        if(!empty($chld)):
          foreach($chld as $c):
            $rc[] = $c['value'];
          endforeach;
        endif;
        $val = array(
          'id' => $n->id(),
          'title' => $n->get('title')->getValue(),
          'connections' => $rc
        );
      endif;
    endif;

    $response = new ResourceResponse((array)$val);
    $response->addCacheableDependency($val);
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
  public function patch($params,$data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';
    if(!empty($data)):
      $id = $data['id'];
      $parent = $data['parent'];
      if($parent != ''):
        $pnode = Node::load($parent);  
        $ptype = $pnode->getType();
        if($ptype == 'starting'):
          //remove home from every children
          $children = $pnode->get('field_str_children')->getValue();
          if(in_array("home",$data['connections'])):
            if(!empty($children)):
              foreach($children as $k=>$ch):
                if(is_numeric($ch['target_id'])):
                  $n = Node::load($ch['target_id']);   
                  $ch_node = node_load($ch['target_id'], NULL, TRUE);
                  if(!empty($ch_node)):
                    $type = $n->getType();
                    if($type == 'screen'):
                      $pfield = 'field_scr_connection';
                    elseif($type == 'page'):
                      $pfield = 'field_page_connection';
                    endif;
                    $pconx_data = $n->get($pfield)->getValue();  
                    $pconx_sec = array_column($pconx_data,'value');
                    if(in_array('home',$pconx_sec)):
                      $akey = array_search('home',$pconx_sec);
                      unset($pconx_sec[$akey]);
                      $n->set($pfield,$pconx_sec);
                      $n->save();
                    endif;
                  else:
                    //$pnode = Node::load($parent);
                    //unset($pnode->field_str_children[$k]);
                    //$pnode->save(); 
                  endif;
                endif;
              endforeach;
            endif;
          endif;
        endif;
      endif;

      // update the children
      $cncs = array();
      $n = Node::load($id);   
      $type = $n->getType();
      if($type == 'screen'):
        $pfield = 'field_scr_connection';
      elseif($type == 'page'):
        $pfield = 'field_page_connection';
      endif;
      $pconx_data = $n->get($pfield)->getValue();  
      if(!empty($data['connections'])):
          foreach($data['connections'] as $cn):
              $cncs[] = array(
                  "value" => $cn
              );
          endforeach;
      endif; 
      $type = $n->getType();
      $n->set($pfield,$cncs);
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

}
