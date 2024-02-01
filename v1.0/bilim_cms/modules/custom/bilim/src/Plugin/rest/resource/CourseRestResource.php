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
 *   id = "course_rest_resource",
 *   label = @Translation("Course rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/course_tree/{id}",
 *     "create" = "/api/course_tree/duplicate/{id}"
 *   }
 * )
 */
class CourseRestResource extends ResourceBase {

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

  /***
   * Get Children from the node ids
   * 
   * Retruns a array of children for nodes
   * 
   * course - Strucutre | Starting | Annexes | CourseMedias
   * 
   * 
   */

  public function getNodeChildren($param,$folder_name) {

      $style_path = '';
      if($folder_name != ''):
        $folder_path = 'public://'.$folder_name;
        $style_path = \Drupal::service('file_system')->realpath($folder_path);
      endif;

      $result['style_path'] = $style_path;
      //$nids = explode(',',$param);
      $nodes = Node::loadMultiple($param);
      $nres = array();
      foreach ($nodes as $n) {
        $type = $n->getType();
        $chld = '';
        $chld_elem = [];

        if($type == 'starting'):
          $chld = $n->get('field_str_children')->getValue();
        elseif($type == 'structure'):
          $chld = $n->get('field_struct_children')->getValue();
        elseif($type == 'annexes'):
          $chld = $n->get('field_anx_children')->getValue();
        endif;
        $bcr = new BilimController();

        if(!empty($chld)):
          $chld_str = $bcr->getTargetIds($chld);
          $chld_elem = $bcr->getCourseChildrenByChildren($chld_str);
        endif;

        $result[$type][] = array(
                    'id' => $n->id(),
                    'type' => $n->getType(),
                    'name' => $n->title->value,
                    'children' => $chld_elem
                  );
      }
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
  public function get($nid) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $bcr = new BilimController();
    $query = \Drupal::entityQuery('node')
              ->condition('type', 'style')
              ->condition('field_s_courses', $nid);
    $nids = $query->execute();
    $folder_name = '';
    if(!empty($nids)):
      foreach($nids as $sid):
          $sn = Node::load($sid);
          $stitle = $sn->getTitle();
          $folder_name = str_replace(' ', '-', $stitle);
      endforeach;
    endif;
    
    //get Course Children
    $crs_children_str = $bcr->getElemChildren($nid,'field_crs_children');
    $result = $this->getNodeChildren($crs_children_str,$folder_name);
    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }

  /**
   * Responds to POST requests.
   *
   * @param string $payload
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($nid,$param) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    $bcr = new BilimController();
    $n = Node::load($nid);

    // clone a node
    $p_cloned_node = $n->createDuplicate();
    $par_type = $p_cloned_node->getType();
    $p_ctitle = $p_cloned_node->getTitle();
    $p_cloned_node->setTitle($p_ctitle.'-duplicated');

    if($par_type == 'screen'):
      $pconn = $p_cloned_node->get('field_scr_connection')->getValue();
      // remove home key
      if(!empty($pconn)):
        foreach($pconn as $pc):
          if($pc['value'] != 'home'):
            $pa[] = $pc['value'];
          endif;
        endforeach;
        $p_cloned_node->set('field_scr_connection',$pa);
      endif;

    elseif($par_type == 'page'):
      $pconn = $p_cloned_node->get('field_page_connection')->getValue();
      // remove home key
      if(!empty($pconn)):
        foreach($pconn as $pc):
          if($pc['value'] != 'home'):
            $pa[] = $pc['value'];
          endif;
        endforeach;
        $p_cloned_node->set('field_page_connection',$pa);
      endif;

    endif;

    $p_cloned_node->save();
    $last_pnode_id = $p_cloned_node->id();
    $bcr->cloneElemChildren($last_pnode_id);
    if(!empty($param)):
      $parent = $param['parent'];
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
      $pn->save();
    endif;  
    return new ResourceResponse('Node Duplicated!');
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
      $cncs = array();
      $n = Node::load($id);     
      if(!empty($data['connections'])):
          foreach($data['connections'] as $cn):
              $cncs[] = array(
                  "target_id" => $cn
              );
          endforeach;
      endif;
      $n->set('field_scr_connection',$cncs);
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

  /**
   * Responds to DELETE requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function delete($nid,$param) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $bcr = new BilimController();
    $response = 'Nodes Deleted';
    
    //retrieve target element
    $n = Node::load($nid);
    $type = $n->getType();
    if($type != 'simple_content'):

      //remove target id from parent
      if(!empty($param)):
        $parent = $param['parent'];
        $pn = Node::load($parent);
        $ptype = $pn->getType();
        $pfield = $bcr->getNodeRelFieldName($ptype);
        $bcr->removeChildFromNode($pn, $pfield, $nid);
      endif;

      //delete the children elements
      $field = $bcr->getNodeRelFieldName($type);
      $crs_children = $bcr->getElemDeleteChildren($nid,$field);
      
    endif;

    //delete the target element
    $n->delete();
    return new JsonResponse($response);
  }
  
}
