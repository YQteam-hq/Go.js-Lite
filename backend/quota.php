<?php

function gojs_quota_path() {
    return CONFIG_DIR . '/quota';
}

function gojs_quota_ensure_dir() {
    $dir = gojs_quota_path();
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    return $dir;
}

/**
 * Builds the file-name stem a user's counters share.
 *
 * @param string $uid User identifier taken from the session
 * @return string Returns the identifier reduced to characters that are safe in a file name
 */
function gojs_quota_user_key($uid) {
    return preg_replace('/[^A-Za-z0-9_-]/', '_', (string)$uid);
}

/**
 * Describes the per-minute limits of a role.
 *
 * @param string $role Role name from the session
 * @return array|null Returns the read and write limits, or null for an unlimited role
 */
function gojs_quota_role_limits($role) {
    $limits = array(
        'viewer'   => array('get' => 5,   'write' => 1),
        'operator' => array('get' => 30,  'write' => 5),
    );
    return isset($limits[$role]) ? $limits[$role] : null;
}

/**
 * Returns the counter file of one user, kind and minute bucket.
 *
 * The kind is part of the name so that reads and writes are counted in
 * separate buckets. Sharing one counter made a read spend the write budget:
 * a viewer that loaded a few pages could not save anything afterwards.
 *
 * @param string $uid User identifier
 * @param string $kind Either "get" or "write"
 * @param int $bucket Minute bucket, the number of minutes since the epoch
 * @return string Returns the absolute path of the counter file
 */
function gojs_quota_counter_file($uid, $kind, $bucket) {
    return gojs_quota_path() . '/' . gojs_quota_user_key($uid) . '_' . $kind . '_' . (int)$bucket . '.json';
}

/**
 * Reads the count stored in a counter file.
 *
 * @param string $file Absolute path of the counter file
 * @return int Returns the stored count, or 0 when the file is missing or unreadable
 */
function gojs_quota_read_counter($file) {
    if (!file_exists($file)) return 0;
    $raw = @file_get_contents($file);
    $data = $raw ? json_decode($raw, true) : null;
    return is_array($data) && isset($data['count']) ? (int)$data['count'] : 0;
}

/**
 * Adds one hit to a counter file, preserving the count already stored there.
 *
 * @param string $uid User identifier
 * @param string $kind Either "get" or "write"
 * @param int $bucket Minute bucket, the number of minutes since the epoch
 * @return void
 */
function gojs_quota_increment_counter($uid, $kind, $bucket) {
    $file = gojs_quota_counter_file($uid, $kind, $bucket);
    $data = array('count' => gojs_quota_read_counter($file) + 1, 'last_ts' => time());
    @file_put_contents($file, json_encode($data), LOCK_EX);
}

/**
 * Counts a user's requests of one kind over the sliding one-minute window.
 *
 * @param string $uid User identifier
 * @param string $kind Either "get" or "write"
 * @param int $bucket Minute bucket, the number of minutes since the epoch
 * @return int Returns the hits recorded in the current and the previous bucket
 */
function gojs_quota_window_count($uid, $kind, $bucket) {
    return gojs_quota_read_counter(gojs_quota_counter_file($uid, $kind, $bucket))
        + gojs_quota_read_counter(gojs_quota_counter_file($uid, $kind, $bucket - 1));
}

/**
 * Deletes the counter files that fell out of the sliding window.
 *
 * Files written before the kinds were separated have no kind segment in their
 * name; they are matched too, so an upgrade does not leave them behind.
 *
 * @param string $uid User identifier
 * @param int $bucket Minute bucket of the request being counted
 * @return void
 */
function gojs_quota_prune_counters($uid, $bucket) {
    $entries = glob(gojs_quota_path() . '/' . gojs_quota_user_key($uid) . '_*.json');
    if (!is_array($entries)) return;
    foreach ($entries as $file) {
        if (preg_match('/_(\d+)\.json$/', $file, $matches) && (int)$matches[1] < $bucket - 1) {
            @unlink($file);
        }
    }
}

function gojs_quota_check($user, $verb) {
    if (!is_array($user) || empty($user['role'])) {
        return array('allow' => true);
    }
    $role = $user['role'];
    if ($role === 'admin') {
        return array('allow' => true);
    }
    $limits = gojs_quota_role_limits($role);
    if ($limits === null) {
        return array('allow' => true);
    }
    $is_write = in_array(strtoupper($verb), array('POST','PUT','PATCH','DELETE'), true);
    $kind = $is_write ? 'write' : 'get';
    $limit = $is_write ? $limits['write'] : $limits['get'];

    $uid = isset($user['id']) ? $user['id'] : 'unknown';
    $bucket = (int)floor(time() / 60);
    gojs_quota_ensure_dir();
    $cur = gojs_quota_window_count($uid, $kind, $bucket);
    if ($cur >= $limit) {
        return array(
            'allow' => false,
            'limit_get' => $limits['get'],
            'limit_write' => $limits['write'],
            'reset_in' => 60 - (time() % 60),
            'count' => $cur,
        );
    }

    gojs_quota_increment_counter($uid, $kind, $bucket);
    gojs_quota_prune_counters($uid, $bucket);

    return array(
        'allow' => true,
        'limit_get' => $limits['get'],
        'limit_write' => $limits['write'],
        'remaining' => max(0, $limit - $cur - 1),
    );
}

function gojs_quota_enforce() {
    $u = function_exists('gojs_current_user') ? gojs_current_user() : null;
    if (!$u) return;
    $verb = function_exists('gojs_get_method') ? gojs_get_method() : 'GET';
    $r = gojs_quota_check($u, $verb);
    if (!empty($r['allow'])) {
        if (isset($r['limit_get'])) {
            header('X-RateLimit-Limit-Get: ' . $r['limit_get']);
            header('X-RateLimit-Limit-Write: ' . $r['limit_write']);
            if (isset($r['remaining'])) header('X-RateLimit-Remaining: ' . $r['remaining']);
        }
        return;
    }
    header('Retry-After: ' . (int)$r['reset_in']);
    header('X-RateLimit-Limit-Get: ' . (int)$r['limit_get']);
    header('X-RateLimit-Limit-Write: ' . (int)$r['limit_write']);
    header('X-RateLimit-Remaining: 0');
    gojs_json_response(null, array(
        'code' => 'too_many_requests',
        'message' => 'Too many requests, please retry in ' . (int)$r['reset_in'] . ' seconds',
        'retry_after' => (int)$r['reset_in'],
    ), 429);
}
