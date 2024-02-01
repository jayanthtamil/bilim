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
 *   id = "drag_rest_resource",
 *   label = @Translation("Drag rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/change/elem/{id}"
 *   }
 * )
 */
class DragRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;


  /**
  * Constructs a new DefaultRestResource object.
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

        // You must to implement the logic of your REST Resource here.
        // Use current user after pass authentication to validate access.
        $bcr = new BilimController();

        $nid = \Drupal::request()->get('id');
        $datas = \Drupal::request()->getContent();
        $uid = $this->currentUser->id();

        $data = array();
        if(!empty($datas)):
          $data = json_decode($datas);
        endif;

        if(!empty($data)):
          //body values
          $cur_parent = $data->cparent;
          $new_parent = $data->nparent;
          $new_pos = $data->npos;
          $tid = $data->cid;
          $action_type = $data->actiontype;
        endif;

        $response = 'Unable to update Node Branch';
        $tnode = Node::load($tid);
        $ttype = $tnode->getType();
        if($ttype == 'feedback'):
          $response = 'Feedback is not actionable node';
        else:
          $cpnode = Node::load($cur_parent);
          $ptype = $cpnode->getType();
          $pfield = $bcr->getNodeRelFieldName($ptype);
          if($cur_parent == $new_parent):
            $chd_array = $cpnode->get($pfield)->getValue();
         	$unique_chd_array = array_map("unserialize", array_unique(array_map("serialize", $chd_array)));
			$chdArray = array_filter($unique_chd_array, function($v){ return array_filter($v) != array(); });
            $new_swapped_children = $bcr->swapElem($chdArray,$new_pos,$tid);
            $cpnode->set($pfield,$new_swapped_children);
            $cpnode->setRevisionUserId($uid);
            $cpnode->save();
            $response = 'Node Branch Updated';
          else:
            //current branch params
            if(!isset($action_type) && $action_type != "CopyFrom") {
              $bcr->removeChildFromNode($cpnode,$pfield,$tid);
            }
            

            //new branch params
            $nparent = $new_parent;
            if(!empty($nparent)):
              $nnode = Node::load($nparent);
              $ntype = $nnode->getType();
              $nfield = $bcr->getNodeRelFieldName($ntype);
              $ex_chld = $nnode->get($nfield)->getValue();
              $new_chld = array(
                  "target_id" => $tid
              );
              if(!empty($ex_chld)):
                  $new_chld = $bcr->array_insert($ex_chld,$new_pos,$new_chld);
                  //print_r($new_chld);
                  //$new_chld = $bcr->arrayMnp($ex_chld,$tid);
              endif;
              $nnode->set($nfield, $new_chld);
              $nnode->setRevisionUserId($uid);
              $nnode->save();
              $response = 'Node Branch Updated';
            endif;
          endif;
        endif;
        return new ResourceResponse($response);
    }
}
