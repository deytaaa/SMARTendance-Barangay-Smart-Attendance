const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const prisma = require('../config/database');

// @desc    Generate QR cards for all employees
// @route   POST /api/qr/generate
// @access  Private/Admin/Staff
exports.generateQRCards = async (req, res, next) => {
  try {
    console.log('QR Generation: Starting...');
    
    // Get all active users (excluding admins)
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { not: 'ADMIN' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        department: { select: { name: true } }
      }
    });

    console.log(`QR Generation: Found ${users.length} users`);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active employees found'
      });
    }

    const qrCardsDir = path.join(process.cwd(), '..', 'qr_cards');
    console.log('QR Generation: Cards directory:', qrCardsDir);
    
    // Create qr_cards directory if it doesn't exist
    if (!fs.existsSync(qrCardsDir)) {
      console.log('QR Generation: Creating directory...');
      fs.mkdirSync(qrCardsDir, { recursive: true });
    }

    const generatedCards = [];

    for (const user of users) {
      try {
        // Create QR data
        const qrData = JSON.stringify({
          employee_id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          department: user.department?.name || 'N/A'
        });

        // Generate QR code
        const qrCodeDataURL = await qrcode.toDataURL(qrData, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 200
        });

        // Create canvas for ID card
        const canvas = createCanvas(400, 250);
        const ctx = canvas.getContext('2d');

        // Card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 250);
        
        // Border
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 5, 390, 240);

        // Header
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(10, 10, 380, 40);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BARANGAY EMPLOYEE ID', 200, 35);

        // Employee info
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${user.firstName} ${user.lastName}`, 20, 80);
        
        ctx.font = '14px Arial';
        ctx.fillText(`Role: ${user.role}`, 20, 105);
        ctx.fillText(`Dept: ${user.department?.name || 'N/A'}`, 20, 125);
        ctx.fillText(`ID: ${user.id}`, 20, 145);

        // QR code
        const qrImage = await loadImage(qrCodeDataURL);
        ctx.drawImage(qrImage, 250, 70, 120, 120);

        // Instructions
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan QR code for attendance', 200, 215);
        ctx.fillText('SMARTendance System', 200, 230);

        // Save card
        const fileName = `qr_card_${user.id}_${user.firstName}_${user.lastName}.png`;
        const filePath = path.join(qrCardsDir, fileName);
        
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);

        generatedCards.push({
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          fileName,
          filePath
        });

      } catch (error) {
        console.error(`Error generating QR card for user ${user.id}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${generatedCards.length} QR cards`,
      data: generatedCards
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all QR cards info
// @route   GET /api/qr
// @access  Private/Admin/Staff
exports.getAllQRCards = async (req, res, next) => {
  try {
    console.log('QR GetAll: Starting...');
    
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { not: 'ADMIN' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        department: { select: { name: true } },
        createdAt: true
      }
    });

    console.log(`QR GetAll: Found ${users.length} users`);

    const qrCardsDir = path.join(process.cwd(), '..', 'qr_cards');
    console.log('QR GetAll: Cards directory:', qrCardsDir);
    
    const qrCards = users.map(user => {
      const fileName = `qr_card_${user.id}_${user.firstName}_${user.lastName}.png`;
      const filePath = path.join(qrCardsDir, fileName);
      const exists = fs.existsSync(filePath);

      return {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        department: user.department?.name || 'N/A',
        fileName: exists ? fileName : null,
        hasQRCard: exists,
        createdAt: user.createdAt
      };
    });

    console.log(`QR GetAll: Created ${qrCards.length} card records`);

    res.status(200).json({
      success: true,
      count: qrCards.length,
      data: qrCards
    });

  } catch (error) {
    console.error('QR GetAll Error:', error);
    next(error);
  }
};

// @desc    Get specific QR card info
// @route   GET /api/qr/:userId
// @access  Private/Admin/Staff
exports.getQRCard = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        department: { select: { name: true } }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const fileName = `qr_card_${user.id}_${user.firstName}_${user.lastName}.png`;
    const qrCardsDir = path.join(process.cwd(), '..', 'qr_cards');
    const filePath = path.join(qrCardsDir, fileName);

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        department: user.department?.name || 'N/A',
        fileName,
        hasQRCard: fs.existsSync(filePath),
        downloadUrl: `/api/qr/download/${user.id}`
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Download QR card file
// @route   GET /api/qr/download/:userId
// @access  Private/Admin/Staff
exports.downloadQRCard = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const fileName = `qr_card_${user.id}_${user.firstName}_${user.lastName}.png`;
    const qrCardsDir = path.join(process.cwd(), '..', 'qr_cards');
    const filePath = path.join(qrCardsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'QR card not found. Please generate QR cards first.'
      });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    next(error);
  }
};