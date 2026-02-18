# QR Code Attendance System Setup
# Run these commands to install required libraries

# Install QR code libraries
pip install pyzbar qrcode[pil] pillow

# If pyzbar fails on Windows, install these:
# 1. Download and install Microsoft Visual C++ Redistributable
# 2. Or use this alternative command:
pip install pyzbar-cffi

echo "QR Code libraries installed successfully!"
echo ""
echo "Usage:"
echo "1. Run 'python generate_qr_cards.py' to create QR cards for all employees"
echo "2. Run 'python attendance_qr.py' to start the QR code scanner"
echo ""
echo "QR cards will be saved in 'qr_cards' folder - employees can print them or save to phones"