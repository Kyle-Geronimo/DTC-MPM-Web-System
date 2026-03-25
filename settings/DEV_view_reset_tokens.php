<?php
/**
 * Development Tool: View Password Reset Tokens
 * WARNING: DELETE THIS FILE IN PRODUCTION!
 * 
 * Access at: http://localhost/ProjectDashboard/settings/DEV_view_reset_tokens.php
 */

require_once('db_connect.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Tokens - Development Only</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .warning {
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            background: white;
            border-collapse: collapse;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #2563eb;
            color: white;
        }
        .expired {
            background: #fee;
        }
        .used {
            background: #f0f0f0;
            text-decoration: line-through;
        }
        .valid {
            background: #efe;
        }
        .pending {
            background: #fff3cd;
        }
        .approved {
            background: #d4edda;
        }
        .rejected {
            background: #f8d7da;
        }
        .link {
            color: #2563eb;
            text-decoration: none;
            word-break: break-all;
            font-size: 11px;
        }
        .link:hover {
            text-decoration: underline;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            margin-right: 10px;
        }
        .btn:hover {
            background: #1d4ed8;
        }
        .stats {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stats h3 {
            margin-top: 0;
        }
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .stat-item {
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-item strong {
            display: block;
            font-size: 24px;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="warning">
        <strong>⚠️ DEVELOPMENT ONLY!</strong> This page shows password reset tokens and should be DELETED in production!<br>
        <small>Location: /settings/DEV_view_reset_tokens.php</small>
    </div>
    
    <?php
    // Get statistics
    $stats = [
        'total' => 0,
        'pending' => 0,
        'approved' => 0,
        'rejected' => 0,
        'valid' => 0,
        'expired' => 0,
        'used' => 0
    ];
    
    $statsQuery = "SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN expires_at < NOW() AND used = 0 THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN expires_at > NOW() AND used = 0 THEN 1 ELSE 0 END) as valid
    FROM password_reset_tokens";
    
    $statsResult = $conn->query($statsQuery);
    if ($statsResult && $statsRow = $statsResult->fetch_assoc()) {
        $stats = $statsRow;
    }
    ?>
    
    <div class="stats">
        <h3>📊 Token Statistics</h3>
        <div class="stat-grid">
            <div class="stat-item" style="background: #e3f2fd;">
                <strong><?php echo $stats['total']; ?></strong>
                <span>Total Tokens</span>
            </div>
            <div class="stat-item" style="background: #fff3cd;">
                <strong><?php echo $stats['pending']; ?></strong>
                <span>Pending</span>
            </div>
            <div class="stat-item" style="background: #d4edda;">
                <strong><?php echo $stats['approved']; ?></strong>
                <span>Approved</span>
            </div>
            <div class="stat-item" style="background: #f8d7da;">
                <strong><?php echo $stats['rejected']; ?></strong>
                <span>Rejected</span>
            </div>
            <div class="stat-item" style="background: #d1ecf1;">
                <strong><?php echo $stats['valid']; ?></strong>
                <span>Valid</span>
            </div>
            <div class="stat-item" style="background: #f5c6cb;">
                <strong><?php echo $stats['expired']; ?></strong>
                <span>Expired</span>
            </div>
            <div class="stat-item" style="background: #d6d8db;">
                <strong><?php echo $stats['used']; ?></strong>
                <span>Used</span>
            </div>
        </div>
    </div>
    
    <h1>🔐 Password Reset Tokens</h1>
    
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Reset Link</th>
                <th>Approval Status</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Used</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $sql = "SELECT pr.id, pr.email, pr.token, pr.created_at, pr.expires_at, pr.used, pr.used_at,
                           pr.approval_status, pr.new_password_hash, u.full_name
                    FROM password_reset_tokens pr
                    LEFT JOIN users u ON pr.email = u.email
                    ORDER BY pr.created_at DESC 
                    LIMIT 50";
            
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $now = time();
                    $expires = strtotime($row['expires_at']);
                    $isExpired = $expires < $now;
                    $isUsed = $row['used'] == 1;
                    
                    // Determine status and row class
                    $rowClass = "";
                    $status = "";
                    if ($isUsed) {
                        $status = "✓ Used";
                        $rowClass = "used";
                    } elseif ($isExpired) {
                        $status = "⏰ Expired";
                        $rowClass = "expired";
                    } elseif ($row['approval_status'] == 'pending') {
                        $status = "⏳ Valid & Pending";
                        $rowClass = "pending";
                    } elseif ($row['approval_status'] == 'approved') {
                        $status = "✅ Approved";
                        $rowClass = "approved";
                    } elseif ($row['approval_status'] == 'rejected') {
                        $status = "❌ Rejected";
                        $rowClass = "rejected";
                    } else {
                        $status = "✓ Valid";
                        $rowClass = "valid";
                    }
                    
                    $resetLink = "http://localhost/ProjectDashboard/page/reset_password.php?token=" . $row['token'];
                    $userName = $row['full_name'] ? htmlspecialchars($row['full_name']) : '(User not found)';
                    
                    echo "<tr class='$rowClass'>";
                    echo "<td>" . $row['id'] . "</td>";
                    echo "<td>" . htmlspecialchars($row['email']) . "<br><small style='color: #666;'>$userName</small></td>";
                    echo "<td><a href='$resetLink' class='link' target='_blank'>" . substr($resetLink, 0, 50) . "...</a></td>";
                    echo "<td><strong>" . strtoupper($row['approval_status']) . "</strong></td>";
                    echo "<td>" . date('Y-m-d H:i:s', strtotime($row['created_at'])) . "</td>";
                    echo "<td>" . date('Y-m-d H:i:s', strtotime($row['expires_at'])) . "</td>";
                    echo "<td>" . ($row['used_at'] ? date('Y-m-d H:i:s', strtotime($row['used_at'])) : '-') . "</td>";
                    echo "<td><strong>$status</strong></td>";
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='8' style='text-align: center; padding: 30px;'>No reset tokens found. Request a password reset to see tokens here.</td></tr>";
            }
            
            $conn->close();
            ?>
        </tbody>
    </table>
    
    <div style="margin-top: 20px;">
        <a href="../page/forgot_password.php" class="btn">🔑 Test Password Reset</a>
        <a href="../page/admin.html" class="btn">👤 Admin Panel</a>
        <a href="../page/login.php" class="btn">🏠 Go to Login</a>
    </div>
    
    <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px; font-size: 12px; color: #666;">
        <strong>Development Notes:</strong>
        <ul>
            <li>This tool displays all password reset tokens in the database</li>
            <li>Status colors: Yellow = Pending Approval, Green = Valid/Approved, Red = Expired/Rejected, Gray = Used</li>
            <li>Tokens expire 1 hour after creation</li>
            <li>Admin can approve/reject requests from the Admin Panel → Password Resets tab</li>
            <li><strong>⚠️ DELETE THIS FILE BEFORE DEPLOYING TO PRODUCTION!</strong></li>
        </ul>
    </div>
</body>
</html>
