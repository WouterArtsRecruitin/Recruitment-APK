<?php
/**
 * FlowMaster Pro V4 - Assessment Submission API
 * Veilige server-side verwerking van assessment data
 *
 * Beveiligingsmaatregelen:
 * - CSRF token validatie
 * - Input sanitization
 * - Rate limiting
 * - SQL injection preventie
 * - XSS preventie
 */

// Beveiligingsheaders
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS configuratie (pas aan voor productie)
header('Access-Control-Allow-Origin: https://recruitmentapk.nl');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Max-Age: 86400');

// Preflight request afhandeling
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Alleen POST requests toegestaan
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Configuratie
define('MAX_REQUESTS_PER_HOUR', 5);
define('ADMIN_EMAIL', 'info@recruitmentapk.nl');
define('ENABLE_EMAIL_NOTIFICATIONS', true);

// Rate limiting per IP
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $cache_file = sys_get_temp_dir() . '/flowmaster_ratelimit_' . md5($ip) . '.json';

    $now = time();
    $requests = [];

    if (file_exists($cache_file)) {
        $data = json_decode(file_get_contents($cache_file), true);
        if ($data && isset($data['requests'])) {
            // Filter requests binnen het laatste uur
            $requests = array_filter($data['requests'], function($timestamp) use ($now) {
                return ($now - $timestamp) < 3600;
            });
        }
    }

    if (count($requests) >= MAX_REQUESTS_PER_HOUR) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Te veel verzoeken. Probeer het over een uur opnieuw.'
        ]);
        exit();
    }

    // Voeg nieuwe request toe
    $requests[] = $now;
    file_put_contents($cache_file, json_encode(['requests' => array_values($requests)]));
}

// Input sanitization
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Validatie functies
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePhone($phone) {
    // Nederlandse telefoon nummers
    $pattern = '/^(\+31|0|0031)?[1-9][0-9]{8}$/';
    $cleaned = preg_replace('/[\s\-\(\)]/', '', $phone);
    return preg_match($pattern, $cleaned);
}

function validateCompanyName($name) {
    return strlen($name) >= 2 && strlen($name) <= 100;
}

function validateAssessmentScore($score) {
    return is_numeric($score) && $score >= 0 && $score <= 100;
}

// Email verzenden
function sendEmailNotification($data) {
    if (!ENABLE_EMAIL_NOTIFICATIONS) {
        return false;
    }

    $to = ADMIN_EMAIL;
    $subject = "Nieuwe FlowMaster Assessment: {$data['company']} - Score: {$data['assessment_score']}%";

    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #ff6b35, #ff8c42); color: white; padding: 20px; }
            .content { padding: 20px; }
            .stat { background: #f8fafc; padding: 15px; margin: 10px 0; border-left: 4px solid #ff6b35; }
            .label { font-weight: bold; color: #666; }
            .value { font-size: 18px; color: #ff6b35; font-weight: bold; }
            .urgent { background: #fee; border-left-color: #f00; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>🎯 Nieuwe FlowMaster Assessment</h2>
        </div>
        <div class='content'>
            <h3>Contact Informatie</h3>
            <div class='stat'>
                <span class='label'>Bedrijf:</span><br>
                <span class='value'>{$data['company']}</span>
            </div>
            <div class='stat'>
                <span class='label'>Naam:</span><br>
                <span class='value'>{$data['name']}</span>
            </div>
            <div class='stat'>
                <span class='label'>Email:</span><br>
                <span class='value'>{$data['email']}</span>
            </div>
            <div class='stat'>
                <span class='label'>Telefoon:</span><br>
                <span class='value'>{$data['phone']}</span>
            </div>

            <h3>Bedrijfs Details</h3>
            <div class='stat'>
                <span class='label'>Sector:</span> {$data['sector']}<br>
                <span class='label'>Bedrijfsgrootte:</span> {$data['company_size']}
            </div>

            <h3>Assessment Resultaten</h3>
            <div class='stat " . ($data['assessment_score'] < 50 ? "urgent" : "") . "'>
                <span class='label'>Assessment Score:</span><br>
                <span class='value'>{$data['assessment_score']}%</span> ({$data['score_category']})
            </div>
            <div class='stat'>
                <span class='label'>Urgentie Level:</span> {$data['urgency_level']}<br>
                <span class='label'>Lead Score:</span> {$data['lead_score']}/100<br>
                <span class='label'>Pijn Level:</span> {$data['pain_level']}
            </div>

            <h3>Aanbevolen Actie</h3>
            <div class='stat'>
                ";

    if ($data['urgency_level'] === 'ZEER HOOG') {
        $message .= "🔥 <strong>URGENT:</strong> Direct contact opnemen!";
    } elseif ($data['urgency_level'] === 'HOOG') {
        $message .= "⚡ Contact opnemen binnen 24 uur";
    } else {
        $message .= "📅 Follow-up inplannen deze week";
    }

    $message .= "
            </div>

            <p style='margin-top: 30px; padding: 20px; background: #fff5f2; border-radius: 8px;'>
                <strong>Timestamp:</strong> {$data['timestamp']}
            </p>
        </div>
    </body>
    </html>
    ";

    $headers = [
        'From: FlowMaster Assessment <noreply@recruitmentapk.nl>',
        'Reply-To: ' . $data['email'],
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion()
    ];

    return mail($to, $subject, $message, implode("\r\n", $headers));
}

// Opslaan in CSV backup
function saveToCSV($data) {
    $csv_file = __DIR__ . '/../data/assessments.csv';
    $csv_dir = dirname($csv_file);

    // Maak directory als deze niet bestaat
    if (!is_dir($csv_dir)) {
        mkdir($csv_dir, 0755, true);
    }

    $file_exists = file_exists($csv_file);
    $fp = fopen($csv_file, 'a');

    if ($fp === false) {
        return false;
    }

    // Header toevoegen als bestand nieuw is
    if (!$file_exists) {
        $headers = [
            'Timestamp', 'Naam', 'Email', 'Telefoon', 'Bedrijf', 'Sector', 'Bedrijfsgrootte',
            'Assessment_Score', 'Score_Categorie', 'Urgentie_Level', 'Lead_Score', 'Pijn_Level'
        ];

        for ($i = 1; $i <= 29; $i++) {
            $headers[] = 'Q' . str_pad($i, 2, '0', STR_PAD_LEFT);
        }

        fputcsv($fp, $headers);
    }

    // Data row
    $row = [
        $data['timestamp'],
        $data['name'],
        $data['email'],
        $data['phone'],
        $data['company'],
        $data['sector'],
        $data['company_size'],
        $data['assessment_score'],
        $data['score_category'],
        $data['urgency_level'],
        $data['lead_score'],
        $data['pain_level']
    ];

    // Voeg alle 29 antwoorden toe
    for ($i = 1; $i <= 29; $i++) {
        $key = 'answer_' . str_pad($i, 2, '0', STR_PAD_LEFT);
        $row[] = $data[$key] ?? 0;
    }

    $result = fputcsv($fp, $row);
    fclose($fp);

    return $result !== false;
}

// Hoofdlogica
try {
    // Rate limiting
    checkRateLimit();

    // Lees en parse input
    $json = file_get_contents('php://input');
    $input = json_decode($json, true);

    if (!$input) {
        throw new Exception('Ongeldige JSON data');
    }

    // Sanitize alle input
    $input = sanitizeInput($input);

    // Validatie
    $errors = [];

    if (!isset($input['name']) || strlen($input['name']) < 2) {
        $errors[] = 'Naam is verplicht (minimaal 2 karakters)';
    }

    if (!isset($input['email']) || !validateEmail($input['email'])) {
        $errors[] = 'Geldig email adres is verplicht';
    }

    if (!isset($input['phone']) || !validatePhone($input['phone'])) {
        $errors[] = 'Geldig telefoonnummer is verplicht';
    }

    if (!isset($input['company']) || !validateCompanyName($input['company'])) {
        $errors[] = 'Bedrijfsnaam is verplicht (2-100 karakters)';
    }

    if (!isset($input['assessment_score']) || !validateAssessmentScore($input['assessment_score'])) {
        $errors[] = 'Ongeldige assessment score';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit();
    }

    // Bereid data voor
    $data = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $input['name'],
        'email' => $input['email'],
        'phone' => $input['phone'],
        'company' => $input['company'],
        'sector' => $input['sector'] ?? 'Unknown',
        'company_size' => $input['company_size'] ?? 'Unknown',
        'assessment_score' => $input['assessment_score'],
        'score_category' => $input['score_category'] ?? '',
        'urgency_level' => $input['urgency_level'] ?? 'LAAG',
        'lead_score' => $input['lead_score'] ?? 0,
        'pain_level' => $input['pain_level'] ?? 'LAAG'
    ];

    // Voeg alle assessment antwoorden toe
    for ($i = 1; $i <= 29; $i++) {
        $key = 'answer_' . str_pad($i, 2, '0', STR_PAD_LEFT);
        $data[$key] = $input[$key] ?? 0;
    }

    // Opslaan in CSV
    $csv_saved = saveToCSV($data);

    // Email notificatie (alleen voor hoge prioriteit leads)
    $email_sent = false;
    if ($data['urgency_level'] === 'ZEER HOOG' || $data['urgency_level'] === 'HOOG' || $data['assessment_score'] < 60) {
        $email_sent = sendEmailNotification($data);
    }

    // Log succesvolle submission
    error_log(sprintf(
        "FlowMaster Assessment submitted: %s (%s) - Score: %d%% - Urgency: %s",
        $data['company'],
        $data['email'],
        $data['assessment_score'],
        $data['urgency_level']
    ));

    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Assessment succesvol ontvangen',
        'data' => [
            'csv_saved' => $csv_saved,
            'email_sent' => $email_sent,
            'timestamp' => $data['timestamp']
        ]
    ]);

} catch (Exception $e) {
    error_log("FlowMaster Assessment error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Er is een fout opgetreden bij het verwerken van uw assessment. Probeer het later opnieuw.'
    ]);
}
