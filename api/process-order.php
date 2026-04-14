<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
define('OWNER_EMAIL', 'albarakshopp@gmail.com');
define('OWNER_WHATSAPP', '221771335911');
define('TELEGRAM_BOT_TOKEN', 'YOUR_TELEGRAM_BOT_TOKEN');
define('TELEGRAM_CHAT_ID', 'YOUR_TELEGRAM_CHAT_ID');
define('ENABLE_EMAIL_NOTIFICATIONS', true);
define('ENABLE_WHATSAPP_NOTIFICATIONS', true);

// S'assurer que les dossiers existent
$dataDir = __DIR__ . '/../data';
$ordersDir = $dataDir . '/orders';
$queueDir = $dataDir . '/whatsapp_queue';
$archiveDir = $dataDir . '/whatsapp_archive';

foreach ([$dataDir, $ordersDir, $queueDir, $archiveDir] as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Recevoir les données
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données invalides']);
    exit;
}

// Extraire les données
$client = $data['client'] ?? [];
$cart = $data['cart'] ?? [];
$total = $data['total'] ?? 0;
$paymentMethod = $data['paymentMethod'] ?? '';
$timestamp = date('Y-m-d H:i:s');
$orderId = 'CMD-' . date('YmdHis') . '-' . rand(1000, 9999);

// Validation basique
if (empty($client['email']) || empty($client['tel'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email ou téléphone manquant']);
    exit;
}

// Préparer le message
$messageText = formatOrderMessage($orderId, $client, $cart, $total, $paymentMethod, $timestamp);

$results = [
    'email_sent' => false,
    'telegram_sent' => false,
    'database_saved' => false,
    'whatsapp_queued' => false
];

// 1. Envoyer l'email au propriétaire et au client
if (ENABLE_EMAIL_NOTIFICATIONS) {
    $results['email_sent'] = sendEmail(OWNER_EMAIL, $client['email'], $messageText, $orderId);
}

// 2. Envoyer à Telegram (optionnel)
$results['telegram_sent'] = sendTelegram($messageText, $orderId);

// 3. Sauvegarder en base de données (fichier JSON pour simplicité)
$results['database_saved'] = saveOrderToDatabase($ordersDir, $orderId, $client, $cart, $total, $paymentMethod, $timestamp);

// 4. Déclencher l'envoi WhatsApp (via service externe ou API)
if (ENABLE_WHATSAPP_NOTIFICATIONS) {
    $results['whatsapp_queued'] = queueWhatsAppMessage($queueDir, $client['tel'], $client['prenom'], $client['nom'], $orderId);
}

// Répondre
http_response_code(200);
echo json_encode([
    'success' => true,
    'orderId' => $orderId,
    'message' => 'Commande reçue avec succès!',
    'details' => $results
]);

// ============================================================
// FONCTIONS
// ============================================================

function formatOrderMessage($orderId, $client, $cart, $total, $paymentMethod, $timestamp) {
    $message = "📦 NOUVELLE COMMANDE\n";
    $message .= "==================\n\n";
    $message .= "🔖 N° Commande: $orderId\n";
    $message .= "📅 Date: $timestamp\n\n";
    
    $message .= "👤 CLIENT\n";
    $message .= "Prénom: {$client['prenom']}\n";
    $message .= "Nom: {$client['nom']}\n";
    $message .= "Email: {$client['email']}\n";
    $message .= "Téléphone: {$client['tel']}\n";
    $message .= "Ville: {$client['ville']}\n";
    $message .= "Adresse: {$client['adresse']}\n\n";
    
    $message .= "🛍️ ARTICLES COMMANDÉS\n";
    $message .= "--------------------\n";
    
    if (is_array($cart)) {
        foreach ($cart as $item) {
            $message .= "• {$item['name']} (Ref: {$item['ref']})\n";
            $message .= "  Quantité: {$item['qty']}\n";
            $message .= "  Prix: " . number_format($item['price'], 0, ',', ' ') . " FCFA\n";
            $message .= "  Sous-total: " . number_format($item['price'] * $item['qty'], 0, ',', ' ') . " FCFA\n\n";
        }
    }
    
    $message .= "💳 PAIEMENT\n";
    $message .= "Méthode: $paymentMethod\n";
    $message .= "Total: " . number_format($total, 0, ',', ' ') . " FCFA\n\n";
    
    $message .= "📌 À faire:\n";
    $message .= "1. Confirmer la commande au client via WhatsApp\n";
    $message .= "2. Préparer les tissus\n";
    $message .= "3. Organiser la livraison\n";
    
    return $message;
}

function sendEmail($toOwner, $toClient, $message, $orderId) {
    // Email au propriétaire
    $ownerSubject = "Nouvelle commande reçue - $orderId";
    $ownerBody = $message . "\n\nLes détails de cette commande ont également été sauvegardés pour vos dossiers.";
    
    // Headers pour email au propriétaire
    $ownerHeaders = "From: orders@jour-j-fabric.sn\r\n";
    $ownerHeaders .= "Reply-To: $toClient\r\n";
    $ownerHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $ownerHeaders .= "Content-Transfer-Encoding: 8bit\r\n";
    
    $ownerEmailSent = @mail($toOwner, $ownerSubject, $ownerBody, $ownerHeaders);
    
    // Email de confirmation au client
    $clientSubject = "Commande confirmée - $orderId";
    $clientBody = "Bonjour,\n\n";
    $clientBody .= "Merci pour votre commande Jour-J Fabric! 🙏\n\n";
    $clientBody .= "Votre commande a bien été reçue et traitée avec succès.\n";
    $clientBody .= "Numéro de commande: $orderId\n\n";
    $clientBody .= "Un responsable Jour-J Fabric vous contactera très bientôt sur WhatsApp pour confirmer les détails et les modalités de livraison.\n\n";
    $clientBody .= "Cordialement,\n";
    $clientBody .= "Jour-J Fabric\n";
    $clientBody .= "+221 77 133 59 11\n";
    
    $clientHeaders = "From: orders@jour-j-fabric.sn\r\n";
    $clientHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $clientHeaders .= "Content-Transfer-Encoding: 8bit\r\n";
    
    $clientEmailSent = @mail($toClient, $clientSubject, $clientBody, $clientHeaders);
    
    // Log pour déboggage
    error_log("📧 Emails - Owner: " . ($ownerEmailSent ? 'sent' : 'failed') . ", Client: " . ($clientEmailSent ? 'sent' : 'failed'));
    
    return $ownerEmailSent && $clientEmailSent;
}

function sendTelegram($message, $orderId) {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN' || empty(TELEGRAM_BOT_TOKEN)) {
        return false; // Pas configuré
    }
    
    $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
    
    $data = [
        'chat_id' => TELEGRAM_CHAT_ID,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    
    $options = array(
        'http' => array(
            'method' => 'POST',
            'header' => 'Content-type: application/json',
            'content' => json_encode($data),
            'timeout' => 5
        )
    );
    
    $context = stream_context_create($options);
    $response = @file_get_contents($url, false, $context);
    
    return $response !== false;
}

function saveOrderToDatabase($dbDir, $orderId, $client, $cart, $total, $paymentMethod, $timestamp) {
    $orderData = [
        'orderId' => $orderId,
        'timestamp' => $timestamp,
        'client' => $client,
        'cart' => $cart,
        'total' => $total,
        'paymentMethod' => $paymentMethod,
        'status' => 'pending',
        'whatsappSent' => false,
        'notes' => 'Commande en attente de confirmation WhatsApp'
    ];
    
    $filePath = $dbDir . '/' . $orderId . '.json';
    $saved = @file_put_contents($filePath, json_encode($orderData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    return $saved !== false;
}

function queueWhatsAppMessage($queueDir, $phone, $prenom, $nom, $orderId) {
    // Formater le numéro (ajouter code pays si absent)
    $phone = formatPhoneNumber($phone);
    
    $message = "Bonjour $prenom,\n\n";
    $message .= "Merci pour votre commande Jour-J Fabric! 🙏\n";
    $message .= "Numéro: $orderId\n\n";
    $message .= "Un responsable vous contactera dans quelques instants pour confirmer les détails de votre commande. 😊\n\n";
    $message .= "Jour-J Fabric\n";
    $message .= "+221 77 133 59 11";
    
    $queueData = [
        'phone' => $phone,
        'message' => $message,
        'orderId' => $orderId,
        'createdAt' => date('Y-m-d H:i:s'),
        'sent' => false,
        'attempts' => 0,
        'lastError' => null
    ];
    
    $filePath = $queueDir . '/' . time() . '_' . rand(1000, 9999) . '.json';
    $queued = @file_put_contents($filePath, json_encode($queueData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    return $queued !== false;
}

function formatPhoneNumber($phone) {
    // Nettoyer le numéro
    $phone = trim($phone);
    $phone = str_replace([' ', '-', '(', ')'], '', $phone);
    
    // Ajouter le code pays si absent
    if (!str_starts_with($phone, '+')) {
        if (!str_starts_with($phone, '221')) {
            $phone = '221' . ltrim($phone, '0');
        }
        $phone = '+' . $phone;
    }
    
    return $phone;
}
?>
