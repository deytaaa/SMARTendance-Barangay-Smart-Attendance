const prisma = require('../config/database');

const DEFAULT_KEY = 'default';
const DEFAULT_SETTINGS = {
  cutoffTime: '09:00',
  gracePeriod: 15,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  shiftStart: '08:00',
  shiftEnd: '17:00',
};

const normalizeWorkingDays = (workingDays) => {
  if (!Array.isArray(workingDays)) {
    return DEFAULT_SETTINGS.workingDays;
  }

  return workingDays
    .filter((day) => typeof day === 'string' && day.trim())
    .map((day) => day.trim());
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { key: DEFAULT_KEY },
      update: {},
      create: {
        key: DEFAULT_KEY,
        ...DEFAULT_SETTINGS,
      },
    });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { cutoffTime, gracePeriod, workingDays, shiftStart, shiftEnd } = req.body;

    const settings = await prisma.systemSettings.upsert({
      where: { key: DEFAULT_KEY },
      update: {
        ...(cutoffTime && { cutoffTime }),
        ...(gracePeriod !== undefined && { gracePeriod: parseInt(gracePeriod, 10) || 0 }),
        ...(workingDays !== undefined && { workingDays: normalizeWorkingDays(workingDays) }),
        ...(shiftStart && { shiftStart }),
        ...(shiftEnd && { shiftEnd }),
      },
      create: {
        key: DEFAULT_KEY,
        cutoffTime: cutoffTime || DEFAULT_SETTINGS.cutoffTime,
        gracePeriod: gracePeriod !== undefined ? parseInt(gracePeriod, 10) || 0 : DEFAULT_SETTINGS.gracePeriod,
        workingDays: normalizeWorkingDays(workingDays),
        shiftStart: shiftStart || DEFAULT_SETTINGS.shiftStart,
        shiftEnd: shiftEnd || DEFAULT_SETTINGS.shiftEnd,
      },
    });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};