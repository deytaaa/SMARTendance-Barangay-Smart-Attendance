require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
  },
  
  cors: {
    // Support comma-separated list of origins with function validator
    origin: function(origin, callback) {
      const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map(o => o.trim());
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
  },
  
  iot: {
    deviceSecret: process.env.IOT_DEVICE_SECRET || 'device-secret-key',
  },
};
