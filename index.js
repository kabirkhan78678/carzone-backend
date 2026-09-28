process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import route from './routes/index.js';
import msg from './utils/message.js'
import { fileURLToPath } from 'url';
import { getLocalIP, getMessage } from './utils/user_helper.js';
import { stripeWebhook } from './controllers/user_controller.js';
import './utils/cronJob.js'
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();
// Must be before express.json()
app.post("/api/webhook", express.raw({ type: "application/json" }), stripeWebhook);
const server = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use('/profile', express.static(path.join(__dirname, 'public/profile')));


// Health check endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date() }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date() }));

// Use routes
app.use('/api', route);

// Central Express Error Handler
app.use((err, req, res, next) => {
  console.error('❌ [Global Error Handler]:', err.message || err);
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    status: status,
    message: err.message || 'Internal Server Error',
    data: []
  });
});

const port = process.env.PORT || 4000;
const lang = 'en';

server.listen(port, () => {
  const localIp = getLocalIP();
  const isLocalDb = ['localhost', '127.0.0.1'].includes(process.env.DB_HOST || '');
  const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') 
    ? 'LIVE' 
    : process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') 
      ? 'TEST' 
      : 'Not Configured';

  console.log('\n======================================================');
  console.log('🚀  CAR ZONE BACKEND SERVER RUNNING');
  console.log('======================================================');
  console.log(`🌐 Local URL:      http://localhost:${port}`);
  console.log(`📡 Network URL:    http://${localIp}:${port}`);
  if (process.env.APP_URL && !process.env.APP_URL.includes('localhost') && !process.env.APP_URL.includes(localIp)) {
    console.log(`🔗 Configured URL: ${process.env.APP_URL}`);
  }
  console.log('------------------------------------------------------');
  console.log(`🗄️  Database (MySQL): [${isLocalDb ? 'LOCAL' : 'REMOTE/LIVE'}] ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} (${process.env.DB_DATABASE})`);
  console.log(`💳 Stripe Mode:     ${stripeMode}`);
  console.log(`🔥 Firebase:        ${process.env.FIREBASE_PROJECT_ID ? `Active (${process.env.FIREBASE_PROJECT_ID})` : 'Inactive'}`);
  console.log(`📧 Email / SMTP:    ${process.env.SMTP_HOST || 'Not Configured'} (${process.env.EMAIL_USER || 'N/A'})`);
  console.log('======================================================\n');
});

// Process-level crash prevention
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️ [Uncaught Exception]:', error.message || error);
});
