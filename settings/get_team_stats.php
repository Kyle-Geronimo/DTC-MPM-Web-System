<?php
/**
 * Get Team Statistics
 * Returns team and member statistics for dashboard display
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

try {
    // Total number of teams
    $teamsResult = $conn->query("SELECT COUNT(*) as total_teams FROM teams");
    $teamsData = $teamsResult->fetch_assoc();
    $totalTeams = (int)$teamsData['total_teams'];

    // Total unique members (users in any team)
    $membersResult = $conn->query("SELECT COUNT(DISTINCT user_id) as total_members FROM team_members");
    $membersData = $membersResult->fetch_assoc();
    $totalMembers = (int)$membersData['total_members'];

    // Count active users (assuming status = 'active' in users table)
    $activeResult = $conn->query("SELECT COUNT(*) as active_users FROM users WHERE status = 'active'");
    $activeData = $activeResult->fetch_assoc();
    $activeToday = (int)$activeData['active_users'];

    // Count inactive/on leave users (assuming status != 'active')
    $onLeaveResult = $conn->query("SELECT COUNT(*) as on_leave FROM users WHERE status != 'active'");
    $onLeaveData = $onLeaveResult->fetch_assoc();
    $onLeave = (int)$onLeaveData['on_leave'];

    respond_success([
        'total_teams' => $totalTeams,
        'total_members' => $totalMembers,
        'active_today' => $activeToday,
        'on_leave' => $onLeave
    ], 'Team statistics retrieved successfully');

} catch (Exception $e) {
    error_log('Get Team Stats Error: ' . $e->getMessage());
    respond_error('Failed to retrieve statistics', ERR_DATABASE);
}
?>
