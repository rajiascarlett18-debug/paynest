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

/* =========================
   ROUTES
========================= */
const authRoutes = require('./routes/auth.routes');
const billsRoutes = require('./routes/bills.routes');
const chatRoutes = require('./routes/chat.routes');
const contactRoutes = require('./routes/contact.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

/* =========================
   TRUST PROXY (Render/Production)
========================= */
app.set('trust proxy', 1);

/* =========================
   SECURITY - HELMET
========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Prevent Angular/Stripe breakage
  })
);

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  "http://localhost:4200",
  process.env.FRONTEND_URL // Add Netlify URL in production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman & server-to-server
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
   ROUTES
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
    message: "PayNest API running",
    environment: process.env.NODE_ENV || "development"
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});