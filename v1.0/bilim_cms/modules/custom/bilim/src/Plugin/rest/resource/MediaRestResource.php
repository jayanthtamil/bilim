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
 *   id = "media_rest_resource",
 *   label = @Translation("Media rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/media/{id}",
 *     "create" = "/api/media/new/{id}"
 *   }
 * )
 */
class MediaRestResource extends ResourceBase {

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
  public function post($data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $response = '';
    //$nid = $node->id();
    /* if($_FILES['file']):
        $response .= 'Filename: ';
        $response .= $_FILES["file"]["name"];
        $avatar_tmp_name = $_FILES["file"]["tmp_name"];
        $error = $_FILES["file"]["error"];
    endif; */

    if (isset($_FILES['file']['name'])) {
		if (0 < $_FILES['file']['error']) {
			$response = '<span style="color:red;">Error during file upload ' . $_FILES['file']['error'] . '</span>';
		} else {
            $response = 'filename'.$_FILES['file']['name'];
			/* if (file_exists('uploads/' . $_FILES['file']['name'])) {
				echo '<span style="color:red;">File already exists at uploads/' . $_FILES['file']['name'] . '</span>';
			} else {
				move_uploaded_file($_FILES['file']['tmp_name'], 'uploads/' . $_FILES['file']['name']);
				echo '<span style="color:green;">File successfully uploaded to uploads/' . $_FILES['file']['name'] . '</span>';
			} */
		}
	} else {
		$response = '<span style="color:red;">Please choose a file</span>';
	}

    /***
     * if($_FILES['avatar'])
    {
        $avatar_name = $_FILES["avatar"]["name"];
        $avatar_tmp_name = $_FILES["avatar"]["tmp_name"];
        $error = $_FILES["avatar"]["error"];

        if($error > 0){
            $response = array(
                "status" => "error",
                "error" => true,
                "message" => "Error uploading the file!"
            );
        }else 
        {
            $random_name = rand(1000,1000000)."-".$avatar_name;
            $upload_name = $upload_dir.strtolower($random_name);
            $upload_name = preg_replace('/\s+/', '-', $upload_name);
        
            if(move_uploaded_file($avatar_tmp_name , $upload_name)) {
                $response = array(
                    "status" => "success",
                    "error" => false,
                    "message" => "File uploaded successfully",
                    "url" => $server_url."/".$upload_name
                );
            }else
            {
                $response = array(
                    "status" => "error",
                    "error" => true,
                    "message" => "Error uploading the file!"
                );
            }
        }



        

    }else{
        $response = array(
            "status" => "error",
            "error" => true,
            "message" => "No file was sent!"
        );
    }
     */
    return new ResourceResponse($response);
  }
  
}
