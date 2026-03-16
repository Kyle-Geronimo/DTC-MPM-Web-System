<?php
/**
 * Add Member API
 * Creates a new user and assigns to a team
 */
session_start();
require_once('config.php');
require_once('db_connect.php');
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $response['message'] = 'Invalid request method';
        echo json_encode($response);
        exit;
    }

    $firstname = isset($_POST['firstname']) ? trim($_POST['firstname']) : '';
    $lastname = isset($_POST['lastname']) ? trim($_POST['lastname']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $role = isset($_POST['role']) ? trim($_POST['role']) : 'user';
    $team_id = isset($_POST['team_id']) ? intval($_POST['team_id']) : null;

    if (empty($firstname) || empty($lastname) || empty($email)) {
        $response['message'] = 'First name, last name and email are required';
        echo json_encode($response);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Invalid email';
        echo json_encode($response);
        exit;
    }

    // check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $user_id = $row['id'];
    } else {
        // create user
        $username = strtolower(preg_replace('/[^a-z0-9]/','',explode('@',$email)[0]));
        $passwordHash = hash('sha256', 'password123');
        $full_name = $firstname . ' ' . $lastname;
        $created_at = date('Y-m-d H:i:s');

        $insert = $conn->prepare("INSERT INTO users (username, email, password, full_name, department, role, status, created_at) VALUES (?, ?, ?, ?, '', ?, 'active', ?)");
        $insert->bind_param('ssssss', $username, $email, $passwordHash, $full_name, $role, $created_at);
        if (!$insert->execute()) {
            $response['message'] = 'Failed to create user: ' . $insert->error;
            echo json_encode($response);
            exit;
        }
        $user_id = $insert->insert_id;
        $insert->close();
    }
    $stmt->close();

    // assign to team if provided
    if ($team_id) {
        // avoid duplicates
        $chk = $conn->prepare("SELECT id FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1");
        $chk->bind_param('ii', $team_id, $user_id);
        $chk->execute();
        $r2 = $chk->get_result();
        if ($r2 && $r2->num_rows === 0) {
            $ins = $conn->prepare("INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)");
            $joined = date('Y-m-d H:i:s');
            $ins->bind_param('iiss', $team_id, $user_id, $role, $joined);
            $ins->execute();
            $ins->close();
        }
        $chk->close();
    }

    $response['success'] = true;
    $response['message'] = 'Member added successfully';
    $response['user_id'] = $user_id;

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response);
if (isset($conn)) $conn->close();

?>
