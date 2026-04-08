<?php
/**
 * Update Team Handler
 * Updates an existing team in the database
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
    respond_error('Please log in to update teams', ERR_AUTH);
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
$v->required('id', 'Team ID')
  ->required('name', 'Team name')
  ->maxLength('name', 100, 'Team name');

if (!$v->passes()) {
    respond_validation_error($v->errors());
}

$id = intval($_POST['id']);

// Authorization: only admin or team lead can update
$current_user_id = intval($_SESSION['user_id'] ?? 0);
$user_role = '';
$stmt_r = $conn->prepare("SELECT role FROM users WHERE id = ?");
$stmt_r->bind_param('i', $current_user_id);
$stmt_r->execute();
$rr = $stmt_r->get_result();
if ($row_r = $rr->fetch_assoc()) $user_role = $row_r['role'];
$stmt_r->close();

if ($user_role !== 'admin') {
    $stmt_l = $conn->prepare("SELECT id FROM teams WHERE id = ? AND team_lead = ?");
    $stmt_l->bind_param('ii', $id, $current_user_id);
    $stmt_l->execute();
    if ($stmt_l->get_result()->num_rows === 0) {
        $stmt_l->close();
        respond_error('Only admins or team leaders can edit teams', ERR_AUTH);
    }
    $stmt_l->close();
}

$id = intval($_POST['id']);
$name = Validator::sanitize($_POST['name']);
$description = Validator::sanitize($_POST['description'] ?? '');
$team_lead = !empty($_POST['team_lead']) ? intval($_POST['team_lead']) : null;

// Update team
try {
    if ($team_lead) {
        $stmt = $conn->prepare("UPDATE teams SET name = ?, description = ?, team_lead = ? WHERE id = ?");
        $stmt->bind_param("ssii", $name, $description, $team_lead, $id);
    } else {
        $stmt = $conn->prepare("UPDATE teams SET name = ?, description = ? WHERE id = ?");
        $stmt->bind_param("ssi", $name, $description, $id);
    }

    if (!$stmt) {
        error_log('Update Team Prepare Error: ' . $conn->error);
        respond_error('Database error', ERR_DATABASE);
    }

    $stmt->execute();
    $stmt->close();
} catch (mysqli_sql_exception $e) {
    error_log('Update Team Exception: ' . $e->getMessage());
    respond_error('Failed to update team', ERR_DATABASE, 500);
}

// If members payload provided, update team_members mapping atomically
try {
    // Start transaction to ensure atomicity
    if (!$conn->begin_transaction()) {
        // If begin_transaction is not supported, proceed without transaction
        error_log('Could not start transaction for updating team members');
    }

    // Remove existing members for this team
    $delStmt = $conn->prepare("DELETE FROM team_members WHERE team_id = ?");
    if ($delStmt) {
        $delStmt->bind_param("i", $id);
        $delStmt->execute();
        $delStmt->close();
    }

    // If members provided, insert new ones
    if (isset($_POST['members'])) {
        $members = json_decode($_POST['members'], true);
        if (is_array($members)) {
            $insStmt = $conn->prepare("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)");
            if ($insStmt) {
                foreach ($members as $user_id) {
                    $uid = intval($user_id);
                    $insStmt->bind_param("ii", $id, $uid);
                    $insStmt->execute();
                }
                $insStmt->close();
            }
        }
    }

    // Commit transaction if available
    if (method_exists($conn, 'commit')) {
        $conn->commit();
    }
    
    // Sync chat group members with team members
    try {
        // Get the chat group for this team
        $chatGroupStmt = $conn->prepare("SELECT id FROM chat_groups WHERE team_id = ?");
        if ($chatGroupStmt) {
            $chatGroupStmt->bind_param("i", $id);
            $chatGroupStmt->execute();
            $chatResult = $chatGroupStmt->get_result();
            
            if ($chatResult && $chatResult->num_rows > 0) {
                $chatRow = $chatResult->fetch_assoc();
                $group_id = $chatRow['id'];
                $chatGroupStmt->close();
                
                // Delete all chat group members for this group
                $delChatStmt = $conn->prepare("DELETE FROM chat_group_members WHERE group_id = ?");
                if ($delChatStmt) {
                    $delChatStmt->bind_param("i", $group_id);
                    $delChatStmt->execute();
                    $delChatStmt->close();
                }
                
                // Add current team members to the chat group
                if (isset($_POST['members'])) {
                    $members = json_decode($_POST['members'], true);
                    if (is_array($members)) {
                        $addChatStmt = $conn->prepare("INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)");
                        if ($addChatStmt) {
                            foreach ($members as $user_id) {
                                $uid = intval($user_id);
                                $addChatStmt->bind_param("ii", $group_id, $uid);
                                $addChatStmt->execute();
                            }
                            $addChatStmt->close();
                        }
                    }
                }
            } else {
                $chatGroupStmt->close();
            }
        }
    } catch (Exception $e) {
        error_log('Chat group sync error: ' . $e->getMessage());
        // Don't fail the update if chat sync fails
    }
} catch (mysqli_sql_exception $e) {
    // Rollback if possible
    if (method_exists($conn, 'rollback')) {
        $conn->rollback();
    }
    error_log('Update Team Members Exception: ' . $e->getMessage());
    respond_error('Failed to update team members', ERR_DATABASE, 500);
}

// Audit log
try {
    $audit = get_audit_logger($conn);
    if ($audit) {
        $audit->log('update', 'team', (string)$id, null, [
            'name' => $name,
            'description' => $description,
            'team_lead' => $team_lead
        ]);
    }
} catch (Exception $e) {
    error_log('Audit log error: ' . $e->getMessage());
    // Don't fail the request if audit logging fails
}

respond_success([
    'team_id' => $id,
    'team_name' => $name
], 'Team updated successfully');
?>

