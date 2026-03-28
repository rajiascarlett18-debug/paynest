require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend'); // ✅ USE RESEND
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   REGISTER
========================= */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, trn } = req.body;

    if (!fullName || !email || !password || !trn) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/^\d{9}$/.test(trn)) {
      return res.status(400).json({ message: 'TRN must be 9 digits' });
    }

    const [existingTrn] = await db.query(
      'SELECT id FROM users WHERE trn = ?',
      [trn]
    );

    if (existingTrn.length > 0) {
      return res.status(409).json({ message: 'TRN already registered' });
    }

    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (full_name, email, password, trn, role)
       VALUES (?, ?, ?, ?, 'USER')`,
      [fullName, email, hashedPassword, trn]
    );

    res.status(201).json({
      message: 'User registered successfully'
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   LOGIN
========================= */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const [results] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = results[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const loginRole = role || 'USER';

    if (loginRole === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'User is not an admin'
      });
    }

    if (loginRole === 'USER' && user.role === 'ADMIN') {
      return res.status(403).json({
        message: 'Admins must login from Admin tab'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        trn: user.trn,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

/* =========================
   FORGOT PASSWORD (FINAL FIX)
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📩 Forgot password request:', email);

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      const user = users[0];

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 30 * 60 * 1000);

      await db.query(
        `UPDATE users 
         SET reset_token = ?, reset_token_expiry = ? 
         WHERE id = ?`,
        [resetToken, expiry, user.id]
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // ✅ ALWAYS respond immediately
      res.json({
        message: 'If an account exists, a reset link has been sent.'
      });

      // ✅ SEND EMAIL WITH RESEND
      resend.emails.send({
        from: 'PayNest <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your PayNest Password',
        html: `
          <div style="font-family: Arial; padding: 25px;">
            <h2 style="color:#0066ff;">Reset Your Password</h2>
            <p>Hello ${user.full_name},</p>
            <a href="${resetLink}" 
               style="padding:12px 24px;background:#0066ff;color:white;border-radius:6px;text-decoration:none;">
              Reset Password
            </a>
          </div>
        `
      }).then(() => {
        console.log('✅ Email sent via Resend');
      }).catch(err => {
        console.error('❌ Resend error:', err.message);
      });

      return;
    }

    res.json({
      message: 'If an account exists, a reset link has been sent.'
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   RESET PASSWORD
========================= */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [users] = await db.query(
      `SELECT * FROM users 
       WHERE reset_token = ? 
       AND reset_token_expiry > NOW()`,
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: 'Invalid or expired token'
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users 
       SET password = ?, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    res.json({
      message: 'Password reset successful'
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;