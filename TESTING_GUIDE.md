# Face Recognition Testing Guide

Test the complete face recognition system on your computer before buying Raspberry Pi hardware!

## Prerequisites

- Windows computer with webcam
- Python 3.8 or higher installed
- Backend server running
- Frontend running

## Installation Steps

### 1. Install Python (if not already installed)

Download Python from [python.org](https://www.python.org/downloads/) and install with "Add to PATH" checked.

Verify installation:
```bash
python --version
```

### 2. Install Required Libraries

Open Command Prompt or PowerShell in the project folder and run:

```bash
pip install opencv-python
pip install face-recognition
pip install requests
pip install numpy
```

**Note:** `face-recognition` installation may take 5-10 minutes as it downloads dlib dependencies.

### 3. Alternative: Use requirements file

Create `requirements.txt` with:
```
opencv-python==4.8.1.78
face-recognition==1.3.0
requests==2.31.0
numpy==1.24.3
```

Then install:
```bash
pip install -r requirements.txt
```

## How to Test

### Step 1: Prepare Test Employees

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Log in to the web dashboard

4. Register at least 1-2 test employees:
   - Go to **Register Employee** page
   - Fill in details (use yourself or classmates)
   - Save employee

5. Generate QR cards:
   - Go to **QR Card Manager** page
   - Click "Generate All Cards" 
   - Download and print QR cards for employees

### Step 2: Run QR Scanner Test

1. Open Command Prompt in the project folder

2. Run the QR scanner:
   ```bash
   python attendance_qr.py
   ```

3. The script will:
   - Load employee data from your database
   - Open your webcam
   - Show a video window for QR scanning

4. Test QR scanning:
   - Hold a printed QR card in front of the webcam
   - If recognized, you'll see employee info displayed
   - First scan = CHECK-IN, second scan = CHECK-OUT
   - Check the dashboard to verify attendance appeared

5. Press **'q'** to quit

## What You'll See

### Console Output:
```
============================================================
SMARTendance QR Code Scanner Loading...
============================================================

Starting QR Scanner...
API connection successful!
Camera ready - hold QR card in front of camera
✅ CHECK-IN recorded: John Doe at 9:15:32 AM
✅ CHECK-OUT recorded: John Doe at 5:30:45 PM

Press 'q' to quit scanner
```

### Video Window:
- **Green overlay** = QR code detected and processing
- Employee name and status displays in console
- Automatic check-in/check-out detection

## Troubleshooting

### "Could not open webcam"
- Check if another app is using the camera (Zoom, Teams, etc.)
- Try changing camera index in code: `cv2.VideoCapture(1)` or `cv2.VideoCapture(2)`

### "No employee faces loaded"
- Make sure you enrolled employees with face photos
- Check backend is running on http://localhost:5000
- Verify in User Management page that employees show enrollment status

### "Failed to record attendance"
- Check backend console for errors
- Verify backend API endpoint: http://localhost:5000/api/attendance
- Check database connection

### Face not recognized
- Ensure good lighting
- Face the camera directly
- Try adjusting `TOLERANCE` in the script:
  - Lower (0.4-0.5) = stricter matching
  - Higher (0.6-0.7) = more lenient matching
  - Default 0.6 is recommended

### Installation errors (face-recognition)
If `pip install face-recognition` fails:

**Windows:**
1. Install Visual Studio Build Tools
2. Or use pre-built wheel: https://github.com/ageitgey/face_recognition/issues

**Alternative:** Use Google Colab to test if local installation is difficult

## Understanding the Results

✅ **If face recognition works:**
- You're ready to proceed with Raspberry Pi purchase
- The same code will run on the Pi
- Just need to adapt for Pi Camera instead of USB webcam

✅ **Test different scenarios:**
- Multiple people in frame
- Different lighting conditions
- Different angles
- Wearing glasses vs not wearing glasses
- Different expressions

✅ **Check accuracy:**
- False positives (wrong person recognized)
- False negatives (correct person not recognized)
- Adjust tolerance if needed

## Next Steps

After successful testing:

1. ✅ Confirm system works end-to-end
2. ✅ Purchase Raspberry Pi hardware (see RASPBERRY_PI_SETUP.md)
3. ✅ Adapt script for Pi Camera module
4. ✅ Set up systemd service for auto-start
5. ✅ Deploy at barangay entrance

## Tips for Best Results

🔸 **Enrollment photos:**
- Good lighting
- Face the camera directly
- Include slight variations (angles, expressions)
- Capture at similar distance as attendance device will be

🔸 **Attendance device placement:**
- Eye level (130-170cm height)
- Good lighting (natural or artificial)
- Plain background preferred
- About 0.5-1 meter from face

🔸 **Performance:**
- Script processes every 3rd frame for speed
- Adjust `frame_count % 3` to `% 2` for faster recognition
- Or to `% 5` for slower computers

## Comparing to Raspberry Pi

| Feature | Test Script (Your PC) | Raspberry Pi |
|---------|----------------------|--------------|
| Face Recognition | ✅ Same algorithm | ✅ Same algorithm |
| Accuracy | ✅ Same | ✅ Same |
| API Integration | ✅ Same | ✅ Same |
| Camera | USB Webcam | Pi Camera Module |
| Auto-start | Manual | ✅ Systemd service |
| Always On | No | ✅ Yes |
| Placement | Desktop | ✅ Entrance mount |

The main difference is the Pi runs 24/7 at the entrance, but the face recognition logic is identical!
