<?php
/**
 * @file
 * Contains \Drupal\bilimauth\Controller\UserTemplate.
 */
 
namespace Drupal\bilimauth\Controller;
 
use Drupal\Core\Controller\ControllerBase;
use Drupal\user;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityInterface;
use Drupal\bilim\Controller\BilimController;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\node\Entity\Node;
//use Symfony\Component\HttpFoundation\Request;
//use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
//use Symfony\Component\HttpFoundation\RequestStack;

class UserTemplate extends ControllerBase {

  protected $user;

  public function __construct() {
    $this->user = \Drupal::currentUser();
    //$currentAccount->id();
  }

  public function preHome() {
	global $base_url;  
    $content = [];
    // user block
    if($this->user->isAuthenticated()){
        $response = new RedirectResponse($base_url.'/platform/homepage');
        $response->send();
        return;
    }
    else{
        $block_manager = \Drupal::service('plugin.manager.block');
        $block_config = [];
        $block_plugin = $block_manager->createInstance('UserPrehomeBlock', $block_config);
        $block_build = $block_plugin->build();
        $block_content = render($block_build);
    
        $content['block'] = $block_content;
    
        return [
          '#theme' => 'page_prehome',
    	  '#base_url' => $base_url,
          '#content' => $content,
        ];
    }
  }

  public function customerHome() {
    \Drupal::service('page_cache_kill_switch')->trigger(); 
	  global $base_url;
    $content = [];
    
    // domain list block
    $bcr = new BilimController();
    $content['domain'] = $bcr->getDomains();

    //special domains
    $name = array_column($content['domain'],'name'); 
    $modeles_key = array_search('Modeles',$name);
    $tests_key = array_search('Tests',$name);
    $content['spl_domains'] = [$content['domain'][$modeles_key], $content['domain'][$tests_key]];

    //latest 4 courses
    $content['courses'] = $bcr->getLatestCourses();

    //random 4 courses
    $content['random'] = $bcr->getFavCourses();
    
    $content['username'] = $this->user->getAccountName();
    $content['roles'] = $this->user->getRoles();
    $latestCrsProps = $content['courses']['crs_props'] ? $content['courses']['crs_props'] : [];
    $favCrsProps = $content['random']['crs_props'] ? $content['random']['crs_props'] : [];
    $content['course_properties'] = array_unique(array_merge($latestCrsProps,$favCrsProps),SORT_REGULAR);
    
    return [
      '#theme' => 'page_customerhome',
      '#base_url' => $base_url,
	  '#content' => $content,
    ];
  }

  public function domainView(NodeInterface $domain = NULL, $root = 0, $cf = 0) {
    \Drupal::service('page_cache_kill_switch')->trigger(); 
    global $base_url;
		$content = [];
		if(\Drupal::currentUser()->isAuthenticated()){
        $domain_node = \Drupal::routeMatch()->getParameter('domain');
        $domainId = $domain_node->id();
        $bcr = new BilimController();
        $content['ids'] = array(
          'domain' => $domainId,
          'root' => $root,
          'cf' => $cf
        );
        
        $content['username'] = $this->user->getAccountName();
        $content['domain'] = $bcr->getCFbyDomain($domainId,$root,$cf);  
        $content['courses'] = $bcr->getContentbyDomain($domainId,$root,$cf);
        $content['domaininfo'] = $bcr->getDomainViewInfo($domainId,$root,$cf);
        $content['styles'] = $bcr->getStyleFromDomain($domainId);
        $content['all_styles'] = $bcr->getStyles();
        $content['roles'] = $this->user->getRoles();
	      $content['course_properties'] = $bcr->getCoursePropertiesbyDomain($domainId,$root,$cf);
	      $content['domain_tree'] = $bcr->getAllDomainsTree();
	      

	    if($cf){
              $content['parent_id'] = $cf;
            }
	    else{
	      $content['parent_id'] = $content['domain'][0]['id'];
            }

        /*$styles  = $bcr->getStyleFromDomain($domainId);
        $output = array();
        $result = array();
        foreach ($styles as $style) {
        	if(isset($style['folderName']) && $style['folderName'] == '') {
        		$result[] = $style;
        	}
        	else{
        		if(isset($style['children']) && sizeof($style['children']) == 0) {
        			unset($style);
        		}
        		else {
        			if($style['folderName'] == '') {
        				foreach ($style as $child) {
        					if(isset($style['folderName']) && $style['folderName'] == '') {
        						$output[] = $child;
        					}
        					else{
        						if(isset($style['children']) && sizeof($style['children']) == 0) {
        							unset($child);
        						}
        						else {
        							$output[] = $child;
        						}
        					}
        				}
        			}else {
        				$output[] = $style;
        			}
        		}
        	}
        }
        $content['styles'] = array_merge($result,$output);*/

      	$results = array();
        if($cf) {
        	$n = Node::load($cf);
        	$ty = $n->getType();
        	$ids = $bcr->getDomainFromCourse($cf, $ty);
        	$results = $bcr->getBreadcrumbInfo($ids['cf_ids'],'domainview');
        	
	        $content['breadcrumb'] = $results;
        }
        else if($root){
        	$ids = $bcr->getDomainFromCourse($root, 'domain_content_root');
        	$results = $bcr->getBreadcrumbInfo($ids['cf_ids'],'domainview');
        	
        	$content['breadcrumb'] = $results;
        }
        else {
        	$ids = $bcr->getDomainFromCourse($domainId, 'domain');
        	$results = $bcr->getBreadcrumbInfo($ids['cf_ids'],'domainview');
        	
        	$content['breadcrumb'] = $results;
        }
        
        $locale_code = $bcr->getLanguageCode();
        $other_countries = [];
        foreach($locale_code as $x => $locale){
        	if($x != 'en' && $x != 'fr' && $x != 'de' && $x != 'it' && $x != 'es' && $x != 'pt' && $x != 'nl' && $x != 'fi' && $x != 'sv' && $x != 'nn' && $x != 'uk' && $x != 'pl' && $x != 'ru'){
        		$content['other_countries'][$x] = $locale_code[$x];

        	}
        }
        
        /*$temp_nids = \Drupal::entityQuery('node')
          ->condition('type','template') 
          ->execute();
        $t_ids = array_values($temp_nids);
        
        $temps = Node::loadMultiple($t_ids);
        
        foreach($temps as $t){
          $t->set('field_t_framework_min', '0.8.0');
          $t->save();
        }*/ 
   
        return [
          '#theme' => 'page_domainview',
    	  	'#base_url' => $base_url,
          '#content' => $content,
        ];
		}
		else{
	    $response = new RedirectResponse($base_url.'/platform/login');
	    $response->send();
	    return;
		}
  }
  
 
  public function styleView(NodeInterface $domain = NULL, $root = 0, $sf = 0) {
    \Drupal::service('page_cache_kill_switch')->trigger(); 
    global $base_url;
    $style = [];
    if(\Drupal::currentUser()->isAuthenticated()){
        $domain_node = \Drupal::routeMatch()->getParameter('domain');
        $domainId = $domain_node->id();
        $bcr = new BilimController();
        
        $style['ids'] = array('domain' => $domainId,
        		'root' => $root, 
        		'sf' => $sf);
        $style['username'] = $this->user->getAccountName();
        $style['domain'] = $bcr->getSFbyDomain($domainId,$root,$sf);  
        $style['styles'] = $bcr->getStylebyDomain($domainId,$root,$sf);
        $style['domaininfo'] = $bcr->getDomainViewInfo($domainId,$root,$sf);
        $style['style_properties'] = $bcr->getStylePropertiesbyDomain($domainId,$root,$sf);
        
        $results = array();
        if($sf) {
        	$ids = $bcr->getDomainFromStyle($sf);
        	$results = $bcr->getBreadcrumbInfo($ids['cf_ids'],'styleview');
        	
        	$style['breadcrumb'] = $results;
        }
        else if($root){
        	$ids = $bcr->getDomainFromStyle($root);
        	$results = $bcr->getBreadcrumbInfo($ids['cf_ids'],'styleview');
        	
        	$style['breadcrumb'] = $results;
        }
        else {
        	$ids = $bcr->getDomainFromStyle($domainId);
        	$results = $bcr->getBreadcrumbInfo($ids['cf_ids'],'styleview');
        	
        	$style['breadcrumb'] = $results;
        }
        return [
          '#theme' => 'page_styleview',
    	  '#base_url' => $base_url,
          '#style' => $style,
        ];
    }
    else{
        $response = new RedirectResponse($base_url.'/platform/login');
        $response->send();
        return;
    }
  }
  
  /**
   * Display style root page
   * @return array
   */
  public function styleHome() {
      \Drupal::service('page_cache_kill_switch')->trigger();
      global $base_url;
      $content = [];
      
      // domain list block
      $bcr = new BilimController();
      $content['domain'] = $bcr->getDomains();

      //special domains
      $name = array_column($content['domain'],'name'); 
      $modeles_key = array_search('Modeles',$name);
      $tests_key = array_search('Tests',$name);
      $content['spl_domains'] = [$content['domain'][$modeles_key], $content['domain'][$tests_key]];
      
      $content['username'] = $this->user->getAccountName();
      
      return [
          '#theme' => 'page_stylehome',
          '#base_url' => $base_url,
          '#content' => $content,
      ];
  }
  
  /**
   * Display list of users
   * @return array
   */
  public function userHome() {
      \Drupal::service('page_cache_kill_switch')->trigger();
      global $base_url;
      $content = [];
      
      // domain list block
      $bcr = new BilimController();
      $content['users'] = $bcr->getUsers();
      
      $content['username'] = $this->user->getAccountName();
      
      $content['roles'] = \Drupal::entityTypeManager()->getStorage('user_role')->loadMultiple();
      
      $content['domain'] = $bcr->getDomains();
      return [
          '#theme' => 'page_userhome',
          '#base_url' => $base_url,
          '#content' => $content,
      ];
  }
  
  /**
   * Display list of domains
   * @return array
   */
  public function domainList() {
  	\Drupal::service('page_cache_kill_switch')->trigger();
  	global $base_url;
  	$content = [];
  	
  	// domain list block
  	$bcr = new BilimController();
  	$content['users'] = $bcr->getUsers();
  	
  	$content['username'] = $this->user->getAccountName();
  	
  	$content['roles'] = \Drupal::entityTypeManager()->getStorage('user_role')->loadMultiple();
  	
  	$domains = $bcr->getDomains();
  	$content['domain'] = array_column($domains, 'name','id');
	
  	return [
  			'#theme' => 'page_domainlist',
  			'#base_url' => $base_url,
  			'#content' => $content,
  	];
  }

}
