#!/usr/bin/env python3
"""
Script d'automatisation WhatsApp
Envoie les messages en attente via l'API Twilio WhatsApp
À exécuter toutes les minutes via cron ou un scheduler
"""

import json
import os
import glob
from datetime import datetime
from pathlib import Path

# Configuration Twilio (à remplir)
TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID'
TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN'
TWILIO_WHATSAPP_NUMBER = 'whatsapp:+YOUR_TWILIO_NUMBER'
MAX_RETRY = 3

try:
    from twilio.rest import Client
except ImportError:
    print("⚠️ Twilio non installé. Installez avec: pip install twilio")
    exit(1)

def send_whatsapp_message(to_number, message, order_id):
    """Envoyer un message WhatsApp via Twilio"""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        message_obj = client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            body=message,
            to=f'whatsapp:{to_number}'
        )
        
        print(f"✅ Message envoyé à {to_number} | SID: {message_obj.sid}")
        return True, message_obj.sid
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi à {to_number}: {str(e)}")
        return False, str(e)

def process_queue():
    """Traiter la queue des messages WhatsApp"""
    queue_dir = Path(__file__).parent.parent / 'data' / 'whatsapp_queue'
    
    if not queue_dir.exists():
        print("📁 Aucun dossier de queue trouvé")
        return
    
    # Trouver tous les fichiers JSON
    queue_files = sorted(glob.glob(str(queue_dir / '*.json')))
    
    if not queue_files:
        print("✅ Pas de messages en attente")
        return
    
    print(f"📬 {len(queue_files)} message(s) en attente...")
    
    for file_path in queue_files:
        try:
            # Charger les données
            with open(file_path, 'r', encoding='utf-8') as f:
                queue_data = json.load(f)
            
            # Vérifier si déjà envoyé
            if queue_data['sent']:
                print(f"⏭️  Ignoré (déjà envoyé): {queue_data['orderId']}")
                continue
            
            # Vérifier le nombre de tentatives
            if queue_data['attempts'] >= MAX_RETRY:
                print(f"⚠️  Abandon après {MAX_RETRY} tentatives: {queue_data['orderId']}")
                os.remove(file_path)
                continue
            
            # Envoyer le message
            success, response = send_whatsapp_message(
                queue_data['phone'],
                queue_data['message'],
                queue_data['orderId']
            )
            
            # Mettre à jour les données
            if success:
                queue_data['sent'] = True
                queue_data['sentAt'] = datetime.now().isoformat()
                queue_data['twilio_sid'] = response
                
                # Sauvegarder et supprimer
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(queue_data, f, ensure_ascii=False, indent=2)
                
                # Archiver
                archive_dir = queue_dir.parent / 'whatsapp_archive'
                archive_dir.mkdir(exist_ok=True)
                archive_path = archive_dir / os.path.basename(file_path)
                os.rename(file_path, archive_path)
                
            else:
                # Incrémenter les tentatives
                queue_data['attempts'] += 1
                queue_data['lastError'] = response
                queue_data['lastAttempt'] = datetime.now().isoformat()
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(queue_data, f, ensure_ascii=False, indent=2)
        
        except Exception as e:
            print(f"❌ Erreur traitement {file_path}: {str(e)}")
            continue
    
    print("✅ Traitement de la queue terminé")

if __name__ == '__main__':
    # Vérifier la configuration
    if TWILIO_ACCOUNT_SID == 'YOUR_TWILIO_ACCOUNT_SID':
        print("⚠️ Configuration Twilio non complète!")
        print("1. Créez un compte Twilio (https://www.twilio.com)")
        print("2. Activez WhatsApp Sandbox")
        print("3. Remplissez les variables en haut du script")
        exit(1)
    
    print(f"⏱️ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Traitement de la queue WhatsApp...")
    process_queue()
