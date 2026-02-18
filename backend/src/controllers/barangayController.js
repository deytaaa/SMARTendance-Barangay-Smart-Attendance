const prisma = require('../config/database');

// @desc    Get all barangays
// @route   GET /api/barangays
// @access  Private
exports.getAllBarangays = async (req, res, next) => {
  try {
    const barangays = await prisma.barangay.findMany({
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            devices: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: barangays.length,
      data: barangays,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single barangay
// @route   GET /api/barangays/:id
// @access  Private
exports.getBarangay = async (req, res, next) => {
  try {
    const { id } = req.params;

    const barangay = await prisma.barangay.findUnique({
      where: { id: parseInt(id) },
      include: {
        departments: true,
        devices: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!barangay) {
      return res.status(404).json({
        success: false,
        message: 'Barangay not found',
      });
    }

    res.status(200).json({
      success: true,
      data: barangay,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create barangay
// @route   POST /api/barangays
// @access  Private/Admin
exports.createBarangay = async (req, res, next) => {
  try {
    const { name, location, contact, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Barangay name is required',
      });
    }

    const barangay = await prisma.barangay.create({
      data: {
        name,
        location,
        contact,
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: barangay,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update barangay
// @route   PUT /api/barangays/:id
// @access  Private/Admin
exports.updateBarangay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, contact, description } = req.body;

    const barangay = await prisma.barangay.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(contact && { contact }),
        ...(description && { description }),
      },
    });

    res.status(200).json({
      success: true,
      data: barangay,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete barangay
// @route   DELETE /api/barangays/:id
// @access  Private/Admin
exports.deleteBarangay = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.barangay.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Barangay deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get barangay settings
// @route   GET /api/barangays/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    // Get the first barangay (assuming single barangay system)
    const barangay = await prisma.barangay.findFirst();

    if (!barangay) {
      return res.status(404).json({
        success: false,
        message: 'No barangay found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: barangay.name || '',
        address: barangay.location || '',
        contactNumber: barangay.contact || '',
        email: barangay.description || '',
        captain: '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update barangay settings
// @route   PUT /api/barangays/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    const { name, address, contactNumber, email, captain } = req.body;

    // Get the first barangay
    const existingBarangay = await prisma.barangay.findFirst();

    if (!existingBarangay) {
      return res.status(404).json({
        success: false,
        message: 'No barangay found',
      });
    }

    const barangay = await prisma.barangay.update({
      where: { id: existingBarangay.id },
      data: {
        ...(name && { name }),
        ...(address && { location: address }),
        ...(contactNumber && { contact: contactNumber }),
        ...(email && { description: email }),
      },
    });

    res.status(200).json({
      success: true,
      data: barangay,
    });
  } catch (error) {
    next(error);
  }
};
