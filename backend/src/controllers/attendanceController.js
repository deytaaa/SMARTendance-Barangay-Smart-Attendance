const prisma = require('../config/database');
const { emitScopedAttendanceUpdate } = require('../socket');

const emitAttendanceUpdated = (payload) => {
  try {
    emitScopedAttendanceUpdate(payload);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Socket emit skipped:', error.message);
    }
  }
};

// @desc    Record check-in (from IoT device or manual)
// @route   POST /api/attendance/check-in
// @access  Private (IoT Device or Admin/Staff)
exports.checkIn = async (req, res, next) => {
  try {
    const { userId, timestamp } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        barangayId: true,
        departmentId: true,
        department: { select: { name: true } },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: parseInt(userId),
        date: today,
      },
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        data: existingAttendance,
      });
    }

    // Determine attendance status (on time vs late)
    const checkInTime = timestamp ? new Date(timestamp) : new Date();
    const checkInHour = checkInTime.getHours();
    const checkInMinute = checkInTime.getMinutes();
    
    // Consider late if after 9:00 AM
    let status = 'ON_TIME';
    if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0)) {
      status = 'LATE';
    }

    // Create or update attendance record
    const attendance = existingAttendance
      ? await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            checkInTime,
            status,
            deviceId: req.device ? req.device.id : null,
          },
        })
      : await prisma.attendance.create({
          data: {
            userId: parseInt(userId),
            date: today,
            checkInTime,
            status,
            deviceId: req.device ? req.device.id : null,
          },
        });

    emitAttendanceUpdated({
      action: 'CHECK_IN',
      userId: user.id,
      attendanceId: attendance.id,
      role: user.role,
      barangayId: user.barangayId,
      departmentId: user.departmentId,
    });

    res.status(200).json({
      success: true,
      message: `Welcome, ${user.firstName}!`,
      data: {
        attendance,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          department: user.department?.name,
        },
        time: checkInTime.toLocaleTimeString(),
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record check-out
// @route   POST /api/attendance/check-out
// @access  Private (IoT Device or Admin/Staff)
exports.checkOut = async (req, res, next) => {
  try {
    const { userId, timestamp } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        barangayId: true,
        departmentId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: parseInt(userId),
        date: today,
      },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today',
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today',
        data: attendance,
      });
    }

    // Update with check-out time
    const checkOutTime = timestamp ? new Date(timestamp) : new Date();

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOutTime },
    });

    emitAttendanceUpdated({
      action: 'CHECK_OUT',
      userId: user.id,
      attendanceId: updatedAttendance.id,
      role: user.role,
      barangayId: user.barangayId,
      departmentId: user.departmentId,
    });

    // Calculate hours worked
    const hoursWorked = (checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);

    res.status(200).json({
      success: true,
      message: `Goodbye, ${user.firstName}!`,
      data: {
        attendance: updatedAttendance,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        },
        time: checkOutTime.toLocaleTimeString(),
        hoursWorked: hoursWorked.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private/Admin/Staff
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, userId, status, departmentId, page = 1, limit = 20 } = req.query;

    const where = {};

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      where.date = targetDate;
    }

    if (userId) where.userId = parseInt(userId);
    if (status) where.status = status;
    if (departmentId) where.user = { departmentId: parseInt(departmentId) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              department: { select: { id: true, name: true } },
            },
          },
          device: {
            select: {
              name: true,
              location: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private/Admin/Staff
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = { date: today };
    if (departmentId) where.user = { departmentId: parseInt(departmentId) };

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { checkInTime: 'asc' },
    });

    // Get total users count (exclude ADMIN)
    const totalUsers = await prisma.user.count({
      where: { 
        isActive: true, 
        role: { not: 'ADMIN' }
      },
    });

    const presentCount = attendance.filter(a => a.checkInTime).length;
    const lateCount = attendance.filter(a => a.status === 'LATE').length;

    res.status(200).json({
      success: true,
      summary: {
        total: totalUsers,
        present: presentCount,
        absent: totalUsers - presentCount,
        late: lateCount,
        onTime: presentCount - lateCount,
      },
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user attendance history
// @route   GET /api/attendance/user/:userId
// @access  Private
exports.getUserAttendance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    // Non-admin users can only view their own attendance
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attendance',
      });
    }

    const where = { userId: parseInt(userId) };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          device: {
            select: { name: true, location: true },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    // Calculate statistics
    const stats = {
      totalDays: total,
      present: attendance.filter(a => a.checkInTime).length,
      late: attendance.filter(a => a.status === 'LATE').length,
      onTime: attendance.filter(a => a.status === 'ON_TIME').length,
    };

    res.status(200).json({
      success: true,
      stats,
      count: attendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private/Admin/Staff
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, barangayId, departmentId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const where = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const userWhere = {};
    if (barangayId) userWhere.barangayId = parseInt(barangayId);
    if (departmentId) userWhere.departmentId = parseInt(departmentId);

    const attendance = await prisma.attendance.findMany({
      where: {
        ...where,
        user: userWhere,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
            barangay: { select: { name: true } },
          },
        },
      },
    });

    // Group by user
    const userStats = {};
    attendance.forEach(record => {
      const userId = record.user.id;
      if (!userStats[userId]) {
        userStats[userId] = {
          user: record.user,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
        };
      }
      userStats[userId].totalDays++;
      if (record.checkInTime) userStats[userId].presentDays++;
      if (record.status === 'LATE') userStats[userId].lateDays++;
    });

    const reportData = Object.values(userStats);

    res.status(200).json({
      success: true,
      period: {
        startDate,
        endDate,
      },
      count: reportData.length,
      data: reportData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            barangayId: true,
            departmentId: true,
          },
        },
      },
    });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await prisma.attendance.delete({
      where: { id: parseInt(id) },
    });

    emitAttendanceUpdated({
      action: 'DELETE',
      userId: existingAttendance.user.id,
      attendanceId: existingAttendance.id,
      role: existingAttendance.user.role,
      barangayId: existingAttendance.user.barangayId,
      departmentId: existingAttendance.user.departmentId,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
