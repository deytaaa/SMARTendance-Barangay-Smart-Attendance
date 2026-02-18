# attendance_qr.py - Lightweight QR Code Attendance Scanner
import cv2
import requests
import time
from datetime import datetime
from pyzbar import pyzbar
import json
import numpy as np

# Configuration
API_URL = "http://localhost:5000/api"  # Update with your backend URL
WEBCAM_INDEX = 1  # Usually 1 for physical USB webcam

# Global variable to store auth token
auth_token = None

# Login function
def login():
    global auth_token
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
            auth_token = data.get('token')
            print("✅ Authentication successful")
            return True
        else:
            print(f"❌ Login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

# Load users from backend for validation
def load_users():
    global auth_token
    try:
        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
            
        response = requests.get(f"{API_URL}/users", headers=headers, timeout=15)
        if response.status_code == 200:
            users_data = response.json()
            
            # Handle different response formats
            if isinstance(users_data, dict) and 'data' in users_data:
                users = users_data['data']
            elif isinstance(users_data, list):
                users = users_data
            else:
                return {}
                
            # Create user lookup dictionary
            user_lookup = {}
            for user in users:
                if isinstance(user, dict):
                    user_id = user.get('id')
                    user_name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
                    user_lookup[str(user_id)] = user_name
                    print(f"✅ Loaded: {user_name} (ID: {user_id})")
                    
            print(f"📊 Total: {len(user_lookup)} users loaded")
            return user_lookup
        else:
            print(f"❌ Failed to load users: {response.status_code}")
            return {}
    except Exception as e:
        print(f"❌ Error loading users: {e}")
        return {}

# Record attendance (automatically detects check-in vs check-out)
def record_attendance(employee_id):
    global auth_token
    try:
        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        # Use today's attendance API and filter for this user
        print(f"🔍 Checking today's attendance for User {employee_id}...")
        
        today_response = requests.get(
            f"{API_URL}/attendance/today",
            headers=headers,
            timeout=5
        )
        
        has_checked_in = False
        has_checked_out = False
        
        if today_response.status_code == 200:
            today_data = today_response.json()
            all_attendance = today_data.get('data', [])
            
            print(f"🔍 Today's total records: {len(all_attendance)}")
            
            # Find this user's record in today's attendance
            user_record = None
            for record in all_attendance:
                if record.get('userId') == int(employee_id):
                    user_record = record
                    break
            
            if user_record:
                has_checked_in = user_record.get('checkInTime') is not None
                has_checked_out = user_record.get('checkOutTime') is not None
                
                print(f"🔍 Found user record - CheckIn: {has_checked_in}, CheckOut: {has_checked_out}")
                print(f"🔍 CheckInTime: {user_record.get('checkInTime')}")
                print(f"🔍 CheckOutTime: {user_record.get('checkOutTime')}")
            else:
                print(f"🔍 No record found for User {employee_id} today")
        else:
            print(f"🔍 API Error: {today_response.status_code} - {today_response.text}")
        
        # Determine action based on current status
        if not has_checked_in:
            # First scan of day = CHECK-IN
            endpoint = "check-in"
            action_name = "Check-in"
            print(f"🔵 Processing CHECK-IN for User {employee_id}...")
        elif has_checked_in and not has_checked_out:
            # Already checked in but not out = CHECK-OUT  
            endpoint = "check-out"
            action_name = "Check-out"
            print(f"🟡 Processing CHECK-OUT for User {employee_id}...")
        else:
            # Already completed both
            print(f"✅ User {employee_id} already completed attendance for today")
            return True
        
        # Make the appropriate API call
        response = requests.post(
            f"{API_URL}/attendance/{endpoint}",
            json={
                "userId": int(employee_id),
                "timestamp": datetime.now().isoformat()
            },
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            user_name = data.get('data', {}).get('user', {}).get('name', f'User {employee_id}')
            time_str = data.get('data', {}).get('time', 'now')
            
            if endpoint == "check-in":
                status = data.get('data', {}).get('status', 'ON_TIME')
                print(f"✅ CHECK-IN recorded: {user_name} - {status} at {time_str}")
            else:
                print(f"✅ CHECK-OUT recorded: {user_name} at {time_str}")
            
            return True
            
        elif response.status_code == 400:
            try:
                error_data = response.json()
                error_msg = error_data.get('message', 'Unknown error')
                print(f"⚠️  {action_name} info: {error_msg}")
                return True  # Still successful, just informational
            except:
                print(f"❌ {action_name} error: {response.text}")
                return False
                
        elif response.status_code == 404:
            print(f"❌ User {employee_id} not found in system")
            return False
        else:
            print(f"❌ Backend error ({response.status_code}): {response.text[:100]}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Network connection error: Backend server may be down")
        return False
    except requests.exceptions.Timeout as e:
        print(f"❌ Request timeout: Backend server is slow")
        return False
    except Exception as e:
        print(f"❌ Unexpected error recording attendance: {e}")
        return False

# Decode QR code data
def decode_qr_data(qr_data):
    """
    QR code can contain:
    - Simple user ID: "123"
    - JSON: {"id": 123, "name": "John Doe"}
    - URL format: "smartendance://user/123"
    """
    try:
        # Try JSON format first
        if qr_data.startswith('{'):
            data = json.loads(qr_data)
            return str(data.get('id', data.get('userId', '')))
        
        # Try URL format
        if 'smartendance://' in qr_data:
            # Extract ID from URL like "smartendance://user/123"
            parts = qr_data.split('/')
            return parts[-1] if parts[-1].isdigit() else None
        
        # Try simple number
        if qr_data.isdigit():
            return qr_data
        
        return None
    except:
        return None

# Main loop
def main():
    print("🎯 SMARTendance QR Code Attendance Scanner")
    print("=" * 50)
    
    # Login first
    print("Logging in to backend...")
    if not login():
        print("❌ Failed to authenticate. Please check your credentials.")
        return
    
    print("Loading employee list...")
    user_lookup = load_users()
    
    cap = cv2.VideoCapture(WEBCAM_INDEX)
    if not cap.isOpened():
        print("❌ Error: Cannot open webcam")
        return
    
    print("\n🎯 QR Attendance Scanner ready!")
    print("📱 Show QR code to camera for attendance")
    print("   • First scan of day = CHECK-IN")
    print("   • Second scan of day = CHECK-OUT") 
    print("⌨️  Press 'q' to quit, 'r' to reload users")
    print("=" * 50)
    
    last_scan_time = {}
    SCAN_COOLDOWN = 3  # 3 seconds between same QR scans
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error reading frame")
            break
            
        # Detect QR codes
        qr_codes = pyzbar.decode(frame)
        
        if qr_codes:
            for qr_code in qr_codes:
                # Get QR code data
                qr_data = qr_code.data.decode('utf-8')
                
                # Decode user ID from QR data
                user_id = decode_qr_data(qr_data)
                
                if user_id:
                    current_time = time.time()
                    
                    # Check cooldown to prevent duplicate scans
                    if user_id not in last_scan_time or \
                       (current_time - last_scan_time[user_id]) > SCAN_COOLDOWN:
                        
                        # Get user name if available
                        user_name = user_lookup.get(user_id, f"User {user_id}")
                        
                        print(f"\n📱 QR Code scanned: {user_name} (ID: {user_id})")
                        
                        # Record attendance
                        try:
                            if record_attendance(user_id):
                                last_scan_time[user_id] = current_time
                                # Draw green rectangle around QR code
                                points = qr_code.polygon
                                if len(points) == 4:
                                    pts = np.array([[point.x, point.y] for point in points], np.int32)
                                    cv2.fillPoly(frame, [pts], (0, 255, 0, 50))
                            else:
                                last_scan_time[user_id] = current_time
                        except Exception as e:
                            print(f"⚠️  Attendance failed: {e}")
                            last_scan_time[user_id] = current_time
                    else:
                        # Draw blue rectangle for cooldown
                        points = qr_code.polygon
                        if len(points) == 4:
                            pts = np.array([[point.x, point.y] for point in points], np.int32)
                            cv2.fillPoly(frame, [pts], (255, 0, 0, 50))
                        
                        user_name = user_lookup.get(user_id, f"User {user_id}")
                        print(f"⏳ {user_name} in cooldown...")
                
                # Draw QR code boundary
                points = qr_code.polygon
                if len(points) == 4:
                    pts = np.array([[point.x, point.y] for point in points], np.int32)
                    cv2.polylines(frame, [pts], True, (255, 255, 0), 2)
                    
                    # Add text label
                    x = min([point.x for point in points])
                    y = min([point.y for point in points]) - 10
                    cv2.putText(frame, f"QR: {user_id or 'Invalid'}", (x, y),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
        else:
            # Show instruction when no QR code detected
            cv2.putText(frame, "Show QR Code for Attendance", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        
        # Show frame
        cv2.imshow('SMARTendance - QR Code Scanner', frame)
        
        # Handle keyboard input
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("\n👋 Shutting down QR scanner...")
            break
        elif key == ord('r'):
            print("\n🔄 Reloading users...")
            if not auth_token:
                if not login():
                    print("❌ Re-authentication failed!")
                    continue
            user_lookup = load_users()
    
    cap.release()
    cv2.destroyAllWindows()
    print("✅ QR Scanner stopped.")

if __name__ == "__main__":
    main()