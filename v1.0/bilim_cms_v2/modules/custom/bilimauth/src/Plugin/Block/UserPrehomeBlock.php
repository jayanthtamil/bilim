<?php
/**
 * @file
 * Contains \Drupal\bilimauth\Plugin\Block\UserPrehomeBlock.
 */
 
namespace Drupal\bilimauth\Plugin\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\user; 

/**
 * Provides a 'User Prehome' Block
 *
 * @Block(
 *   id = "UserPrehomeBlock",
 *   admin_label = @Translation("User Prehome block"),
 *   category = @Translation("Blocks")
 * )
 */
class UserPrehomeBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {
    // login
    $form = \Drupal::formBuilder()->getForm(\Drupal\user\Form\UserLoginForm::class) ;
    $render = \Drupal::service('renderer');
    $login_form = $render->renderPlain($form);

    return [
      '#theme' => 'user_prehome',
      '#loginForm' => $login_form
    ];
  }
 
}