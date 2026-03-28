require('dotenv').config();

/* =========================
   FETCH POLYFILL (Node 16)
========================= */
const fetch = require('node-fetch');
global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

/* =========================
   IMPORTS
========================= */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

/* =========================
   TRUST PROXY (Render)
========================= */
app.set('trust proxy', 1);

/* =========================
   SECURITY - HELMET
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  })
);

/* =========================
   PERFORMANCE
========================= */
app.use(compression());

/* =========================
   CORS CONFIGURATION (FIXED)
========================= */
const allowedOrigins = [
  "http://localhost:4200",
  process.env.FRONTEND_URL || ""
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / mobile apps

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(null, false); // don't crash app
      }
    },
    credentials: true
  })
);

/* =========================
   BODY PARSING
========================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROUTES IMPORT
========================= */
const authRoutes = require('./routes/auth.routes');
const billsRoutes = require('./routes/bills.routes');
const chatRoutes = require('./routes/chat.routes');
const contactRoutes = require('./routes/contact.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "PayNest API running 🚀",
    environment: process.env.NODE_ENV || "development"
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy 🚀"
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});