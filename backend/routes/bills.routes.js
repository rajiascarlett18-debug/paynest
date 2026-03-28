require('dotenv').config();

const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

/* =========================
   AUTH MIDDLEWARE
========================= */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.userId = decoded.id;
    next();
  });
}

/* =========================================================
   PUBLIC: TRN LOOKUP
   RETURNS:
   - exists: false (if user not found)
   - exists: true + count (if found)
   SAFE — DOES NOT RETURN BALANCE OR USER INFO
========================================================= */
router.get('/lookup/:trn', async (req, res) => {
  try {
    let { trn } = req.params;
    trn = trn.trim();

    // Validate Jamaican TRN (9 digits)
    if (!/^\d{9}$/.test(trn)) {
      return res.status(400).json({
        message: 'Invalid TRN format'
      });
    }

    // Step 1: Check if user exists
    const [userResult] = await db.query(
      `SELECT id FROM users WHERE trn = ?`,
      [trn]
    );

    if (userResult.length === 0) {
      return res.json({
        exists: false,
        count: 0
      });
    }

    const userId = userResult[0].id;

    // Step 2: Count unpaid bills
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM bills
      WHERE user_id = ?
      AND status = 'UNPAID'
      `,
      [userId]
    );

    return res.json({
      exists: true,
      count: Number(countResult[0].count) || 0
    });

  } catch (err) {
    console.error('TRN lookup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


/* =========================
   GET USER BILLS
========================= */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const [results] = await db.query(
      `
      SELECT id,
             name,
             amount,
             due_date AS dueDate,
             status
      FROM bills
      WHERE user_id = ?
      ORDER BY due_date ASC
      `,
      [userId]
    );

    res.json(results);

  } catch (err) {
    console.error('Fetch bills error:', err);
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
});


/* =========================
   GET PAID BILLS
========================= */
router.get('/paid/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const [results] = await db.query(
      `
      SELECT id,
             name,
             amount,
             due_date AS dueDate,
             paid_date AS paidDate
      FROM bills
      WHERE user_id = ?
      AND status = 'PAID'
      ORDER BY paid_date DESC
      `,
      [userId]
    );

    res.json(results);

  } catch (err) {
    console.error('Fetch paid bills error:', err);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});


/* =========================
   PAY MULTIPLE BILLS
========================= */
router.post('/pay', authMiddleware, async (req, res) => {
  try {
    const { billIds } = req.body;

    if (!billIds || !Array.isArray(billIds) || billIds.length === 0) {
      return res.status(400).json({ message: 'No bills selected' });
    }

    const [sumResult] = await db.query(
      `
      SELECT SUM(amount) AS totalAmount
      FROM bills
      WHERE id IN (?) AND user_id = ?
      `,
      [billIds, req.userId]
    );

    const totalAmount = Number(sumResult[0].totalAmount) || 0;

    const [updateResult] = await db.query(
      `
      UPDATE bills
      SET status = 'PAID',
          paid_date = NOW()
      WHERE id IN (?) AND user_id = ?
      `,
      [billIds, req.userId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: 'No bills updated' });
    }

    res.json({
      message: 'Payment successful',
      totalAmount
    });

  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment failed' });
  }
});


/* =========================
   PAY SINGLE BILL
========================= */
router.put('/pay/:billId', authMiddleware, async (req, res) => {
  try {
    const { billId } = req.params;

    const [result] = await db.query(
      `
      UPDATE bills
      SET status = 'PAID',
          paid_date = NOW()
      WHERE id = ? AND user_id = ?
      `,
      [billId, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: 'Bill not found or unauthorized'
      });
    }

    res.json({ message: 'Bill paid successfully' });

  } catch (err) {
    console.error('Single bill payment error:', err);
    res.status(500).json({ message: 'Payment failed' });
  }
});

module.exports = router;
