<?php
/**
 * Remove Member API
 * Removes a user from a team (and associated chat group if present)
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('config.php');
require_once('db_connect.php');
require_once('error_handler.php');

header('Content-Type: application/json');

// Ensure DB connection is available
if (!isset($conn) || !($conn instanceof mysqli)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    $team_id = isset($_POST['group_id']) ? intval($_POST['group_id']) : (isset($_POST['team_id']) ? intval($_POST['team_id']) : 0);
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

    if (!$team_id || !$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
        exit;
    }

    $current_user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 0;
    if (!$current_user_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit;
    }

    // Check permissions: admin or team lead
    $is_admin = false;
    $stmt_role = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt_role->bind_param('i', $current_user_id);
    $stmt_role->execute();
    $role_result = $stmt_role->get_result();
    if ($role_row = $role_result->fetch_assoc()) {
        $is_admin = ($role_row['role'] === 'admin');
    }
    $stmt_role->close();

    $is_lead = false;
    $stmt_lead = $conn->prepare("SELECT id FROM teams WHERE id = ? AND team_lead = ?");
    $stmt_lead->bind_param('ii', $team_id, $current_user_id);
    $stmt_lead->execute();
    if ($stmt_lead->get_result()->num_rows > 0) $is_lead = true;
    $stmt_lead->close();

    if (!$is_admin && !$is_lead) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only admins or team leaders can remove members']);
        exit;
    }

    // Remove from team_members
    $del = $conn->prepare("DELETE FROM team_members WHERE team_id = ? AND user_id = ?");
    if (!$del) throw new Exception('Prepare failed: ' . $conn->error);
    $del->bind_param('ii', $team_id, $user_id);
    if (!$del->execute()) throw new Exception('Execute failed: ' . $del->error);
    $del_count = $del->affected_rows;
    $del->close();

    // Also remove from any chat_group_members linked to the team
    try {
        $cg = $conn->prepare("SELECT id FROM chat_groups WHERE team_id = ?");
        if ($cg) {
            $cg->bind_param('i', $team_id);
            $cg->execute();
            $gr = $cg->get_result();
            if ($gr && $gr->num_rows > 0) {
                while ($row = $gr->fetch_assoc()) {
                    $group_id = intval($row['id']);
                    $delcg = $conn->prepare("DELETE FROM chat_group_members WHERE group_id = ? AND user_id = ?");
                    if ($delcg) {
                        $delcg->bind_param('ii', $group_id, $user_id);
                        $delcg->execute();
                        $delcg->close();
                    }
                }
            }
            $cg->close();
        }
    } catch (Exception $e) {
        // non-fatal
        error_log('Error cleaning chat group membership: ' . $e->getMessage());
    }

    echo json_encode(['success' => true, 'message' => 'Member removed', 'deleted' => $del_count]);

    // Save report entry for member removal
    try {
        require_once(__DIR__ . '/report_helper.php');
        save_report($conn, 'Member Removed from Team: ' . $team_id, 'team', [
            'team_id' => $team_id,
            'user_id' => $user_id,
            'deleted' => $del_count
        ]);
    } catch (Exception $e) {
        error_log('remove_member: save_report failed: ' . $e->getMessage());
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error removing member: ' . $e->getMessage()]);
}

if (isset($conn)) $conn->close();

?>
