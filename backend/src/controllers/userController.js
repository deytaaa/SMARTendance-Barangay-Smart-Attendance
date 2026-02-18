const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, barangayId, departmentId, search, page = 1, limit = 10 } = req.query;

    const where = {};

    if (role) where.role = role;
    if (barangayId) where.barangayId = parseInt(barangayId);
    if (departmentId) where.departmentId = parseInt(departmentId);
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          contactNumber: true,
          address: true,
          profileImage: true,
          role: true,
          isActive: true,
          faceEncoding: true,
          barangay: {
            select: { id: true, name: true },
          },
          department: {
            select: { id: true, name: true },
          },
          createdAt: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Non-admin users can only view their own profile
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        address: true,
        role: true,
        isActive: true,
        barangay: {
          select: { id: true, name: true, location: true },
        },
        department: {
          select: { id: true, name: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, contactNumber, address, role, barangayId, departmentId, isActive, profileImage } = req.body;

    // Non-admin users can only update their own profile (limited fields)
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
    }

    const updateData = {};

    // Fields that any user can update for themselves
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (address) updateData.address = address;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // Admin-only fields
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (barangayId !== undefined) updateData.barangayId = barangayId ? parseInt(barangayId) : null;
      if (departmentId !== undefined) updateData.departmentId = departmentId ? parseInt(departmentId) : null;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
        address: true,
        role: true,
        isActive: true,
        barangayId: true,
        departmentId: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
