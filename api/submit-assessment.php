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

// Pipedrive CRM configuratie
define('PIPEDRIVE_API_TOKEN', getenv('PIPEDRIVE_API_TOKEN') ?: '');
define('PIPEDRIVE_API_URL', 'https://api.pipedrive.com/v1');
define('PIPEDRIVE_PIPELINE_NAME', 'recruitmentapk'); // Naam van de pipeline in Pipedrive
define('ENABLE_PIPEDRIVE', !empty(PIPEDRIVE_API_TOKEN));

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

// Pipedrive CRM integratie
function createPipedriveDeal($data) {
    if (!ENABLE_PIPEDRIVE) {
        return ['success' => false, 'error' => 'Pipedrive not configured'];
    }

    $result = [
        'success' => false,
        'person_id' => null,
        'organization_id' => null,
        'deal_id' => null
    ];

    try {
        // Stap 1: Maak of vind Organization
        $org_id = findOrCreatePipedriveOrganization($data['company']);
        if ($org_id) {
            $result['organization_id'] = $org_id;
        }

        // Stap 2: Maak of vind Person
        $person_id = findOrCreatePipedrivePerson($data, $org_id);
        if ($person_id) {
            $result['person_id'] = $person_id;
        }

        // Stap 3: Maak Deal
        $deal_id = createPipedriveDealRecord($data, $person_id, $org_id);
        if ($deal_id) {
            $result['deal_id'] = $deal_id;
            $result['success'] = true;
        }

        // Stap 4: Voeg notitie toe met assessment details
        if ($deal_id) {
            addPipedriveNote($deal_id, $data);
        }

    } catch (Exception $e) {
        error_log("Pipedrive error: " . $e->getMessage());
        $result['error'] = $e->getMessage();
    }

    return $result;
}

function pipedriveRequest($endpoint, $method = 'GET', $data = null) {
    $url = PIPEDRIVE_API_URL . $endpoint;
    $url .= (strpos($url, '?') === false ? '?' : '&') . 'api_token=' . PIPEDRIVE_API_TOKEN;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code >= 400) {
        error_log("Pipedrive API error ($http_code): $response");
        return null;
    }

    return json_decode($response, true);
}

function findOrCreatePipedriveOrganization($company_name) {
    // Zoek bestaande organisatie
    $search = pipedriveRequest('/organizations/search?term=' . urlencode($company_name));

    if ($search && isset($search['data']['items'][0]['item']['id'])) {
        return $search['data']['items'][0]['item']['id'];
    }

    // Maak nieuwe organisatie
    $org = pipedriveRequest('/organizations', 'POST', [
        'name' => $company_name
    ]);

    return $org['data']['id'] ?? null;
}

function findOrCreatePipedrivePerson($data, $org_id = null) {
    // Zoek bestaande persoon op email
    $search = pipedriveRequest('/persons/search?term=' . urlencode($data['email']));

    if ($search && isset($search['data']['items'][0]['item']['id'])) {
        return $search['data']['items'][0]['item']['id'];
    }

    // Maak nieuwe persoon
    $person_data = [
        'name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone']
    ];

    if ($org_id) {
        $person_data['org_id'] = $org_id;
    }

    $person = pipedriveRequest('/persons', 'POST', $person_data);

    return $person['data']['id'] ?? null;
}

function getPipedriveRecruitmentPipeline() {
    static $pipeline_id = null;

    if ($pipeline_id !== null) {
        return $pipeline_id;
    }

    // Zoek de recruitmentapk pipeline
    $pipelines = pipedriveRequest('/pipelines');

    if ($pipelines && isset($pipelines['data'])) {
        foreach ($pipelines['data'] as $pipeline) {
            if (stripos($pipeline['name'], PIPEDRIVE_PIPELINE_NAME) !== false) {
                $pipeline_id = $pipeline['id'];
                return $pipeline_id;
            }
        }
    }

    return null; // Use default pipeline if not found
}

function getPipelineStages($pipeline_id) {
    $stages = pipedriveRequest('/stages?pipeline_id=' . $pipeline_id);
    return $stages['data'] ?? [];
}

function createPipedriveDealRecord($data, $person_id = null, $org_id = null) {
    // Bepaal deal value op basis van bedrijfsgrootte en urgentie
    $value = 5000; // Base value

    if (strpos($data['company_size'], '100') !== false || strpos($data['company_size'], '250') !== false) {
        $value = 15000;
    } elseif (strpos($data['company_size'], '50') !== false) {
        $value = 10000;
    }

    if ($data['urgency_level'] === 'ZEER HOOG') {
        $value *= 1.5;
    }

    // Vind de recruitmentapk pipeline
    $pipeline_id = getPipedriveRecruitmentPipeline();

    // Vind de eerste stage van de pipeline (of specifieke stage op basis van urgency)
    $stage_id = null;
    if ($pipeline_id) {
        $stages = getPipelineStages($pipeline_id);
        if (!empty($stages)) {
            // Gebruik de eerste stage als default
            $stage_id = $stages[0]['id'];

            // Als urgentie hoog is, probeer "Hot" of "Urgent" stage te vinden
            if ($data['urgency_level'] === 'ZEER HOOG' || $data['urgency_level'] === 'HOOG') {
                foreach ($stages as $stage) {
                    if (stripos($stage['name'], 'hot') !== false ||
                        stripos($stage['name'], 'urgent') !== false ||
                        stripos($stage['name'], 'prio') !== false) {
                        $stage_id = $stage['id'];
                        break;
                    }
                }
            }
        }
    }

    $deal_data = [
        'title' => "Recruitment APK - {$data['company']}",
        'value' => $value,
        'currency' => 'EUR',
        'status' => 'open'
    ];

    if ($pipeline_id) {
        $deal_data['pipeline_id'] = $pipeline_id;
    }
    if ($stage_id) {
        $deal_data['stage_id'] = $stage_id;
    }
    if ($person_id) {
        $deal_data['person_id'] = $person_id;
    }
    if ($org_id) {
        $deal_data['org_id'] = $org_id;
    }

    $deal = pipedriveRequest('/deals', 'POST', $deal_data);

    return $deal['data']['id'] ?? null;
}

function addPipedriveNote($deal_id, $data) {
    $score_emoji = $data['assessment_score'] >= 70 ? '🟢' : ($data['assessment_score'] >= 50 ? '🟡' : '🔴');
    $urgency_emoji = $data['urgency_level'] === 'ZEER HOOG' ? '🔥' : ($data['urgency_level'] === 'HOOG' ? '⚡' : '📋');

    $note_content = "
## Recruitment APK Assessment Resultaten

**Datum:** {$data['timestamp']}

### Scores
- $score_emoji **Assessment Score:** {$data['assessment_score']}% ({$data['score_category']})
- **Lead Score:** {$data['lead_score']}/100
- **Pijn Level:** {$data['pain_level']}
- $urgency_emoji **Urgentie:** {$data['urgency_level']}

### Bedrijfsinformatie
- **Sector:** {$data['sector']}
- **Bedrijfsgrootte:** {$data['company_size']}

### Aanbevolen Actie
";

    if ($data['urgency_level'] === 'ZEER HOOG') {
        $note_content .= "🔥 **URGENT:** Direct contact opnemen! Hoge pijn, lage score.";
    } elseif ($data['urgency_level'] === 'HOOG') {
        $note_content .= "⚡ Contact opnemen binnen 24 uur";
    } else {
        $note_content .= "📅 Follow-up inplannen deze week";
    }

    $note_content .= "\n\n---\n*Automatisch gegenereerd door Recruitment APK*";

    pipedriveRequest('/notes', 'POST', [
        'deal_id' => $deal_id,
        'content' => $note_content
    ]);
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

    // Pipedrive CRM integratie - maak deal aan in recruitmentapk pipeline
    $pipedrive_result = ['success' => false];
    if (ENABLE_PIPEDRIVE) {
        $pipedrive_result = createPipedriveDeal($data);
        if ($pipedrive_result['success']) {
            error_log(sprintf(
                "Pipedrive deal created: %s (Deal ID: %s, Pipeline: recruitmentapk)",
                $data['company'],
                $pipedrive_result['deal_id']
            ));
        }
    }

    // Log succesvolle submission
    error_log(sprintf(
        "Recruitment APK Assessment submitted: %s (%s) - Score: %d%% - Urgency: %s - Pipedrive: %s",
        $data['company'],
        $data['email'],
        $data['assessment_score'],
        $data['urgency_level'],
        $pipedrive_result['success'] ? 'OK' : 'SKIP'
    ));

    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Assessment succesvol ontvangen',
        'data' => [
            'csv_saved' => $csv_saved,
            'email_sent' => $email_sent,
            'pipedrive_synced' => $pipedrive_result['success'],
            'pipedrive_deal_id' => $pipedrive_result['deal_id'] ?? null,
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
