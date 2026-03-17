<?php
/**
 * Server-Side Validation Library
 * Provides reusable validation rules for all form inputs.
 */

if (defined('VALIDATOR_LOADED')) return;
define('VALIDATOR_LOADED', true);

class Validator {
    private $errors = [];
    private $data = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    /**
     * Get sanitized value from data
     */
    public function get($field, $default = '') {
        $value = isset($this->data[$field]) ? $this->data[$field] : $default;
        if (is_string($value)) {
            $value = trim($value);
        }
        return $value;
    }

    /**
     * Check if validation passed
     */
    public function passes() {
        return empty($this->errors);
    }

    /**
     * Get all errors
     */
    public function errors() {
        return $this->errors;
    }

    /**
     * Get first error message
     */
    public function firstError() {
        return !empty($this->errors) ? reset($this->errors) : '';
    }

    // ==========================================
    // VALIDATION RULES
    // ==========================================

    public function required($field, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if ($value === '' || $value === null) {
            $this->errors[] = "$label is required.";
        }
        return $this;
    }

    public function email($field, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[] = "$label must be a valid email address.";
        }
        return $this;
    }

    public function minLength($field, $min, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && mb_strlen($value) < $min) {
            $this->errors[] = "$label must be at least $min characters.";
        }
        return $this;
    }

    public function maxLength($field, $max, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && mb_strlen($value) > $max) {
            $this->errors[] = "$label must not exceed $max characters.";
        }
        return $this;
    }

    public function numeric($field, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && !is_numeric($value)) {
            $this->errors[] = "$label must be a number.";
        }
        return $this;
    }

    public function integer($field, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_INT) && $value !== '0') {
            $this->errors[] = "$label must be a whole number.";
        }
        return $this;
    }

    public function between($field, $min, $max, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if ($value !== '' && is_numeric($value)) {
            $num = floatval($value);
            if ($num < $min || $num > $max) {
                $this->errors[] = "$label must be between $min and $max.";
            }
        }
        return $this;
    }

    public function date($field, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && strtotime($value) === false) {
            $this->errors[] = "$label must be a valid date.";
        }
        return $this;
    }

    public function dateAfter($field, $afterField, $label = null, $afterLabel = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $afterLabel = $afterLabel ?: ucfirst(str_replace('_', ' ', $afterField));
        $value = $this->get($field);
        $afterValue = $this->get($afterField);
        if (!empty($value) && !empty($afterValue)) {
            if (strtotime($value) < strtotime($afterValue)) {
                $this->errors[] = "$label must be after $afterLabel.";
            }
        }
        return $this;
    }

    public function inList($field, array $allowed, $label = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $value = $this->get($field);
        if (!empty($value) && !in_array($value, $allowed, true)) {
            $this->errors[] = "$label has an invalid value.";
        }
        return $this;
    }

    public function matches($field, $matchField, $label = null, $matchLabel = null) {
        $label = $label ?: ucfirst(str_replace('_', ' ', $field));
        $matchLabel = $matchLabel ?: ucfirst(str_replace('_', ' ', $matchField));
        if ($this->get($field) !== $this->get($matchField)) {
            $this->errors[] = "$label must match $matchLabel.";
        }
        return $this;
    }

    public function passwordStrength($field, $label = null) {
        $label = $label ?: 'Password';
        $value = $this->get($field);
        if (!empty($value)) {
            $minLen = defined('PASSWORD_MIN_LENGTH') ? PASSWORD_MIN_LENGTH : 8;
            if (mb_strlen($value) < $minLen) {
                $this->errors[] = "$label must be at least $minLen characters.";
            }
            if (!preg_match('/[A-Za-z]/', $value)) {
                $this->errors[] = "$label must contain at least one letter.";
            }
            if (!preg_match('/[0-9]/', $value)) {
                $this->errors[] = "$label must contain at least one number.";
            }
        }
        return $this;
    }

    /**
     * Sanitize a string for safe output (HTML entities)
     */
    public static function sanitize($value) {
        if (is_string($value)) {
            return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
        }
        return $value;
    }

    /**
     * Sanitize all values in an array
     */
    public static function sanitizeArray(array $data) {
        $clean = [];
        foreach ($data as $key => $value) {
            $clean[$key] = self::sanitize($value);
        }
        return $clean;
    }
}
?>
