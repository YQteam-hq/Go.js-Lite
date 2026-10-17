<?php

namespace Gojs\Tests;

use PHPUnit\Framework\TestCase;

class ClientIpTest extends TestCase
{
    private $serverBackup;
    private $configBackup;

    protected function setUp(): void
    {
        parent::setUp();
        $this->serverBackup = $_SERVER;
        $this->configBackup = isset($GLOBALS['config']) ? $GLOBALS['config'] : array();
        $GLOBALS['config'] = array();
    }

    protected function tearDown(): void
    {
        $_SERVER = $this->serverBackup;
        $GLOBALS['config'] = $this->configBackup;
        parent::tearDown();
    }

    private function request($remoteAddr, $forwardedFor = null)
    {
        unset($_SERVER['HTTP_X_FORWARDED_FOR']);
        $_SERVER['REMOTE_ADDR'] = $remoteAddr;
        if ($forwardedFor !== null) {
            $_SERVER['HTTP_X_FORWARDED_FOR'] = $forwardedFor;
        }
    }

    private function trustProxies(array $proxies)
    {
        $GLOBALS['config']['trustedProxies'] = $proxies;
    }

    public function testThePeerAddressIsUsedWithoutTrustedProxies(): void
    {
        $this->request('203.0.113.10', '198.51.100.7');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testTheHeaderIsIgnoredWhenThePeerIsNotATrustedProxy(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('203.0.113.10', '198.51.100.7');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testASingleForwardedHopBehindATrustedProxy(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', '203.0.113.10');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testASpoofedLeftmostEntryDoesNotWin(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', '1.2.3.4, 203.0.113.10');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testTheWholeTrustedChainIsSkippedFromTheRight(): void
    {
        $this->trustProxies(array('10.0.0.1', '10.0.0.2'));
        $this->request('10.0.0.1', '203.0.113.10, 10.0.0.2');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testAChainOfTrustedProxiesFallsBackToTheFirstHop(): void
    {
        $this->trustProxies(array('10.0.0.1', '10.0.0.2'));
        $this->request('10.0.0.1', '10.0.0.2');

        $this->assertSame('10.0.0.2', gojs_get_client_ip());
    }

    public function testAMissingHeaderYieldsThePeerAddress(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1');

        $this->assertSame('10.0.0.1', gojs_get_client_ip());
    }

    public function testAMissingPeerAddressIsReportedAsUnknown(): void
    {
        unset($_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_X_FORWARDED_FOR']);

        $this->assertSame('unknown', gojs_get_client_ip());
    }

    public function testAnEntryWithAPortIsReducedToTheAddress(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', '203.0.113.10:4711');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testABracketedIpv6HopIsAccepted(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', '[2001:db8::1]:443');

        $this->assertSame('2001:db8::1', gojs_get_client_ip());
    }

    public function testEntriesThatAreNotAddressesAreIgnored(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', 'unknown, 203.0.113.10');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }

    public function testAHeaderWithoutUsableEntriesYieldsThePeerAddress(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', 'unknown, not-an-ip');

        $this->assertSame('10.0.0.1', gojs_get_client_ip());
    }

    public function testEmptyEntriesAreSkipped(): void
    {
        $this->trustProxies(array('10.0.0.1'));
        $this->request('10.0.0.1', ' , 203.0.113.10 , ');

        $this->assertSame('203.0.113.10', gojs_get_client_ip());
    }
}
