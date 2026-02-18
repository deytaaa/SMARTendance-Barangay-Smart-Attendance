const prisma = require('../config/database');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getAllDepartments = async (req, res, next) => {
  try {
    const { barangayId } = req.query;

    const where = {};
    if (barangayId) where.barangayId = parseInt(barangayId);

    const departments = await prisma.department.findMany({
      where,
      include: {
        barangay: {
          select: { id: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        barangay: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, barangayId } = req.body;

    if (!name || !barangayId) {
      return res.status(400).json({
        success: false,
        message: 'Department name and barangay ID are required',
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        barangayId: parseInt(barangayId),
      },
      include: {
        barangay: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, barangayId } = req.body;

    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(barangayId && { barangayId: parseInt(barangayId) }),
      },
      include: {
        barangay: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
