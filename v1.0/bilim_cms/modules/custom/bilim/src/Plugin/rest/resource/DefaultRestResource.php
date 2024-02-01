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
 *   id = "default_rest_resource",
 *   label = @Translation("Default rest resource"),
 *   uri_paths = {
 *     "create" = "/api/create/elem",
 *     "canonical" = "/api/elem/rename/{id}"
 *   }
 * )
 */
class DefaultRestResource extends ResourceBase {

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
  public function post($data) {

      // You must to implement the logic of your REST Resource here.
      // Use current user after pass authentication to validate access.
      $bcr = new BilimController();
      $response = '';
      $type = $data['type'];
      $title = $data['title'];
      if($type == 'chapter'):
          $da = array(
            'type' => $type,
            'title' => $title,
            'field_chap_isevaluation' => $data['isevaluation'],
            'field_chap_hasfeedback' => $data['hasfeedback'],
            'field_chap_eval_param' => $data['eval_param']
          ); 
      else:
        $da = array(
          'type' => $type,
          'title' => $title,
        ); 
      endif;

      $node = Node::create($da);
      $res = $node->save(); 
      if($res > 0):
        $nid = $node->id();
        if($type == 'chapter'):
          $cnid = Node::load($nid);
          $c_filed_name = $bcr->getNodeRelFieldName($type);
          $nfield = $cnid->get('field_chap_children')->getValue();
        endif;

        $pnode = Node::load($data['parent']);
        
        $ptype = $pnode->getType();
        $pfield = $bcr->getNodeRelFieldName($ptype);
        
        $ex_chld = $pnode->get($pfield)->getValue();

        if($type == 'chapter'):
          if($data['hasfeedback'] == 'true' && (strtolower($data['isevaluation']) == 'true' || $data['isevaluation'] == 'placementTest')):
            $chlds = $bcr->getElemChildren($nid,$c_filed_name);
            $ftitle = 'feedback';
            $ftype = 'feedback';
            $bcr->addChildElem($nid,$chlds,$ftype,$ftitle,$c_filed_name);
          endif;
        endif;
        

        if(!empty($ex_chld)):
          $new_chld = $bcr->arrayMnp($ex_chld,$nid);
        else:
          $new_chld = array(
            "target_id" => $nid
          );
        endif;
        $pnode->set($pfield, $new_chld);
        $pnode->save();

        //chapter has parent to sort feedback.
        if($ptype == 'chapter'):
          if(!empty($ex_chld)):
            $ftype = 'feedback';
            $chlds = $bcr->getElemChildren($data['parent'],$pfield);
            $fid = $bcr->getChildrenByType($chlds,$ftype);
            if($fid != ''):
              if (($key = array_search($fid, $chlds)) !== false) {
                $pnode->get($pfield)->removeItem($key);
                $pnode->save();
                $rm_chlds = $pnode->get($pfield)->getValue();
                $rm_res = $bcr->getTargetIds($rm_chlds);
              }
              $position = sizeof($rm_res);
              $new_chld = $bcr->array_insert($rm_res, $position, $fid);
              $pnode->set($pfield, $new_chld);
              $pnode->save();
            endif;
          endif;
        endif;

        $response = 'Children created successfully! ';
      else:
        $response = 'Unable to create a children!';
      endif;
      
      return new ResourceResponse($response);
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
  public function patch($params,$data) {
    $node = Node::load($params);
    $node->set('title',$data['title']);
    $res = $node->save(); 
    $response = 'node not renamed yet!';
    if($res):
      $response = 'node renamed!';
    endif;
    return new ResourceResponse($response);
  }

}
