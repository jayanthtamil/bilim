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
use Drupal\file\Entity\File;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "reset_template_rest_resource",
 *   label = @Translation("Reset template rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/reset_template/{id}",
 *     "create" = "/api/reset_template/new/{id}"
 *   }
 * )
 */
class ResetTemplateRestResource extends ResourceBase {

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
    $bcr = new BilimController(); 
    $nid = \Drupal::request()->get('id');
    $uid = $this->currentUser->id();
    $datas = \Drupal::request()->getContent();


    $data = array();
    if(!empty($datas)){
      $data = json_decode($datas);
    }

    $media_ids = $data->medias;
    //$newHtml = $data->html;
    $pn = Node::load($nid);

    
    $file_system = \Drupal::service('file_system');

    $ptype = $pn->getType();

    if($ptype == 'screen'){
	//$pn->set('field_scr_html', $newHtml);
        $pn->set('field_scr_html', '');
        $pn->set('field_scr_template_type', '');
        $tmp_count = count($pn->get('field_scr_template')->getValue());
        for($i = 0; $i < $tmp_count; $i++){
	  $pn->field_scr_template[$i] = ['target_id' => ''];
        }
    }
    elseif($ptype == 'question'){
	$pn->set('field_ques_html', '');
	$pn->set('field_ques_template_type', '');
        $tmp_count = count($pn->get('field_ques_template')->getValue());
        for($i = 0; $i < $tmp_count; $i++){
	  $pn->field_ques_template[$i] = ['target_id' => ''];
        }
    }
    elseif($ptype == 'simple_content'){
	$pn->set('field_sc_html', '');
	$pn->set('field_sc_template_type', '');
        $tmp_count = count($pn->get('field_sc_template')->getValue());
        for($i = 0; $i < $tmp_count; $i++){
	  $pn->field_sc_template[$i] = ['target_id' => ''];
        }
    }
    $pn->setRevisionUserId($uid);
    $pn->save();

    foreach($media_ids as $media_id){
	$media = Node::load($media_id);
	if($media){
	  $media->delete();
	}
    }

    $response = 'Element resetted successfully';

    $response = new ResourceResponse($response);

    return $response; 
  }

  
}
