# 🚀 Guide d'Automatisation des Commandes

## Architecture

```
Client (Frontend)
    ↓ (POST /api/process-order.php)
Serveur PHP
    ├→ 📧 Email (propriétaire + client)
    ├→ 💬 Telegram (notification)
    ├→ 💾 Base de données (fichier JSON)
    └→ 📱 Queue WhatsApp
         ↓
    Script Python (cron)
         ↓
    API Twilio WhatsApp
         ↓
    Client (Message de confirmation)
```

---

## 🔧 Configuration

### 1. PHP - Configuration Email

#### Utiliser Gmail (recommandé)

Modifiez `/api/process-order.php` et remplacez la fonction `sendEmail()`:

```php
function sendEmail($toOwner, $toClient, $message, $orderId) {
    // Installer PHPMailer
    // composer require phpmailer/phpmailer

    require 'vendor/autoload.php';
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    $mail = new PHPMailer(true);

    try {
        // Configuration SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'votre_email@gmail.com';
        $mail->Password = 'votre_mot_de_passe_app'; // Mot de passe application (pas du compte)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Email au propriétaire
        $mail->setFrom('orders@jour-j-fabric.sn', 'Jour-J Fabric');
        $mail->addAddress(OWNER_EMAIL);
        $mail->Subject = "Nouvelle commande reçue - " . $orderId;
        $mail->Body = $message;
        $mail->send();

        // Email de confirmation au client
        $mail->clearAddresses();
        $mail->addAddress($toClient);
        $mail->Subject = "Commande confirmée - " . $orderId;
        $mail->Body = "Votre commande a bien été reçue. Un responsable vous contactera sur WhatsApp.";
        $mail->send();

        return true;
    } catch (Exception $e) {
        error_log("Erreur Mail: " . $mail->ErrorInfo);
        return false;
    }
}
```

**Obtenir le mot de passe application Gmail:**

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Authentifiez-vous
3. Sélectionnez "Mail" et "Windows Computer"
4. Copiez le mot de passe généré

#### Alternative: SendGrid (service cloud)

```bash
# Installer
composer require sendgrid/sendgrid-php
```

```php
require 'vendor/autoload.php';
$email = new \SendGrid\Mail\Mail();
$email->setFrom("orders@jour-j-fabric.sn", "Jour-J Fabric");
$email->addTo(OWNER_EMAIL);
$email->setSubject("Nouvelle commande - " . $orderId);
$email->addContent("text/plain", $message);

$sendgrid = new \SendGrid(getenv('SENDGRID_API_KEY'));
try {
    $response = $sendgrid->send($email);
    return $response->statusCode() === 202;
} catch (Exception $e) {
    error_log('Error: '. $e->getMessage());
    return false;
}
```

---

### 2. Telegram - Notifications (Optionnel)

Configurez les notifications Telegram pour recevoir les commandes en temps réel.

**Étapes:**

1. Créer un bot Telegram:
   - Ouvrez Telegram
   - Cherchez `@BotFather`
   - Tapez `/newbot`
   - Suivez les instructions → vous recevrez un TOKEN

2. Obtenir votre Chat ID:
   - Cherchez `@userinfobot`
   - Tapez `/start`
   - Vous verrez votre ID

3. Configurez dans `/api/process-order.php`:

```php
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');
define('TELEGRAM_CHAT_ID', 'YOUR_CHAT_ID_HERE');
```

---

### 3. WhatsApp - Automatisation via Twilio

#### Inscription Twilio

1. Créez un compte: [www.twilio.com](https://www.twilio.com)
2. Vérifiez votre numéro
3. Accédez au **Messaging → Try it out → WhatsApp Sandbox**
4. Scannez le QR code ou envoyez `join YOUR_SANDBOX_KEYWORD`

#### Configuration

1. Installez Twilio:

```bash
pip install twilio
```

2. Configurez `/scripts/whatsapp-queue-processor.py`:

```python
TWILIO_ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
TWILIO_AUTH_TOKEN = 'your_auth_token'
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155552671'
```

Trouvez ces valeurs sur votre dashboard Twilio.

#### Lancer le script

```bash
# Test une fois
python scripts/whatsapp-queue-processor.py

# Lancer tous les 5 minutes (Linux/Mac)
*/5 * * * * cd /chemin/du/projet && python scripts/whatsapp-queue-processor.py >> logs/whatsapp.log 2>&1
```

Pour Windows, utilisez le **Task Scheduler**.

---

### 4. Base de Données - Sauvegarde des Commandes

Les commandes sont automatiquement sauvegardées en JSON dans:

```
/data/orders/
  ├ CMD-20260413120530-4521.json
  ├ CMD-20260413121045-8934.json
  └ ...
```

Chaque fichier contient:

```json
{
  "orderId": "CMD-20260413120530-4521",
  "timestamp": "2026-04-13 12:05:30",
  "client": {
    "prenom": "Jean",
    "nom": "Dupont",
    "email": "jean@example.com",
    "tel": "221771234567",
    "ville": "Dakar",
    "adresse": "Plateau, rue..."
  },
  "cart": [...],
  "total": 450000,
  "paymentMethod": "Orange Money",
  "status": "pending",
  "whatsappSent": false
}
```

---

## 📋 Checklist de Configuration

### Pour le Email:

- [ ] Configurer SMTP (Gmail ou SendGrid)
  - [ ] Générateur le mot de passe application
  - [ ] Test d'envoi manuel

### Pour Telegram:

- [ ] Créer bot [@BotFather](https://t.me/botfather)
- [ ] Obtenir Chat ID [@userinfobot](https://t.me/userinfobot)
- [ ] Mettre à jour les constantes PHP

### Pour WhatsApp:

- [ ] Créer compte Twilio
- [ ] Activer WhatsApp Sandbox
- [ ] Installer `twilio` Python: `pip install twilio`
- [ ] Configurer le script Python
- [ ] Mettre en place le cron/scheduler
- [ ] Test d'envoi

### Déploiement:

- [ ] Créer dossiers: `/data/orders`, `/data/whatsapp_queue`, `/data/whatsapp_archive`
- [ ] Changer permissions: `chmod 755 /data`
- [ ] Tester le formulaire complet
- [ ] Vérifier les logs

---

## 💻 Commandes Utiles

```bash
# Tester le script Python
python scripts/whatsapp-queue-processor.py

# Vérifier les logs
tail -f logs/whatsapp.log

# Afficher les commandes en attente
ls -la data/orders/

# Afficher les messages WhatsApp en queue
ls -la data/whatsapp_queue/

# Afficher les messages envoyés
ls -la data/whatsapp_archive/
```

---

## 🔒 Sécurité

1. **Ne pas commiter les tokens:**

   ```bash
   echo "api/config.local.php" >> .gitignore
   ```

2. **Utiliser des variables d'environnement:**

   ```php
   define('TELEGRAM_BOT_TOKEN', getenv('TELEGRAM_BOT_TOKEN'));
   ```

3. **HTTPS obligatoire** pour la production

---

## 📊 Flux Complet

1. ✅ Client rempllit le formulaire
2. ✅ Clique "Confirmer commande"
3. ✅ JavaScript envoie les données au `/api/process-order.php`
4. ✅ PHP reçoit et traite:
   - 📧 Envoie email propriétaire + confirmation client
   - 💬 Envoie notification Telegram
   - 💾 Sauvegarde en JSON
   - 📱 Met en queue le message WhatsApp
5. ✅ Script Python (cron):
   - Traite la queue toutes les 5 minutes
   - Envoie via API Twilio
   - Archive les messages envoyés
6. ✅ Client reçoit le message WhatsApp

---

## 🐛 Troubleshooting

**Email ne s'envoie pas:**

- Vérifier les logs PHP
- Tester SMTP manuellement
- Vérifier le pare-feu

**WhatsApp ne reçoit pas:**

- Vérifier que Twilio est configuré
- Vérifier le cron s'exécute: `crontab -l`
- Lancer le script manuellement pour tester

**Commandes manquantes:**

- Vérifier `/data/orders/` existe
- Vérifier les permissions d'écriture

---

## 📞 Support

Pour plus d'aid:

- Documentation Twilio: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Documentation PHPMailer: [github.com/PHPMailer/PHPMailer](https://github.com/PHPMailer/PHPMailer)
- Documentation Telegram Bot: [core.telegram.org/bots](https://core.telegram.org/bots)
