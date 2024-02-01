<?php

/**
 * @file
 * Contains \Drupal\custom\bilim\Plugin\Block\BilimBlock.
 */

namespace Drupal\bilim\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\bilim\Controller\BilimController;

/**
 * Provides a block with a platform elements.
 *
 * @Block(
 *   id = "bilim_block",
 *   admin_label = @Translation("Bilim block"),
 *   category = @Translation("Custom")
 * )
 */
class BilimBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {
    $current_path = \Drupal::service('path.current')->getPath();
    $path_args = explode('/', $current_path);
    //1926
    if(!empty($path_args)):
      $param = $path_args[2];
      $bcr = new BilimController();
      if($param != ''):
        $result .= $bcr->getCFbyDomain($param);
        return [
          '#type' => 'markup',
          '#markup' => $this->t($result),
        ];
      endif;
    endif;
  }

}