<?php

namespace Gojs\Tests;

use PHPUnit\Framework\TestCase;

class WebsiteMonitorTest extends TestCase
{
    private $bodyBackup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->bodyBackup = isset($GLOBALS['gojs_body_override']) ? $GLOBALS['gojs_body_override'] : null;
        $GLOBALS['gojs_defer_response'] = false;
        $GLOBALS['gojs_deferred_response'] = null;
        @unlink(CONFIG_DIR . '/website_monitor.json');
    }

    protected function tearDown(): void
    {
        @unlink(CONFIG_DIR . '/website_monitor.json');
        if ($this->bodyBackup === null) {
            unset($GLOBALS['gojs_body_override']);
        } else {
            $GLOBALS['gojs_body_override'] = $this->bodyBackup;
        }
        $GLOBALS['gojs_defer_response'] = false;
        $GLOBALS['gojs_deferred_response'] = null;
        parent::tearDown();
    }

    /**
     * Runs a handler that ends the request through gojs_json_response() and
     * returns the response it produced.
     */
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

    public function testSavingTheConfigurationReturnsTheStoredConfiguration(): void
    {
        $GLOBALS['gojs_body_override'] = array(
            'websites' => array(
                array(
                    'id' => 'site-1',
                    'name' => 'Example',
                    'url' => 'https://example.org',
                    'enabled' => true,
                    'timeout' => 10,
                    'notifications' => true,
                ),
            ),
            'check_interval' => 15,
        );

        $response = $this->call('gojs_api_website_monitor_update_config');

        $this->assertTrue($response['data'] !== null);
        $this->assertSame(15, $response['data']['check_interval']);
        $this->assertCount(1, $response['data']['websites']);
        $this->assertSame('https://example.org', $response['data']['websites'][0]['url']);
        $this->assertArrayNotHasKey('success', $response['data']);
    }

    public function testTheStoredConfigurationSurvivesTheSave(): void
    {
        $GLOBALS['gojs_body_override'] = array('check_interval' => 30);

        $this->call('gojs_api_website_monitor_update_config');

        $stored = gojs_website_monitor_load_config();

        $this->assertSame(30, $stored['check_interval']);
    }

    public function testAPartialPayloadKeepsTheKnownWebsites(): void
    {
        gojs_website_monitor_save_config(array(
            'websites' => array(
                array('id' => 'site-1', 'name' => 'Example', 'url' => 'https://example.org', 'enabled' => true),
            ),
            'check_interval' => 5,
        ));

        $GLOBALS['gojs_body_override'] = array('check_interval' => 60);

        $response = $this->call('gojs_api_website_monitor_update_config');

        $this->assertSame(60, $response['data']['check_interval']);
        $this->assertCount(1, $response['data']['websites']);
        $this->assertSame('site-1', $response['data']['websites'][0]['id']);
    }

    public function testSavingReportsTheWriteResultWithoutAnswering(): void
    {
        $result = gojs_website_monitor_save_config(array('check_interval' => 10));

        $this->assertTrue($result['success']);
        $this->assertNull($GLOBALS['gojs_deferred_response']);
    }
}
