<?php

namespace Drupal\Tests\php_ffmpeg\Unit;

use Drupal\Core\Cache\MemoryBackendFactory;
use Drupal\php_ffmpeg\PHPFFMpegCache;
use Drupal\Tests\UnitTestCase;

/**
 * Unit test for PHPFFMpegCache.
 *
 * @group php_ffmp
 */
class PHPFFMpegCacheTest extends UnitTestCase {

  /**
   * Cache backend.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface
   */
  protected $backend;

  /**
   * Random prefix.
   *
   * @var string
   */
  protected $prefix;

  /**
   * Cache.
   *
   * @var \Drupal\php_ffmpeg\PHPFFMpegCache
   */
  protected $cache;


  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['php_ffmpeg'];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->backend = (new MemoryBackendFactory())->get('php_ffmpeg');
    $this->prefix = $this->randomMachineName();
    $this->cache = new PHPFFMpegCache($this->backend, $this->prefix);
  }

  /**
   * Test for PHPFFMpeg::get().
   */
  public function testFetch() {
    $cid = $this->randomMachineName();
    $value = $this->randomMachineName();
    $this->backend->set("{$this->prefix}:{$cid}", $value);
    self::assertEquals($this->cache->fetch($cid), $value, 'PHPFFMpeg::get() should return the value stored in the backend when it exists.');
    $this->assertFalse($this->cache->fetch($this->randomMachineName()), 'PHPFFMpeg::get() should return FALSE when no value exist in the backend.');
  }

  /**
   * Test for PHPFFMpeg::contains().
   */
  public function testContains() {
    $cid = $this->randomMachineName();
    $value = $this->randomMachineName();
    $this->backend->set("{$this->prefix}:{$cid}", $value);
    self::assertTrue($this->cache->contains($cid), 'PHPFFMpeg::contains() should return TRUE when a value exists in the backend.');
    self::assertFalse($this->cache->contains($this->randomMachineName()), 'PHPFFMpeg::contains() should return FALSE when no value exist in the backend.');
  }

  /**
   * Test for PHPFFMpeg::save().
   */
  public function testSave() {
    $cid = $this->randomMachineName();
    $value = $this->randomMachineName();
    $this->cache->save($cid, $value);
    self::assertEquals($this->backend->get("{$this->prefix}:{$cid}")->data, $value, 'PHPFFMpeg::save() should set the value in the backend.');
  }

  /**
   * Test for PHPFFMpeg::delete().
   */
  public function testDelete() {
    $cid = $this->randomMachineName();
    $value = $this->randomMachineName();
    $this->backend->set("{$this->prefix}:{$cid}", $value);
    $this->cache->delete($cid);
    self::assertFalse($this->backend->get("{$this->prefix}:{$cid}"), 'PHPFFMpeg::delete() should clear the value in the backend.');
  }

  /**
   * Test for PHPFFMpeg::getStats().
   */
  public function testGetStats() {
    self::assertNull($this->cache->getStats(), 'PHPFFMpeg::getStats() should return NULL.');
  }

}
