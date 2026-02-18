require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  iot: {
    deviceSecret: process.env.IOT_DEVICE_SECRET || 'device-secret-key',
  },
};
