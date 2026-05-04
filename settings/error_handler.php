<?php
/**
 * Centralized Error Handler
 * Provides consistent error responses and user-friendly messages.
 */

if (defined('ERROR_HANDLER_LOADED')) return;
define('ERROR_HANDLER_LOADED', true);

require_once(__DIR__ . '/config.php');

// For web requests, disable display of PHP errors to avoid corrupting JSON API responses
if (php_sapi_name() !== 'cli') {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
}

// ==========================================
// ERROR CODES & MESSAGES
// ==========================================

define('ERR_VALIDATION', 'VALIDATION_ERROR');
define('ERR_AUTH', 'AUTHENTICATION_ERROR');
define('ERR_FORBIDDEN', 'FORBIDDEN');
define('ERR_NOT_FOUND', 'NOT_FOUND');
define('ERR_DATABASE', 'DATABASE_ERROR');
define('ERR_SERVER', 'SERVER_ERROR');
define('ERR_RATE_LIMIT', 'RATE_LIMIT');
define('ERR_CSRF', 'CSRF_ERROR');

$ERROR_MESSAGES = [
    ERR_VALIDATION  => 'Please check your input and try again.',
    ERR_AUTH        => 'Authentication failed. Please log in again.',
    ERR_FORBIDDEN   => 'You do not have permission to perform this action.',
    ERR_NOT_FOUND   => 'The requested resource was not found.',
    ERR_DATABASE    => 'A database error occurred. Please try again later.',
    ERR_SERVER      => 'An unexpected error occurred. Please try again later.',
    ERR_RATE_LIMIT  => 'Too many requests. Please wait before trying again.',
    ERR_CSRF        => 'Security token mismatch. Please refresh the page and try again.'
];

// ==========================================
// CUSTOM ERROR/EXCEPTION HANDLERS
// ==========================================

set_error_handler(function ($severity, $message, $file, $line) {
    // Don't handle suppressed errors
    if (!(error_reporting() & $severity)) return false;
    error_log("PHP Error [$severity]: $message in $file on line $line");
    return true;
});

set_exception_handler(function ($exception) {
    error_log("Uncaught Exception: " . $exception->getMessage() .
              " in " . $exception->getFile() . ":" . $exception->getLine());

    if (php_sapi_name() !== 'cli') {
        // Capture and log any accidental output that may have been sent
        if (ob_get_level()) {
            $buf = ob_get_clean();
            if (!empty($buf)) {
                error_log('Pre-output captured before exception: ' . substr($buf, 0, 2000));
            }
        }

        header('Content-Type: application/json', true, 500);
        echo json_encode([
            'success' => false,
            'error_code' => ERR_SERVER,
            'message' => defined('DEBUG_MODE') && DEBUG_MODE
                ? $exception->getMessage()
                : 'An unexpected error occurred. Please try again later.'
        ]);
    }
    exit(1);
});

// ==========================================
// RESPONSE HELPERS
// ==========================================

/**
 * Send a JSON success response
 */
function respond_success($data = [], $message = 'Success') {
    if (php_sapi_name() !== 'cli' && ob_get_level()) {
        $buf = ob_get_clean();
        if (!empty($buf)) error_log('Pre-output captured in respond_success: ' . substr($buf, 0, 1000));
    }
    header('Content-Type: application/json');
    $response = [
        'success' => true,
        'message' => $message
    ];
    echo json_encode(array_merge($response, $data));
    exit;
}

/**
 * Send a JSON error response
 */
function respond_error($message, $error_code = ERR_SERVER, $http_code = 400, $errors = []) {
    http_response_code($http_code);
    if (php_sapi_name() !== 'cli' && ob_get_level()) {
        $buf = ob_get_clean();
        if (!empty($buf)) error_log('Pre-output captured in respond_error: ' . substr($buf, 0, 1000));
    }
    header('Content-Type: application/json');
    $response = [
        'success' => false,
        'error_code' => $error_code,
        'message' => $message
    ];
    if (!empty($errors)) {
        $response['errors'] = $errors;
    }
    echo json_encode($response);
    exit;
}

/**
 * Send a validation error response
 */
function respond_validation_error($errors) {
    $message = is_array($errors) ? implode('. ', $errors) : $errors;
    respond_error($message, ERR_VALIDATION, 422, is_array($errors) ? $errors : [$errors]);
}

/**
 * Wrap a callable in try/catch with standardized error handling
 */
function safe_execute($callback) {
    try {
        return $callback();
    } catch (mysqli_sql_exception $e) {
        error_log("Database error: " . $e->getMessage());
        respond_error(
            defined('DEBUG_MODE') && DEBUG_MODE ? $e->getMessage() : 'A database error occurred.',
            ERR_DATABASE,
            500
        );
    } catch (Exception $e) {
        error_log("Application error: " . $e->getMessage());
        respond_error(
            defined('DEBUG_MODE') && DEBUG_MODE ? $e->getMessage() : 'An unexpected error occurred.',
            ERR_SERVER,
            500
        );
    }
}
