# 📱 QR Code Attendance System Setup Guide
## SMARTendance - Lightweight QR Scanner Solution

---

## ✅ **Why QR Code Instead of Face Recognition?**

| Feature | Face Recognition | QR Code Scanner |
|---------|-----------------|-----------------|
| **Processing Speed** | 2-5 seconds | Instant ⚡ |
| **CPU Usage** | Very High | Minimal |
| **Hardware Requirements** | Powerful laptop | Any basic laptop |
| **Accuracy** | 85-95% | 99.9% |
| **Libraries Required** | TensorFlow, DeepFace | Basic OpenCV only |
| **File Size** | 500+ MB | 50 MB |

---

## 📦 **HARDWARE REQUIREMENTS**

### **Minimum Hardware:**
- ✅ **Any Windows 10/11 laptop** (even old budget laptops work!)
- ✅ **2GB RAM** (4GB recommended)
- ✅ **Any USB webcam** (even $10 basic ones)
- ✅ **WiFi/Ethernet connection**
- ✅ **No dedicated GPU needed**

### **Your Current Setup:**
- ✅ Second laptop ✓
- ✅ USB webcam (index 1) ✓
- ✅ Network connection to 192.168.11.169:5000 ✓
- ✅ Backend server running ✓

**Total additional cost: $0** - You're ready to go! 🎉

---

## 🚀 **STEP-BY-STEP INSTALLATION**

### **Step 1: Install Required Libraries**

**⚠️ IMPORTANT:** Install these on the **laptop where you'll run the QR scanner**, NOT in your backend/frontend folders!

Open **Command Prompt** or **PowerShell** (from any location) and run:

```bash
# Try these commands in order until one works:

# Option 1: Try python -m pip (most reliable on Windows)
python -m pip install pyzbar qrcode[pil] pillow opencv-python requests

# Option 2: Try py -m pip (Windows Python Launcher)  
py -m pip install pyzbar qrcode[pil] pillow opencv-python requests

# Option 3: Try python3 -m pip
python3 -m pip install pyzbar qrcode[pil] pillow opencv-python requests

# Option 4: If pip still not found, install Python first (see troubleshooting below)
```

**If pyzbar installation fails on Windows, try:**
```bash
python -m pip install pyzbar-cffi
```

**Note:** These are Python libraries for the standalone QR scanner application. Your Node.js backend and React frontend don't need these libraries.

**Troubleshooting pip/Python installation:**

**❌ "pip is not recognized" or "python is not recognized":**

1. **Check if Python is installed:**
   ```bash
   python --version
   # or try:
   py --version
   ```

2. **If Python not installed, download from:** https://www.python.org/downloads/
   - ✅ **IMPORTANT:** Check "Add Python to PATH" during installation
   - Choose "Install Now" (recommended)
   - Restart Command Prompt after installation

3. **If Python installed but pip not working:**
   ```bash
   # Use this instead of 'pip':
   python -m pip --version
   
   # Then install with:
   python -m pip install pyzbar qrcode[pil] pillow opencv-python requests
   ```

**Troubleshooting pyzbar installation:**
- Download Microsoft Visual C++ Redistributable if needed
- Restart command prompt and try again

### **Step 2: Download QR Code Scripts**

You should have these files in your project folder:
- ✅ `attendance_qr.py` (main QR scanner)
- ✅ `generate_qr_cards.py` (creates employee QR cards)

### **Step 3: Test Installation**

```bash
python -c "import pyzbar, qrcode, cv2; print('✅ All libraries installed successfully!')"
```

If you see the success message, you're ready to proceed!

---

## 📱 **STEP-BY-STEP USAGE**

### **Phase 1: Generate QR Cards for Employees**

1. **Make sure your backend is running:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see the SMARTendance server startup message.

2. **Generate QR cards for all employees:**
   ```bash
   python generate_qr_cards.py
   ```

3. **Expected output:**
   ```
   🎯 SMARTendance QR Card Generator
   ========================================
   Logging in...
   ✅ Authentication successful
   Getting users...
   📊 Found 2 users
   Generating QR cards...
   ✅ Generated: qr_cards/qr_card_8_Manuel_DaTA.png
   ✅ Generated: qr_cards/qr_card_2_Admin_User.png
   
   ✅ Generated 2 QR cards in 'qr_cards' folder
   📱 Users can print these cards or save to their phones
   ```

4. **Check the generated cards:**
   - Open the `qr_cards/` folder
   - You'll see PNG files for each employee
   - Each card contains a QR code with the user's ID

### **Phase 2: Distribute QR Cards to Employees**

**Option A: Print Physical Cards**
- Print the PNG files from `qr_cards/` folder
- Laminate them for durability
- Give each employee their card

**Option B: Digital Cards (Mobile Phones)**
- Send each employee their QR card image via email/messaging
- Employees save to their phone's photo gallery
- They show the QR code on their phone screen

### **Phase 3: Start the QR Code Scanner**

1. **Connect your USB webcam** to the laptop

2. **Start the QR scanner:**
   ```bash
   python attendance_qr.py
   ```

3. **Expected startup:**
   ```
   🎯 SMARTendance QR Code Attendance Scanner
   ==================================================
   Logging in to backend...
   ✅ Authentication successful
   Loading employee list...
   ✅ Loaded: Manuel DaTA (ID: 8)
   ✅ Loaded: Admin User (ID: 2)
   📊 Total: 2 users loaded
   
   🎯 QR Code Scanner ready!
   📱 Show QR code to camera to check in
   ⌨️  Press 'q' to quit, 'r' to reload users
   ==================================================
   ```

4. **Camera window opens** showing live feed with "Show QR Code to Camera"

---

## 🎯 **DAY-TO-DAY OPERATION**

### **For System Operator:**

1. **Start the system each day:**
   - Power on laptop
   - Connect USB webcam
   - Run: `python attendance_qr.py`
   - Position camera at entrance/attendance area

2. **Monitor attendance:**
   - Watch for successful scans in console
   - Green highlight = successful attendance
   - Blue highlight = user in cooldown (recently scanned)

### **For Employees:**

1. **Approach the scanner**
2. **Show QR code to camera** (physical card or phone screen)
3. **Wait for confirmation:**
   ```
   📱 QR Code scanned: Manuel DaTA (ID: 8)
   ✅ Attendance recorded: Manuel DaTA - ON_TIME at 9:15 AM
   ```
4. **Done!** - attendance is recorded

### **Scanner Responses:**

| Message | Meaning |
|---------|---------|
| `✅ Attendance recorded: [Name] - ON_TIME` | Success - first check-in today |
| `✅ [Name] already checked in today at 8:30 AM (LATE)` | Success - but already checked in |
| `⏳ [Name] in cooldown...` | Wait 3 seconds before scanning again |
| `❌ User [ID] not found in system` | Invalid QR code or user not in database |

---

## ⌨️ **KEYBOARD CONTROLS**

While the scanner is running:

- **'q'** - Quit the scanner
- **'r'** - Reload user list (after adding new employees)

---

## 🛠️ **TROUBLESHOOTING**

### **QR Scanner Issues:**

**❌ "Cannot open webcam"**
```bash
# Try different camera index
# Edit attendance_qr.py, change line:
WEBCAM_INDEX = 0  # Try 0 instead of 1
```

**❌ "No module named 'pyzbar'"**
```bash
# Reinstall the library
pip uninstall pyzbar
pip install pyzbar
```

**❌ "QR Code not detected"**
- Ensure good lighting
- Hold QR code steady and flat
- Try different distance (30cm - 1 meter works best)
- Make sure QR code is not blurry or damaged

### **Backend Connection Issues:**

**❌ "Network connection error"**
- **First, check if backend is running:** `npm run dev` in backend folder
- **Test backend connection:**
  - Local: `http://localhost:5000/health` 
  - Network: `http://192.168.11.169:5000/health`
- **Update API_URL in scripts if needed:**
  - For same laptop: Use `http://localhost:5000/api`
  - For different laptop: Use `http://192.168.11.169:5000/api`
- Check WiFi connection
- Restart backend server

**❌ "Authentication failed"**
- Check credentials in `attendance_qr.py` lines 12-13:
  ```python
  "email": "admin@smartendance.com",
  "password": "admin123"
  ```
- Update with correct admin credentials

### **QR Card Generation Issues:**

**❌ "No users found"**
- Check backend is running
- Verify admin credentials
- Check user database has employees enrolled

**❌ "Font loading error"**
- QR cards will still generate with default fonts
- Install Arial font or ignore the warning

---

## 📊 **PERFORMANCE EXPECTATIONS**

### **Scanning Speed:**
- **QR Detection:** Instant (30-60 FPS)
- **Attendance Recording:** 1-2 seconds (backend dependent)
- **Total Time:** 2-3 seconds per scan

### **System Resource Usage:**
- **CPU:** 5-10% (vs 70-90% for face recognition)
- **RAM:** 200-300 MB (vs 2-4 GB for face recognition)
- **Startup Time:** 2-3 seconds (vs 30-60 seconds for face recognition)

---

## 🔧 **CUSTOMIZATION OPTIONS**

### **Change QR Code Format:**

Edit `generate_qr_cards.py` line ~117:
```python
# Simple ID format (current)
qr.add_data(str(user_id))

# JSON format (alternative)
qr.add_data(f'{{"id": {user_id}, "name": "{user_name}"}}')

# URL format (alternative) 
qr.add_data(f"smartendance://user/{user_id}")
```

### **Adjust Scan Cooldown:**

Edit `attendance_qr.py` line ~142:
```python
SCAN_COOLDOWN = 3  # Change to 5 for 5-second cooldown
```

### **Change Camera Index:**

Edit `attendance_qr.py` line ~9:
```python
WEBCAM_INDEX = 0  # Use 0 for built-in camera, 1 for USB webcam
```

---

## 📋 **DAILY WORKFLOW**

### **Morning Setup (5 minutes):**
1. Power on attendance laptop
2. Connect USB webcam
3. Start backend server: `npm run dev`
4. Start QR scanner: `python attendance_qr.py`
5. Position camera at entrance

### **During the Day:**
- Employees scan their QR codes when arriving
- Monitor console for successful scans
- System automatically records attendance to database

### **End of Day:**
- Press 'q' to quit scanner
- Check attendance reports via web dashboard
- Power down equipment

---

## 🎯 **ADVANTAGES OF QR CODE SYSTEM**

### **For IT/Administration:**
- ✅ **Ultra-lightweight** - runs on any laptop
- ✅ **Instant setup** - no complex AI model loading
- ✅ **99.9% reliable** - QR codes rarely fail to scan
- ✅ **Low maintenance** - minimal hardware requirements
- ✅ **Fast deployment** - ready in minutes

### **For Employees:**
- ✅ **Instant check-in** - no waiting for face detection
- ✅ **Works with masks/glasses** - no face visibility issues
- ✅ **Mobile-friendly** - QR code on phone works perfectly
- ✅ **Backup option** - physical cards if phone battery dies
- ✅ **Privacy-friendly** - no face photos stored

### **For Management:**
- ✅ **Same backend integration** - existing reports and data
- ✅ **Cost-effective** - minimal hardware investment
- ✅ **Scalable** - easy to add new employees (just generate QR card)
- ✅ **Reliable** - no false rejections or misidentifications

---

## 📞 **SUPPORT**

### **Common Issues:**
- Camera not working → Try different WEBCAM_INDEX
- QR not scanning → Check lighting and QR code quality  
- Backend errors → Restart backend server
- Slow performance → Check network connection

### **Adding New Employees:**
1. Add employee via web dashboard
2. Run `python generate_qr_cards.py` to create their QR card
3. Print/send the new QR card
4. Press 'r' in scanner to reload user list

---

**Last Updated:** February 18, 2026  
**System Type:** Lightweight QR Code Scanner  
**Hardware:** Any Basic Laptop + USB Webcam

---

## 🎉 **You're Ready!**

Your QR code attendance system is now configured and ready for deployment. This lightweight solution will provide instant, reliable attendance tracking without the hardware demands of face recognition systems.

**Next Steps:**
1. Generate QR cards: `python generate_qr_cards.py`
2. Start scanner: `python attendance_qr.py`  
3. Test with generated QR cards
4. Deploy at your attendance location

**Happy scanning!** 📱✅