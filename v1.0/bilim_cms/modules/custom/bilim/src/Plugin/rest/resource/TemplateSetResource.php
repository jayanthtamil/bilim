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
 *   id = "template_set_rest_resource",
 *   label = @Translation("Template set rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/templateset/{id}",
 *     "create" = "/api/templateset/{type}/{id}"
 *   }
 * )
 */
class TemplateSetRestResource extends ResourceBase {

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
    
    $pn = Node::load($nid);
    $ptype = $pn->getType();
    if($ptype == 'page'):
        $chld = $n->get('field_page_children')->value;
    elseif($ptype == 'screen'):
        $chld = $n->get('field_scr_children')->value;
    endif; 
    $chlds = $this->getTargetIds($chld);

    $result = array();
    $nodes = Node::loadMultiple($chlds);
    if(!empty($nodes)):
        foreach($nodes as $n):
            $type = $n->getType();
            $html = '';
            if($type == 'partpage'):
                $html = $n->get('field_pp_html');
            endif;
            $result[] = array(
                'nid' => $n->id(),
                'type' => $n->getType(),
                'title' => $n->getTitle(),
                'html' => $html,
                'created' => gmdate('Y-m-d H:i:s',$n->created->value),
                'changed' => gmdate('Y-m-d H:i:s',$n->changed->value)
            );
        endforeach;
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
  public function post($type,$nid,$data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';

    //$nid = $node->id();
    if(!empty($data)):
        $n = Node::load($nid);
        $pType = $n->getType();
        
        if($type == 'partpage'):
            $da = array(
                'type' => 'partpage',
                'title' => $data['title'],
                'field_pp_html' => $data['html']
            ); 
        elseif($type == 'basichtml'):
            if($pType == 'page'):
                $da = array(
                    'type' => $pType,
                    'title' => $data['title'],
                    'field_page_html' => $data['html']
                ); 
            elseif($pType == 'screen'):
                $da = array(
                    'type' => $pType,
                    'title' => $data['title'],
                    'field_scr_html' => $data['html']
                ); 
            endif;
        endif;

        
        $node = Node::create($da);
        $node->save(); 

        if($type == 'partpage'):
            $id = $node->id();
            $new_chld = array(
                'target_id' => $id
            );

            if($pType == 'page'):
                $n->set('field_page_children',$new_chld);
            elseif($pType == 'screen'):
                $n->set('field_scr_children',$new_chld);
            endif;
            $n->save();
        endif;
        $response = 'element updated successfully!';
    else:
      $response = 'Invalid input parameters';
    endif;
    return new ResourceResponse($response);
  }
  
}
