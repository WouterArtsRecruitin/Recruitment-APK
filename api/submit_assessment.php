<?php
/**
 * Vercel Serverless Function - Assessment Submission Handler
 *
 * This file is automatically converted to a Vercel serverless function
 * Original: /submit_assessment.php
 */

// Enable CORS for Vercel deployment
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit();
}

// Get environment variables (Vercel)
$pipedrive_token = getenv('PIPEDRIVE_API_TOKEN');
$pipedrive_url = getenv('PIPEDRIVE_API_URL') ?: 'https://api.pipedrive.com/v1';

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!$data) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON data'
    ]);
    exit();
}

// Required fields validation
$required_fields = ['name', 'email', 'company'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields: ' . implode(', ', $missing_fields)
    ]);
    exit();
}

// Email validation
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid email address'
    ]);
    exit();
}

// Process assessment submission
try {
    $response = [
        'success' => true,
        'message' => 'Assessment submitted successfully',
        'data' => [
            'name' => $data['name'],
            'email' => $data['email'],
            'company' => $data['company'],
            'timestamp' => date('c')
        ]
    ];

    // If Pipedrive is configured, send to Pipedrive
    if ($pipedrive_token) {
        // Create person in Pipedrive
        $person_data = [
            'name' => $data['name'],
            'email' => [$data['email']],
            'org_id' => null // Will be set if company exists
        ];

        // Optional: Add to Pipedrive
        // Implement Pipedrive API calls here

        $response['pipedrive'] = 'Integration ready';
    }

    // Log submission (voor Vercel logs)
    error_log(sprintf(
        '[Assessment Submission] Name: %s, Email: %s, Company: %s',
        $data['name'],
        $data['email'],
        $data['company']
    ));

    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    error_log('[Assessment Error] ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => 'An error occurred processing your submission'
    ]);
}
?>
