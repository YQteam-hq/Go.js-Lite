<?php

namespace Gojs\Tests;

use PHPUnit\Framework\TestCase;

class CronScheduleTest extends TestCase
{
    /**
     * Builds a local timestamp so the expectations do not depend on the
     * timezone the suite runs in.
     */
    private function localTime($year, $month, $day, $hour, $minute)
    {
        return mktime($hour, $minute, 0, $month, $day, $year);
    }

    private function formatted($timestamp)
    {
        return date('Y-m-d H:i', $timestamp);
    }

    public function testStarExpandsToTheWholeRange(): void
    {
        $minutes = gojs_cron_expand_field('*', 0, 59);

        $this->assertCount(60, $minutes);
        $this->assertSame(0, $minutes[0]);
        $this->assertSame(59, $minutes[59]);
    }

    public function testStepAndRangeAndListAreExpanded(): void
    {
        $this->assertSame(array(0, 15, 30, 45), gojs_cron_expand_field('*/15', 0, 59));
        $this->assertSame(array(1, 2, 3, 4, 5), gojs_cron_expand_field('1-5', 1, 31));
        $this->assertSame(array(1, 3, 5), gojs_cron_expand_field('1,3,5', 0, 59));
        $this->assertSame(array(10, 15, 20), gojs_cron_expand_field('10-20/5', 0, 59));
    }

    public function testValuesOutsideTheRangeAreRejected(): void
    {
        $this->assertFalse(gojs_cron_expand_field('60', 0, 59));
        $this->assertFalse(gojs_cron_expand_field('0', 1, 31));
        $this->assertFalse(gojs_cron_expand_field('', 0, 59));
    }

    public function testEveryMinuteRunsOneMinuteLater(): void
    {
        $from = $this->localTime(2026, 1, 2, 10, 0);

        $this->assertSame($from + 60, gojs_cron_next_run('* * * * *', $from));
    }

    public function testDailyExpressionRunsAtTheConfiguredTime(): void
    {
        $from = $this->localTime(2026, 1, 2, 0, 0);

        $next = gojs_cron_next_run('30 3 * * *', $from);

        $this->assertSame('2026-01-02 03:30', $this->formatted($next));
    }

    public function testMonthlyExpressionRunsOnTheFirstDay(): void
    {
        $from = $this->localTime(2026, 1, 2, 0, 0);

        $next = gojs_cron_next_run('0 0 1 * *', $from);

        $this->assertSame('2026-02-01 00:00', $this->formatted($next));
    }

    public function testWeeklyExpressionRunsOnTheConfiguredWeekday(): void
    {
        $from = $this->localTime(2026, 1, 2, 0, 0);

        $next = gojs_cron_next_run('0 0 * * 1', $from);

        $this->assertSame('2026-01-05 00:00', $this->formatted($next));
    }

    public function testRestrictedDayOfMonthAndWeekdayMatchEitherField(): void
    {
        // 2026-01-02 is a Friday, so the next Monday comes before the next
        // first of the month. An AND combination would skip to 2027-01-01.
        $from = $this->localTime(2026, 1, 2, 0, 0);

        $next = gojs_cron_next_run('0 0 1 * 1', $from);

        $this->assertSame('2026-01-05 00:00', $this->formatted($next));
    }

    public function testRestrictedDayOfMonthStillMatchesOnItsOwn(): void
    {
        // 2026-01-15 is a Thursday and the expression asks for the fifteenth
        // or a Monday, so the weekday rule wins here.
        $from = $this->localTime(2026, 1, 16, 0, 0);

        $next = gojs_cron_next_run('0 0 15 * 1', $from);

        $this->assertSame('2026-01-19 00:00', $this->formatted($next));
    }

    public function testTheEarlierOfTheTwoDayRulesWins(): void
    {
        // From 2026-02-16 the next Sunday is 2026-02-22, which is earlier
        // than the next fifteenth of a month (2026-03-15).
        $from = $this->localTime(2026, 2, 16, 0, 0);

        $next = gojs_cron_next_run('0 0 15 * 0', $from);

        $this->assertSame('2026-02-22 00:00', $this->formatted($next));
    }

    public function testAStarDayFieldKeepsTheOtherFieldAuthoritative(): void
    {
        $from = $this->localTime(2026, 1, 16, 0, 0);

        $this->assertSame('2026-02-15 00:00', $this->formatted(gojs_cron_next_run('0 0 15 * *', $from)));
        $this->assertSame('2026-01-18 00:00', $this->formatted(gojs_cron_next_run('0 0 * * 0', $from)));
    }

    public function testInvalidExpressionsFallBackToADayLater(): void
    {
        $from = $this->localTime(2026, 1, 2, 0, 0);

        $this->assertSame($from + 86400, gojs_cron_next_run('0 0 * *', $from));
        $this->assertSame($from + 86400, gojs_cron_next_run('0 0 32 * *', $from));
        $this->assertSame($from + 86400, gojs_cron_next_run('', $from));
    }

    public function testTheNextRunIsStrictlyInTheFuture(): void
    {
        $from = $this->localTime(2026, 1, 5, 0, 0);

        $next = gojs_cron_next_run('0 0 * * 1', $from);

        $this->assertGreaterThan($from, $next);
        $this->assertSame('2026-01-12 00:00', $this->formatted($next));
    }
}
