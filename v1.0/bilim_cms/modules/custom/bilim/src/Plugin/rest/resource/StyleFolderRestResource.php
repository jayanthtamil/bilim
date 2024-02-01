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
 *   id = "style_folder_rest_resource",
 *   label = @Translation("Style Folder rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/style_folder/{id}"
 *   }
 * )
 */
class StyleFolderRestResource extends ResourceBase {

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
 * Return an array of files found within a specified directory.
 * @param  string $dir   A valid directory. If a path, with a file at the end,
 *                       is passed, then the file is trimmed from the directory.
 * @param  string $regex Optional. If passed, all file names will be checked
 *                       against the expression, and only those that match will
 *                       be returned.
 *                       A RegEx can be just a string, where a '/' will be
 *                       prefixed and a '/i' will be suffixed. Alternatively,
 *                       a string could be a valid RegEx string.
 * @return array         An array of all files from that directory. If regex is
 *                       set, then this will be an array of any matching files.
 */
function get_files_in_dir(string $dir, $regex = null)
{
    $dir = is_dir($dir) ? $dir : dirname($dir);
    // A RegEx to check whether a RegEx is a valid RegEx :D
    $pass = preg_match("/^([^\\\\a-z ]).+([^\\\\a-z ])[a-z]*$/i", $regex, $matches);

    // Any non-regex string will be caught here.
    if (isset($regex) && !$pass) {
        //$regex = '/'.addslashes($regex).'/i';
        $regex = "/$regex/i";
    }

    // A valid regex delimiter with different delimiters will be caught here.
    if (!empty($matches) && $matches[1] !== $matches[2]) {
        $regex .= $matches[1] . 'i'; // Append first delimiter and i flag
    }

    try {
        $files = scandir($dir);
    } catch (Exception $ex) {
        $files = ['.', '..'];
    }
    $files = array_slice($files, 2); // Remove '.' and '..'
    $files = array_reduce($files, function($carry, $item) use ($regex) {
        if ((!empty($regex) && preg_match($regex, $item)) || empty($regex)) {
            array_push($carry, $item);
        }

        return $carry;
    }, []);

    return $files;
}

function str_finish($value, $cap)
{
    $quoted = preg_quote($cap, '/');

    return preg_replace('/(?:'.$quoted.')+$/u', '', $value).$cap;
}

function get_directory_tree($dir)
{
    $fs = $this->get_files_in_dir($dir);
    $files = array();
    foreach ($fs as $k => $f) {
        $s_path = $this->str_finish($dir, '/');
        if (is_dir($s_path.$f)) {
            $fs[] = array(
                'name' => $f,
                'isFolder' => true,
                'content' => null,
                'path' => $s_path.$f,
                'children' => $this->get_directory_tree($this->str_finish($dir, '/').$f)
            );
        } else {
            $f_dir = str_replace('/var/www/html/bilim/v1.0/bilim_cms/sites/default/files/','',$dir);
            $folder_path = 'public://'.$f_dir.'/'.$f;
            $files[] = array(
                'name' => $f,
                'isFolder' => false,
                'content' => null,
                'path' => file_create_url($folder_path),
                'children' => []
            );
        }
        unset($fs[$k]);

    }

    $fs = array_merge($fs, $files);

    return $fs;
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
          $sid = $sn->id();
          $stitle = $sn->getTitle();
          //$folder_name = str_replace(' ', '-', $stitle);
      endforeach; 
      $folder_path = 'public://base-style-01';
      $style_path = \Drupal::service('file_system')->realpath($folder_path);

      $result['id'] = $sid;
      $result['name'] = $stitle;
      $result['styles'] = $this->get_directory_tree($style_path);
    else:
      $result = 'No styles found for this course.';
    endif;

    /* $style_path = '';
    if($folder_name != ''):
        $folder_path = 'public://'.$folder_name;
        $style_path = \Drupal::service('file_system')->realpath($folder_path);
    endif; */

    //$result['style_path'] = $style_path;
    

    $response = new ResourceResponse((array)$result);
    $response->addCacheableDependency($result);
    return $response; 
  }
  
}
