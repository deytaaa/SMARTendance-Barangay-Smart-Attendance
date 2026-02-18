const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/config');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        departmentId: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// IoT Device authentication
const authenticateDevice = async (req, res, next) => {
  const deviceId = req.headers['x-device-id'];
  const deviceSecret = req.headers['x-device-secret'];

  if (!deviceId || !deviceSecret) {
    return res.status(401).json({
      success: false,
      message: 'Device authentication required',
    });
  }

  try {
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device || device.secretKey !== deviceSecret) {
      return res.status(401).json({
        success: false,
        message: 'Invalid device credentials',
      });
    }

    if (!device.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Device is inactive',
      });
    }

    // Update device last seen
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: new Date() },
    });

    req.device = device;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Device authentication failed',
    });
  }
};

module.exports = { protect, authorize, authenticateDevice };
