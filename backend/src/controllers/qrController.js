const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const prisma = require('../config/database');

const ensureQrCardsDir = () => {
  const qrCardsDir = path.join(process.cwd(), '..', 'qr_cards');
  if (!fs.existsSync(qrCardsDir)) {
    fs.mkdirSync(qrCardsDir, { recursive: true });
  }
  return qrCardsDir;
};

const buildQrFileName = (user) => `qr_card_${user.id}_${user.firstName}_${user.lastName}.png`;

const getInitials = (firstName = '', lastName = '') => {
  return `${(firstName[0] || '').toUpperCase()}${(lastName[0] || '').toUpperCase()}` || 'NA';
};

const generateCardForUser = async (user) => {
  const qrData = JSON.stringify({
    employee_id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    department: user.department?.name || 'N/A'
  });

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

  const canvas = createCanvas(400, 250);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 400, 250);

  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 3;
  ctx.strokeRect(5, 5, 390, 240);

  ctx.fillStyle = '#1f2937';
  ctx.fillRect(10, 10, 380, 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('BARANGAY EMPLOYEE ID', 200, 35);

  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';

  // Profile photo area
  const photoX = 20;
  const photoY = 72;
  const photoSize = 72;

  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoSize, photoSize);

  if (user.profileImage) {
    try {
      const profileImg = await loadImage(user.profileImage);
      ctx.drawImage(profileImg, photoX, photoY, photoSize, photoSize);
    } catch (error) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(getInitials(user.firstName, user.lastName), photoX + photoSize / 2, photoY + 44);
    }
  } else {
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getInitials(user.firstName, user.lastName), photoX + photoSize / 2, photoY + 44);
  }

  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`${user.firstName} ${user.lastName}`, 102, 84);

  ctx.font = '14px Arial';
  ctx.fillText(`Role: ${user.role}`, 102, 108);
  ctx.fillText(`Dept: ${user.department?.name || 'N/A'}`, 102, 128);
  ctx.fillText(`ID: ${user.id}`, 102, 148);

  const qrImage = await loadImage(qrCodeDataURL);
  ctx.drawImage(qrImage, 258, 72, 112, 112);

  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Scan QR code for attendance', 200, 215);
  ctx.fillText('SMARTendance System', 200, 230);

  const fileName = buildQrFileName(user);
  const qrCardsDir = ensureQrCardsDir();
  const filePath = path.join(qrCardsDir, fileName);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);

  return {
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    fileName,
    filePath
  };
};

// @desc    Generate QR cards for all employees
// @route   POST /api/qr/generate
// @access  Private/Admin/Staff
exports.generateQRCards = async (req, res, next) => {
  try {
    console.log('QR Generation: Starting...');

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { not: 'ADMIN' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
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

    const qrCardsDir = ensureQrCardsDir();
    console.log('QR Generation: Cards directory:', qrCardsDir);

    const generatedCards = [];

    for (const user of users) {
      try {
        const generated = await generateCardForUser(user);
        generatedCards.push(generated);
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

// @desc    Generate QR card for one employee
// @route   POST /api/qr/generate/:userId
// @access  Private/Admin/Staff
exports.generateSingleQRCard = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        isActive: true,
        department: { select: { name: true } }
      }
    });

    if (!user || user.role === 'ADMIN' || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Active employee not found'
      });
    }

    const generatedCard = await generateCardForUser(user);

    res.status(200).json({
      success: true,
      message: 'QR card generated successfully',
      data: generatedCard
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
        profileImage: true,
        role: true,
        department: { select: { name: true } },
        createdAt: true
      }
    });

    console.log(`QR GetAll: Found ${users.length} users`);

    const qrCardsDir = path.join(process.cwd(), '..', 'qr_cards');
    console.log('QR GetAll: Cards directory:', qrCardsDir);

    const qrCards = users.map((user) => {
      const fileName = buildQrFileName(user);
      const filePath = path.join(qrCardsDir, fileName);
      const exists = fs.existsSync(filePath);

      return {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        profileImage: user.profileImage || null,
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
      where: { id: parseInt(userId, 10) },
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

    const fileName = buildQrFileName(user);
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
      where: { id: parseInt(userId, 10) },
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

    const fileName = buildQrFileName(user);
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