<?php
/**
 * @file
 * Contains \Drupal\bilimauth\Controller\UserTemplate.
 */
 
namespace Drupal\bilimauth\Controller;
 
use Drupal\Core\Controller\ControllerBase;
use Drupal\user;
use Drupal\bilimauth\UserAccountForm;
use Drupal\bilimauth\Plugin\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityInterface;
use Drupal\bilim\Controller\BilimController;
use Drupal\node\NodeInterface;
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
    $content = [];
    // user block
    $block_manager = \Drupal::service('plugin.manager.block');
    $block_config = [];
    $block_plugin = $block_manager->createInstance('UserPrehomeBlock', $block_config);
    $block_build = $block_plugin->build();
    $block_content = render($block_build);

    $content['block'] = $block_content;

    return [
      '#theme' => 'page_prehome',
      '#content' => $content,
    ];
  }

  public function customerHome() {
    $content = [];

    //drupal_flush_all_caches();
    \Drupal::service('cache.render')->invalidateAll();
    //$view = \Drupal\views\Views::getView('');
    //$view->storage->invalidateCaches();
    //\Drupal::cache('render');
    views_invalidate_cache();
    $this->invalidateCaches();

    // domain list block
    $bcr = new BilimController();
    $content['domain'] = $bcr->getDomains();
    
    //latest 4 courses
    $content['courses'] = $bcr->getLatestCourses();

    //random 4 courses
    $content['random'] = $bcr->getFavCourses();
    
    $content['username'] = $this->user->getUsername();

    return [
      '#theme' => 'page_customerhome',
      '#content' => $content,
    ];
  }

  public function domainView(NodeInterface $domain = NULL, $root = 0, $cf = 0) {
    $content = [];
    //drupal_flush_all_caches('*','cache_view', TRUE);
    \Drupal::service('cache.render')->invalidateAll();
    \Drupal::cache('render');
    $domain_node = \Drupal::routeMatch()->getParameter('domain');
    $domainId = $domain_node->id();
    $bcr = new BilimController();
    $content['ids'] = array(
                          'domain' => $domainId,
                          'root' => $root,
                          'cf' => $cf
                        );
    $content['username'] = $this->user->getUsername();
    $content['domain'] = $bcr->getCFbyDomain($domainId,$root,$cf);  
    $content['courses'] = $bcr->getContentbyDomain($domainId,$root,$cf);
    $content['domaininfo'] = $bcr->getDomainViewInfo($domainId,$root,$cf);
    return [
      '#theme' => 'page_domainview',
      '#content' => $content,
    ];
  }

}