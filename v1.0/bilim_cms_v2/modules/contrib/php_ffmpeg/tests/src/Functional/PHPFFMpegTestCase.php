<?php

namespace Drupal\Tests\php_ffmpeg\Functional;

use Drupal\Tests\BrowserTestBase;
use Drupal\Tests\TestFileCreationTrait;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use function chmod;
use function mt_rand;

/**
 * Test the API and basic function of the PHPFFMpeg module.
 *
 * @group php_ffmpeg
 */
class PHPFFMpegTestCase extends BrowserTestBase {

  use TestFileCreationTrait {
    getTestFiles as drupalGetTestFiles;
  }

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Modules to install.
   *
   * @var array
   */
  public static $modules = ['php_ffmpeg'];

  /**
   * The Drupal FS.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->fileSystem = $this->container->get('file_system');
  }

  /**
   * Tests of the administration page.
   */
  public function testAdminPage() {
    $account = $this->drupalCreateUser([], NULL, TRUE);

    $ffmpeg_binary = $this->randomString();
    $ffprobe_binary = $this->randomString();
    $execution_timeout = mt_rand(1, 42);
    $threads_amount = mt_rand(1, 42);

    $this->config('php_ffmpeg.settings')
      ->set('ffmpeg_binary', $ffmpeg_binary)
      ->set('ffprobe_binary', $ffprobe_binary)
      ->set('execution_timeout', $execution_timeout)
      ->set('threads_amount', $threads_amount)
      ->save();

    $this->drupalLogin($account);
    $this->drupalGet('admin/config/development/php-ffmpeg');

    $this->assertFieldByName('ffmpeg_binary', $ffmpeg_binary, 'The PHP-FFMpeg settings page should provide a field for the ffmpeg binary path.');
    $this->assertFieldByName('ffprobe_binary', $ffprobe_binary, 'The PHP-FFMpeg settings page should provide a field for the ffprobe binary path.');
    $this->assertFieldByName('execution_timeout', $execution_timeout, 'The PHP-FFMpeg settings page should provide a field for the ffmpeg command timeout.');
    $this->assertFieldByName('threads_amount', $threads_amount, 'The PHP-FFMpeg settings page should provide a field for the number of threads to use for ffmpeg commands.');

    $ffmpeg_binary = $this->fileSystem->realpath($this->drupalGetTestFiles('binary')[0]->uri);
    $ffprobe_binary = $this->fileSystem->realpath($this->drupalGetTestFiles('binary')[1]->uri);
    $execution_timeout = mt_rand(1, 42);
    $threads_amount = mt_rand(1, 42);

    $this->drupalPostForm(NULL, [
      'ffmpeg_binary' => $ffmpeg_binary,
      'ffprobe_binary' => $ffprobe_binary,
      'execution_timeout' => $execution_timeout,
      'threads_amount' => $threads_amount,
    ], 'Save configuration');
    $settings = $this->config('php_ffmpeg.settings');

    $this->assertFieldByName('ffmpeg_binary', $ffmpeg_binary, 'Submitting he PHP-FFMpeg settings page should update the value of the field for the ffmpeg binary path.');
    $this->assertFieldByName('ffprobe_binary', $ffprobe_binary, 'Submitting he PHP-FFMpeg settings page should update the value of the field for the ffprobe binary path.');
    $this->assertFieldByName('execution_timeout', $execution_timeout, 'Submitting he PHP-FFMpeg settings page should update the value of the field for the ffmpeg command timeout.');
    $this->assertFieldByName('threads_amount', $threads_amount, 'Submitting he PHP-FFMpeg settings page should update the value of the field for the number of threads to use for ffmpeg commands.');

    $this->assertEqual($settings->get('ffmpeg_binary'), $ffmpeg_binary, 'Submitting he PHP-FFMpeg settings page should update the ffmpeg binary path.');
    $this->assertEqual($settings->get('ffprobe_binary'), $ffprobe_binary, 'Submitting he PHP-FFMpeg settings page should update the ffproe binary path.');
    $this->assertEqual($settings->get('execution_timeout'), $execution_timeout, 'Submitting he PHP-FFMpeg settings page should update the ffmpeg command timeout.');
    $this->assertEqual($settings->get('threads_amount'), $threads_amount, 'Submitting he PHP-FFMpeg settings page should update the number of threads to use for ffmpeg commands.');

    $invalidFilenames = [
      $this->randomMachineName(),
      $this->randomMachineName(),
    ];

    $this->drupalPostForm(NULL, [
      'ffmpeg_binary' => $invalidFilenames[0],
      'ffprobe_binary' => $invalidFilenames[1],
      'execution_timeout' => $this->randomString(),
      'threads_amount' => $this->randomString(),
    ], 'Save configuration');
    $settings = $this->config('php_ffmpeg.settings');

    $this->assertText("File not found: $invalidFilenames[0]", "Submission of the the PHP-FFMpeg settings page should validate the ffmpeg binary path is an existing file.");
    $this->assertText("File not found: $invalidFilenames[1]", "Submission of the the PHP-FFMpeg settings page should validate the ffprobe binary path is an existing file.");
    $this->assertEqual($settings->get('ffmpeg_binary'), $ffmpeg_binary, 'Submitting he PHP-FFMpeg settings page with invalid values should not update the ffmpeg binary path.');
    $this->assertEqual($settings->get('ffprobe_binary'), $ffprobe_binary, 'Submitting he PHP-FFMpeg settings page with invalid values should not update the ffprobe path.');
    $this->assertEqual($settings->get('execution_timeout'), $execution_timeout, 'Submitting he PHP-FFMpeg settings page with invalid values should not update the ffmpeg command time path.');
    $this->assertEqual($settings->get('threads_amount'), $threads_amount, 'Submitting he PHP-FFMpeg settings page with invalid values should not update the ffmpeg command threads number.');
  }

  /**
   * Checks whether configuring of binaries' paths is working.
   */
  public function testFactories() {
    chmod($this->fileSystem->realpath($this->drupalGetTestFiles('binary')[0]->uri), 0777);
    chmod($this->fileSystem->realpath($this->drupalGetTestFiles('binary')[1]->uri), 0777);
    $this->config('php_ffmpeg.settings')
      ->set('ffmpeg_binary', $this->fileSystem->realpath($this->drupalGetTestFiles('binary')[0]->uri))
      ->set('ffprobe_binary', $this->fileSystem->realpath($this->drupalGetTestFiles('binary')[1]->uri))
      ->save();

    $factory = $this->container->get('php_ffmpeg.factory');

    $this->assertInstanceOf(FFMpeg::class, $factory->getFFMpeg(), "\Drupal::service('php_ffmpeg') should return an instance of \FFMpeg\FFMpeg.");
    $this->assertInstanceOf(FFProbe::class, $factory->getFFMpegProbe(), "\Drupal::service('php_ffmpeg.factory')->getFFMpegProbe() should return an instance of \FFMpeg\FFProbe.");
  }

}
