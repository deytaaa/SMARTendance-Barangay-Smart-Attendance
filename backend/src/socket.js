const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('./config/database');
const config = require('./config/config');

let io;

const buildRoomsForUser = (user) => {
  const rooms = [`user:${user.id}`, `role:${user.role}`];

  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    rooms.push('monitoring');
  }

  if (user.barangayId) {
    rooms.push(`barangay:${user.barangayId}`);
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      rooms.push(`monitoring:barangay:${user.barangayId}`);
    }
  }

  if (user.departmentId) {
    rooms.push(`department:${user.departmentId}`);
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      rooms.push(`monitoring:department:${user.departmentId}`);
    }
  }

  return rooms;
};

const emitScopedAttendanceUpdate = (payload) => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }

  let emitter = io.to('role:ADMIN').to('role:STAFF');

  if (payload.userId) {
    emitter = emitter.to(`user:${payload.userId}`);
  }

  if (payload.barangayId) {
    emitter = emitter.to(`monitoring:barangay:${payload.barangayId}`);
  }

  if (payload.departmentId) {
    emitter = emitter.to(`monitoring:department:${payload.departmentId}`);
  }

  emitter.emit('attendance:updated', {
    timestamp: new Date().toISOString(),
    ...payload,
  });
};

const initSocket = (httpServer, corsOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          role: true,
          barangayId: true,
          departmentId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error('User is not authorized for live updates'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const rooms = buildRoomsForUser(socket.user);
    rooms.forEach((room) => socket.join(room));

    if (process.env.NODE_ENV === 'development') {
      console.log(`Socket connected: ${socket.id} -> ${rooms.join(', ')}`);
    }

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }

  return io;
};

module.exports = {
  emitScopedAttendanceUpdate,
  initSocket,
  getIO,
};