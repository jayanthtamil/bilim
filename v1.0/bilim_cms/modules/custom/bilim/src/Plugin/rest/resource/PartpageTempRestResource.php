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
 *   id = "parpage_temp_rest_resource",
 *   label = @Translation("Partpage template rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/pp_template/{id}",
 *     "create" = "/api/pp_template/new/{id}"
 *   }
 * )
 */
class PartpageTempRestResource extends ResourceBase {

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
  public function get($nid) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $bcr = new BilimController(); 
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
                $result['templates'][] = array(
                    'nid' => $n->id(),
                    'type' => $n->getType(),
                    'title' => $n->getTitle(),
                    'html' => $n->get('field_pp_html'),
                    'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                    'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
                );
            endforeach;
        endif;
        $result['htmlDoc'] = $pn->field_page_html->getValue();

    elseif($ptype == 'screen'):

        $result['templates'] = array(
          'nid' => $pn->id(),
          'type' => $pn->getType(),
          'title' => $pn->getTitle(),
          'html' => $pn->get('field_scr_html'),
          'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
          'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
        );
        $result['htmlDoc'] = $pn->field_scr_html->getValue();

    elseif($ptype == 'question'):

      $result['templates'] = array(
        'nid' => $pn->id(),
        'type' => $pn->getType(),
        'title' => $pn->getTitle(),
        'html' => $pn->get('field_ques_html'),
        'created' => gmdate('Y-m-d H:i:s',$pn->created->value),
        'changed' => gmdate('Y-m-d H:i:s',$pn->changed->value)
      );
      $result['htmlDoc'] = $pn->field_ques_html->getValue();

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
  public function post($nid,$data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';
    $bcr = new BilimController();
    //$nid = $node->id();
    //$action = \Drupal::request()->get('action');
    $action = 'new';
    if(!empty($data['param'])): 
      $action = 'duplicate';
    endif;
    if(isset($action) && $action == 'duplicate'):

      $n = Node::load($nid);
      // clone a node
      $p_cloned_node = $n->createDuplicate();
      $par_type = $p_cloned_node->getType();
      $p_ctitle = $p_cloned_node->getTitle();
      $p_cloned_node->setTitle($p_ctitle.'-duplicated');
      $p_cloned_node->save();
      $last_pnode_id = $p_cloned_node->id();

      if(!empty($data)):
        $parent = $data['parent'];
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
      $response = 'element duplicated successfully!';

    else:

      if(!empty($data)):
        $count = count($data['partPageTemplate']);
        
        $n = Node::load($nid);
        $pType = $n->getType();

        if($pType == 'page'):

            $new_chld = array();
            for($i=0;$i<$count;$i++):
              $da = array(
                'type' => 'partpage',
                'title' => $data['partPageTemplate'][$i]['title'],
                'field_pp_html' => $data['partPageTemplate'][$i]['html']
              ); 
              $node = Node::create($da);
              $node->save(); 
              $saved_id = $node->id();

              $new_chld[] = array(
                'target_id' => $saved_id
              ); 
            endfor;
            
            $n->set('field_page_children',$new_chld);
            $n->set('field_page_html',$data['htmlTemplate']);
            $n->save(); 
        elseif($pType == 'screen'):
            //$n->set('field_scr_children',$new_chld);
            $n->set('field_scr_html',$data);
            $n->save(); 
        elseif($pType == 'question'):
          //$n->set('field_scr_children',$new_chld);
          $n->set('field_ques_html',$data);
          $n->save(); 
        endif;
        $response = 'element updated successfully!';
      else:
        $response = 'Invalid input parameters';
      endif;

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
  public function patch($nid,$data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';
    $bcr = new BilimController();
    //$nid = $node->id();
    if(!empty($data)):
        
            $count = count($data['partPageTemplate']);
            
            $n = Node::load($nid);
            $pType = $n->getType();

        if($pType == 'page'): 

          $new_chld = array();
          for($i=0;$i<$count;$i++):
            $pp_id = $data['partPageTemplate'][$i]['id'];
            if($pp_id > 0):
              $sn = Node::load($pp_id);
              $sn->setTitle($data['partPageTemplate'][$i]['title']);
              $sn->set('field_pp_html',$data['partPageTemplate'][$i]['html']);
              $sn->save(); 
              $new_chld[] = array(
                'target_id' => $pp_id
              );
            else:
              $da = array(
                'type' => 'partpage',
                'title' => $data['partPageTemplate'][$i]['title'],
                'field_pp_html' => $data['partPageTemplate'][$i]['html']
              ); 
              $node = Node::create($da);
              $node->save(); 
              $saved_id = $node->id();

              $new_chld[] = array(
                'target_id' => $saved_id
              );
              $n->set('field_page_children',$new_chld);
            endif;
          endfor;
          //$bcr->removeMultiChildFromNode($node, $field);
          $n->set('field_page_html',$data['htmlTemplate']); 
          $n->save();  
        elseif($pType == 'screen'):
          $n->set('field_scr_html',$data);
          $n->save();
        elseif($pType == 'question'):
          $n->set('field_ques_html',$data);
          $n->save();
        endif;

        
      $response = 'element updated successfully!';
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
    
    $pfield = 'field_page_children';
    //remove target id from parent
    if(!empty($param)):
      $parent = $param['parent'];
      $pn = Node::load($parent);
      $ptype = $pn->getType();
      //$pfield = $bcr->getNodeRelFieldName($ptype);
      $bcr->removeChildFromNode($pn, $pfield, $nid);
    endif;

    //delete the target element
    $n->delete();
    return new JsonResponse($response);
  }
  
}