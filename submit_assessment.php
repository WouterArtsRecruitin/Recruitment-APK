<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'phone', 'company', 'answers'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

// Sanitize input
$name = htmlspecialchars($input['name']);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars($input['phone']);
$company = htmlspecialchars($input['company']);
$answers = $input['answers'];
$completionTime = $input['completionTime'] ?? 0;
$timestamp = $input['timestamp'] ?? date('c');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Calculate basic assessment metrics
$totalQuestions = 19;
$answeredQuestions = count($answers);
$completionRate = round(($answeredQuestions / $totalQuestions) * 100, 2);

// Email configuration
$to_email = 'warts@recruitin.nl';
$subject = "🎯 Nieuwe RecruitPro Assessment: $company";
$headers = "From: noreply@recruitmentapk.nl\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Create detailed email body
$email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 5px; text-align: center; }
        .answers { background: white; padding: 15px; border-radius: 8px; }
        .answer-item { margin: 10px 0; padding: 8px; background: #f0f7ff; border-left: 4px solid #f97316; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>🎯 RecruitPro Assessment Voltooid</h1>
        <p>Nieuwe lead van $company</p>
    </div>
    
    <div class='content'>
        <div class='section'>
            <h2>👤 Contactgegevens</h2>
            <p><strong>Naam:</strong> $name</p>
            <p><strong>Email:</strong> <a href='mailto:$email'>$email</a></p>
            <p><strong>Telefoon:</strong> <a href='tel:$phone'>$phone</a></p>
            <p><strong>Bedrijf:</strong> $company</p>
            <p><strong>Datum:</strong> " . date('d-m-Y H:i', strtotime($timestamp)) . "</p>
        </div>
        
        <div class='section'>
            <h2>📊 Assessment Metrics</h2>
            <div class='metric'>
                <strong>$answeredQuestions/$totalQuestions</strong><br>
                <small>Vragen Beantwoord</small>
            </div>
            <div class='metric'>
                <strong>$completionRate%</strong><br>
                <small>Completion Rate</small>
            </div>
            <div class='metric'>
                <strong>" . gmdate('i:s', $completionTime) . "</strong><br>
                <small>Completion Time</small>
            </div>
        </div>
        
        <div class='section'>
            <h2>🎯 Assessment Antwoorden</h2>
            <div class='answers'>";

// Add answers to email
$question_titles = [
    1 => "Sector",
    2 => "Bedrijfsgrootte", 
    3 => "Jaarlijks volume",
    4 => "Grootste uitdaging",
    5 => "Time-to-hire",
    6 => "Success rate",
    7 => "Cost-per-hire",
    8 => "Kwaliteit tevredenheid",
    9 => "Beste bron kandidaten",
    10 => "Tools & systemen",
    11 => "Employer branding",
    12 => "Kosten verkeerde hire",
    13 => "Succes meting",
    14 => "Grootste zorg komende 2 jaar",
    15 => "Markt competitiviteit",
    16 => "Werkgever aantrekkelijkheid",
    17 => "Proces organisatie",
    18 => "Urgentie verbetering",
    19 => "Ondersteuning bereidheid"
];

$question_options = [
    1 => ["🏗️ Bouw & Constructie", "⚡ Installatietechniek", "🔧 Metaalbewerking", "⚙️ Machinebouw", "💻 High-tech", "📋 Andere technische sector"],
    2 => ["👤 1-25 medewerkers", "👥 25-50 medewerkers", "🏢 50-100 medewerkers", "🏭 100-250 medewerkers", "🌐 250+ medewerkers", "📊 Wisselend"],
    // Add other options as needed
];

foreach ($answers as $questionNum => $answerIndex) {
    $questionNum = intval($questionNum) + 1; // Convert to 1-based indexing
    $questionTitle = $question_titles[$questionNum] ?? "Vraag $questionNum";
    
    if (isset($question_options[$questionNum])) {
        $answerText = $question_options[$questionNum][$answerIndex] ?? "Antwoord $answerIndex";
    } else {
        $answerText = "Optie " . ($answerIndex + 1);
    }
    
    $email_body .= "<div class='answer-item'><strong>$questionTitle:</strong> $answerText</div>";
}

$email_body .= "
            </div>
        </div>
        
        <div class='section'>
            <h2>🚀 Volgende Stappen</h2>
            <p>✅ <strong>Direct contact opnemen binnen 24 uur</strong></p>
            <p>📞 Bel: <a href='tel:$phone'>$phone</a></p>
            <p>📧 Email: <a href='mailto:$email'>$email</a></p>
            <p>🎯 Focus op: Grootste uitdaging uit assessment</p>
        </div>
    </div>
    
    <div class='footer'>
        <p>© 2025 RecruitIn BV - RecruitPro Assessment</p>
        <p>Assessment voltooid op: www.recruitmentapk.nl</p>
    </div>
</body>
</html>";

// Send email
$mail_sent = mail($to_email, $subject, $email_body, $headers);

// Also send confirmation to user
$user_subject = "Bedankt voor je RecruitPro Assessment - $name";
$user_headers = "From: Wouter Arts <warts@recruitin.nl>\r\n";
$user_headers .= "Reply-To: warts@recruitin.nl\r\n";
$user_headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$user_email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>🎉 Bedankt $name!</h1>
        <p>Je RecruitPro Assessment is voltooid</p>
    </div>
    
    <div class='content'>
        <div class='section'>
            <h2>✅ Je assessment is succesvol ontvangen</h2>
            <p>Beste $name,</p>
            <p>Bedankt voor het invullen van de RecruitPro Enterprise Assessment voor $company.</p>
            <p>Ik ga je antwoorden analyseren en binnen <strong>24 uur</strong> persoonlijk contact met je opnemen.</p>
        </div>
        
        <div class='section'>
            <h2>🎯 Wat kun je verwachten?</h2>
            <ul>
                <li>📊 Persoonlijke analyse van je antwoorden</li>
                <li>📈 Benchmarking tegen je sector</li>
                <li>🚀 Concrete verbeteradviezen</li>
                <li>💰 ROI berekening van optimalisaties</li>
                <li>📞 Vrijblijvend adviesgesprek</li>
            </ul>
        </div>
        
        <div class='section'>
            <h2>📞 Direct Contact</h2>
            <p><strong>Wouter Arts</strong><br>
            Recruitment Adviseur<br>
            📧 warts@recruitin.nl<br>
            📱 06-14314593<br>
            🌐 www.recruitin.nl</p>
        </div>
    </div>
</body>
</html>";

mail($email, $user_subject, $user_email_body, $user_headers);

// Log to file for backup
$log_entry = date('Y-m-d H:i:s') . " - Assessment completed: $name ($email) from $company\n";
file_put_contents('assessment_log.txt', $log_entry, FILE_APPEND | LOCK_EX);

// Return success response
if ($mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Assessment successfully submitted',
        'completion_rate' => $completionRate
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>