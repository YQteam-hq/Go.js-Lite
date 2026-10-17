<?php

namespace Gojs\Tests;

use PHPUnit\Framework\TestCase;

class CustomErrorPagesTest extends TestCase
{
    private $bodyBackup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->bodyBackup = isset($GLOBALS['gojs_body_override']) ? $GLOBALS['gojs_body_override'] : null;
        $GLOBALS['gojs_defer_response'] = false;
        $GLOBALS['gojs_deferred_response'] = null;
        @unlink(CONFIG_DIR . '/custom_error_pages.json');
    }

    protected function tearDown(): void
    {
        @unlink(CONFIG_DIR . '/custom_error_pages.json');
        if ($this->bodyBackup === null) {
            unset($GLOBALS['gojs_body_override']);
        } else {
            $GLOBALS['gojs_body_override'] = $this->bodyBackup;
        }
        $GLOBALS['gojs_defer_response'] = false;
        $GLOBALS['gojs_deferred_response'] = null;
        parent::tearDown();
    }

    private function call($handler)
    {
        $GLOBALS['gojs_defer_response'] = true;
        $GLOBALS['gojs_deferred_response'] = null;
        try {
            $handler();
        } catch (\GoJSApiResponseSent $sent) {
            // The deferred response is captured below.
        }
        $GLOBALS['gojs_defer_response'] = false;
        $response = $GLOBALS['gojs_deferred_response'];
        $GLOBALS['gojs_deferred_response'] = null;
        return $response;
    }

    private function template($title)
    {
        return '<!DOCTYPE html><html><head><title>' . $title . '</title></head>'
            . '<body><h1>' . $title . '</h1></body></html>';
    }

    public function testSavingATemplateReturnsTheTemplate(): void
    {
        $GLOBALS['gojs_body_override'] = array(
            'error_code' => '404',
            'title' => 'Not found',
            'content' => $this->template('Not found'),
        );

        $response = $this->call('gojs_api_custom_error_pages_update_template');

        $this->assertSame('404', $response['data']['error_code']);
        $this->assertSame('Not found', $response['data']['title']);
        $this->assertArrayHasKey('updated_at', $response['data']);
        $this->assertArrayNotHasKey('success', $response['data']);
    }

    public function testTheSavedTemplateIsReadableAgain(): void
    {
        $GLOBALS['gojs_body_override'] = array(
            'error_code' => '500',
            'title' => 'Server error',
            'content' => $this->template('Server error'),
        );

        $this->call('gojs_api_custom_error_pages_update_template');

        $config = gojs_custom_error_pages_load_config();

        $this->assertArrayHasKey('500', $config['templates']);
        $this->assertSame('Server error', $config['templates']['500']['title']);
    }

    public function testResettingATemplateReturnsTheDefaultTemplate(): void
    {
        $GLOBALS['gojs_body_override'] = array(
            'error_code' => '404',
            'title' => 'Custom',
            'content' => $this->template('Custom'),
        );
        $this->call('gojs_api_custom_error_pages_update_template');

        $GLOBALS['gojs_body_override'] = array('error_code' => '404');
        $response = $this->call('gojs_api_custom_error_pages_reset_template');

        $this->assertSame('404', $response['data']['error_code']);
        $this->assertStringContainsString('<!DOCTYPE html>', $response['data']['content']);
        $this->assertSame('404 Not Found', $response['data']['title']);
    }

    public function testAnUnsupportedCodeIsRejectedWithoutTouchingTheStore(): void
    {
        $GLOBALS['gojs_body_override'] = array(
            'error_code' => '418',
            'content' => $this->template('Teapot'),
        );

        $response = $this->call('gojs_api_custom_error_pages_update_template');

        $this->assertSame('invalid_error_code', $response['error']['code']);
        $this->assertFileDoesNotExist(CONFIG_DIR . '/custom_error_pages.json');
    }

    public function testSavingReportsTheWriteResultWithoutAnswering(): void
    {
        $result = gojs_custom_error_pages_save_config(array('templates' => array()));

        $this->assertTrue($result['success']);
        $this->assertNull($GLOBALS['gojs_deferred_response']);
    }
}
