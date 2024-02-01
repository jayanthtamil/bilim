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
use Psy\Exception\Exception;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "domainlist_rest_resource",
 *   label = @Translation("Domain List rest resource"),
 *   uri_paths = {
 *     "canonical" = "/api/domain_list"
 *   }
 * )
 */

 class DomainListRestResource extends ResourceBase {

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
      //$result['domains'] = $bcr->getDomains();

      $domains = $bcr->getDomains();
  	  
      $domain_list = array_column($domains, 'name','id');
      //$domain_names = array_values($domain_list);
      
      //$remove_domains = array("Modeles","Tests");
      //$new_list = array_diff($domain_names,$remove_domains);

      //$result['domain'] = array_column($domains, 'name','id');
      
      /*if (in_array("Modeles", array_values($domain_list)))
      {
        $new_domain_list = array_diff($domain_list, ["Modeles","Tests"]); 
      }
    else
      {
        $new_domain_list = $domain_list;
      }*/
      //print_r($new_domain_list);

      //print_r(array_values($domains));
      //print_r($result); 
      //die();
      $result_arr = array();

      foreach($domain_list as $domain_key => $value){
        $result_arr[] = array(
          'id' => $domain_key,
          'name' => $value
        ); 
      }  
      $result['domain'] = $result_arr;

      //$result['domain_tree'] = $bcr->getAllDomainsTree();
      /* $nid = 12169;
      $n = Node::load($nid);
      $domain_children = $n->get('field_domain_children')->getString();
      $domain_children_arr = explode(",",$domain_children);
      
      $dcr = Node::load($domain_children_arr[0]);
      $dcr_children = $dcr->get('field_dcr_children')->getString();
      print_r($dcr_children); die(); */
  
      $response = new ResourceResponse((array)$result);
      $response->addCacheableDependency($result);
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
    /* public function patch() {
  
      // You must to implement the logic of your REST Resource here.
      // Use current user after pass authentication to validate access.
      if (!$this->currentUser->hasPermission('access content')) {
        throw new AccessDeniedHttpException();
      }
      $response = '';
  
      
      return new ResourceResponse($response);
    } */
    
  }
