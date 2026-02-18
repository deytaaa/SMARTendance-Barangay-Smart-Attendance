# generate_qr_cards.py - Generate QR codes for employees
import qrcode
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import os

# Configuration
API_URL = "http://localhost:5000/api"  # Try localhost first, change to 192.168.11.169 if needed

def login():
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={
                "email": "admin@smartendance.com",
                "password": "admin123"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print("✅ Authentication successful")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def get_users(token):
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(f"{API_URL}/users", headers=headers, timeout=15)
        if response.status_code == 200:
            users_data = response.json()
            
            # Handle response format
            if isinstance(users_data, dict) and 'data' in users_data:
                return users_data['data']
            elif isinstance(users_data, list):
                return users_data
            else:
                return []
        else:
            print(f"❌ Failed to get users: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting users: {e}")
        return []

def generate_qr_card(user_id, user_name, output_dir="qr_cards"):
    """Generate a QR code card for an employee"""
    try:
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Create QR code with user ID
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(str(user_id))  # Simple user ID format
        qr.make(fit=True)
        
        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Create card (300x400 pixels)
        card = Image.new('RGB', (300, 400), 'white')
        draw = ImageDraw.Draw(card)
        
        # Try to load a font, fallback to default if not available
        try:
            title_font = ImageFont.truetype("arial.ttf", 16)
            name_font = ImageFont.truetype("arial.ttf", 14)
            id_font = ImageFont.truetype("arial.ttf", 12)
        except:
            title_font = ImageFont.load_default()
            name_font = ImageFont.load_default()
            id_font = ImageFont.load_default()
        
        # Add title
        draw.text((150, 20), "SMARTendance", font=title_font, fill="black", anchor="ma")
        draw.text((150, 40), "Attendance Card", font=name_font, fill="black", anchor="ma")
        
        # Add QR code (centered, 200x200)
        qr_resized = qr_img.resize((200, 200))
        card.paste(qr_resized, (50, 70))
        
        # Add user info
        draw.text((150, 290), user_name, font=name_font, fill="black", anchor="ma")
        draw.text((150, 310), f"ID: {user_id}", font=id_font, fill="gray", anchor="ma")
        
        # Add instructions
        draw.text((150, 340), "Show this QR code", font=id_font, fill="gray", anchor="ma")
        draw.text((150, 355), "to the scanner", font=id_font, fill="gray", anchor="ma")
        
        # Save card
        filename = f"{output_dir}/qr_card_{user_id}_{user_name.replace(' ', '_')}.png"
        card.save(filename)
        print(f"✅ Generated: {filename}")
        
        return filename
        
    except Exception as e:
        print(f"❌ Error generating QR card for {user_name}: {e}")
        return None

def main():
    print("🎯 SMARTendance QR Card Generator")
    print("=" * 40)
    
    # Login
    print("Logging in...")
    token = login()
    if not token:
        return
    
    # Get users
    print("Getting users...")
    users = get_users(token)
    
    if not users:
        print("❌ No users found")
        return
    
    print(f"📊 Found {len(users)} users")
    print("Generating QR cards...")
    
    generated = 0
    for user in users:
        if isinstance(user, dict):
            user_id = user.get('id')
            first_name = user.get('firstName', '')
            last_name = user.get('lastName', '')
            user_name = f"{first_name} {last_name}".strip()
            
            if user_id and user_name:
                if generate_qr_card(user_id, user_name):
                    generated += 1
    
    print(f"\n✅ Generated {generated} QR cards in 'qr_cards' folder")
    print("📱 Users can print these cards or save to their phones")

if __name__ == "__main__":
    main()