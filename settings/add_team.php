<?php
/**
 * Add Team Handler
 * Saves new team to database
 */

if (session_status() === PHP_SESSION_NONE) session_start();

// Include dependencies
require_once('config.php');
require_once('db_connect.php');
/** @var mysqli $conn */
if (!isset($conn)) { $conn = null; }
require_once('error_handler.php');
require_once('validator.php');
use Validator;
require_once('audit_logger.php');

// Set JSON header
header('Content-Type: application/json');

// Require login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    respond_error('Please log in to create teams', ERR_AUTH);
}

// Require POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_error('Invalid request method', ERR_VALIDATION);
}

if (!isset($conn) || $conn === null) {
    respond_error('Database connection failed', ERR_DATABASE);
}

// Validate input
$v = new Validator($_POST);
$v->required('name', 'Team name')
  ->maxLength('name', 100, 'Team name');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$name = Validator::sanitize($_POST['name']);
$description = Validator::sanitize($_POST['description'] ?? '');
$team_lead = !empty($_POST['team_lead']) ? intval($_POST['team_lead']) : null;

try {
    // Insert team — let AUTO_INCREMENT handle the id
    if ($team_lead) {
        $stmt = $conn->prepare("INSERT INTO teams (name, description, team_lead) VALUES (?, ?, ?)");
        if (!$stmt) {
            error_log('Add Team Prepare Error: ' . $conn->error);
            respond_error('Database error', ERR_DATABASE);
        }
        $stmt->bind_param("ssi", $name, $description, $team_lead);
    } else {
        $stmt = $conn->prepare("INSERT INTO teams (name, description) VALUES (?, ?)");
        if (!$stmt) {
            error_log('Add Team Prepare Error: ' . $conn->error);
            respond_error('Database error', ERR_DATABASE);
        }
        $stmt->bind_param("ss", $name, $description);
    }

    $stmt->execute();
    $team_id = $conn->insert_id;
    $stmt->close();

    // Handle members if provided
    if (!empty($_POST['members'])) {
        $members_json = $_POST['members'];
        $members = json_decode($members_json, true);
        if (is_array($members)) {
            $insStmt = $conn->prepare("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)");
            if ($insStmt) {
                foreach ($members as $uid) {
                    $uid = intval($uid);
                    $insStmt->bind_param("ii", $team_id, $uid);
                    $insStmt->execute();
                }
                $insStmt->close();
            }
        }
    }
    // If a team lead was provided, ensure they are also added to team_members with role 'leader'
    if ($team_lead) {
        try {
            $chk = $conn->prepare("SELECT id FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1");
            if ($chk) {
                $chk->bind_param('ii', $team_id, $team_lead);
                $chk->execute();
                $r2 = $chk->get_result();
                if ($r2 && $r2->num_rows === 0) {
                    $insLead = $conn->prepare("INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)");
                    if ($insLead) {
                        $joined = date('Y-m-d H:i:s');
                        $roleLabel = 'leader';
                        $insLead->bind_param('iiss', $team_id, $team_lead, $roleLabel, $joined);
                        $insLead->execute();
                        $insLead->close();
                    }
                }
                $chk->close();
            }
        } catch (Exception $e) {
            error_log('Failed to add team lead to team_members: ' . $e->getMessage());
        }
    }

} catch (mysqli_sql_exception $e) {
    error_log('Add Team Exception: ' . $e->getMessage());
    respond_error('Failed to create team', ERR_DATABASE, 500);
}

// Audit log
try {
    $audit = get_audit_logger($conn);
    if ($audit) {
        $audit->log('create', 'team', (string)$team_id, null, [
            'name' => $name,
            'description' => $description,
            'team_lead' => $team_lead
        ]);
    }
} catch (Exception $e) {
    error_log('Audit log error: ' . $e->getMessage());
    // Don't fail the request if audit logging fails
}

// Create group chat for the team
try {
    $groupName = $name . ' Group Chat';
    $groupDesc = 'Team group chat for ' . $name;
    
    $chatStmt = $conn->prepare("INSERT INTO chat_groups (team_id, name, description) VALUES (?, ?, ?)");
    if ($chatStmt) {
        $chatStmt->bind_param("iss", $team_id, $groupName, $groupDesc);
        $chatStmt->execute();
        $group_id = $conn->insert_id;
        $chatStmt->close();
        
        // Add all team members to the chat group
        if ($group_id > 0) {
            $memberStmt = $conn->prepare("INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)");
            if ($memberStmt) {
                if (!empty($_POST['members'])) {
                    $members = json_decode($_POST['members'], true);
                    if (is_array($members)) {
                        foreach ($members as $uid) {
                            $uid = intval($uid);
                            $memberStmt->bind_param("ii", $group_id, $uid);
                            $memberStmt->execute();
                        }
                    }
                }
                $memberStmt->close();
            }
        }
    }
} catch (Exception $e) {
    error_log('Chat group creation error: ' . $e->getMessage());
    // Don't fail the team creation if chat group creation fails
}

respond_success([
    'team_id' => $team_id,
    'team_name' => $name
], 'Team created successfully');

// Save a small report entry for UI real-time updates
try {
    require_once(__DIR__ . '/report_helper.php');
    save_report($conn, 'Team Created: ' . $name, 'team', [
        'team_id' => $team_id,
        'name' => $name,
        'team_lead' => $team_lead
    ]);
} catch (Exception $e) {
    error_log('add_team: save_report failed: ' . $e->getMessage());
}
?>
