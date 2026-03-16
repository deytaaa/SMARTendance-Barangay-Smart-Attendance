const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { initSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const barangayRoutes = require('./routes/barangayRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const qrRoutes = require('./routes/qrRoutes');
const systemSettingsRoutes = require('./routes/systemSettingsRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SMARTendance API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/barangays', barangayRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/system-settings', systemSettingsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
const server = http.createServer(app);

initSocket(server, config.cors.origin);

server.listen(PORT, () => {
  console.log('');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│   🚀 SMARTendance API Server Running   │');
  console.log('├─────────────────────────────────────────┤');
  console.log(`│   Environment: ${config.nodeEnv.padEnd(23)} │`);
  console.log(`│   Port: ${PORT.toString().padEnd(31)} │`);
  console.log(`│   URL: http://localhost:${PORT}${' '.repeat(15)} │`);
  console.log('└─────────────────────────────────────────┘');
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   - Health Check: GET /health');
  console.log('   - Auth: /api/auth/*');
  console.log('   - Users: /api/users/*');
  console.log('   - Attendance: /api/attendance/*');
  console.log('   - Barangays: /api/barangays/*');
  console.log('   - Departments: /api/departments/*');
  console.log('   - System Settings: /api/system-settings/*');
  console.log('');
});

module.exports = app;
