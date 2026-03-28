const express = require('express');
const router = express.Router();
const db = require('../db');
const adminMiddleware = require('../middleware/admin.middleware');

/* =========================
   GET ALL USERS
========================= */
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, full_name, email, trn, role FROM users'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/* =========================
   PROMOTE USER TO ADMIN
========================= */
router.put('/promote/:userId', adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query(
      'UPDATE users SET role = "ADMIN" WHERE id = ?',
      [userId]
    );

    res.json({ message: 'User promoted to ADMIN' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to promote user' });
  }
});

/* =========================
   GET ALL BILLS
========================= */
router.get('/bills', adminMiddleware, async (req, res) => {
  try {
    const [bills] = await db.query(
      `
      SELECT b.id, b.name, b.amount, b.status, b.due_date,
             u.full_name
      FROM bills b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.due_date ASC
      `
    );

    res.json(bills);

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
});

/* =========================
   UPDATE BILL
========================= */
router.put('/bills/:billId', adminMiddleware, async (req, res) => {
  try {
    const { billId } = req.params;
    const { amount, status } = req.body;

    await db.query(
      `
      UPDATE bills
      SET amount = ?, status = ?
      WHERE id = ?
      `,
      [amount, status, billId]
    );

    res.json({ message: 'Bill updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to update bill' });
  }
});

/* =========================
   DELETE BILL
========================= */
router.delete('/bills/:billId', adminMiddleware, async (req, res) => {
  try {
    const { billId } = req.params;

    await db.query(
      'DELETE FROM bills WHERE id = ?',
      [billId]
    );

    res.json({ message: 'Bill deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to delete bill' });
  }
});

/* =========================
   CREATE BILL
========================= */
router.post('/bills', adminMiddleware, async (req, res) => {
  try {
    const { userId, name, amount, dueDate } = req.body;

    if (!userId || !name || !amount || !dueDate) {
      return res.status(400).json({ message: 'All fields required' });
    }

    await db.query(
      `
      INSERT INTO bills (user_id, name, amount, due_date, status)
      VALUES (?, ?, ?, ?, 'UNPAID')
      `,
      [userId, name, amount, dueDate]
    );

    res.json({ message: 'Bill created successfully' });

  } catch (err) {
    console.error('Create bill error:', err);
    res.status(500).json({ message: 'Failed to create bill' });
  }
});

/* =========================
   GET ALL TRANSACTIONS
========================= */
router.get('/transactions', adminMiddleware, async (req, res) => {
  try {
    const [transactions] = await db.query(
      `
      SELECT 
        t.id,
        u.full_name,
        u.email,
        b.name AS bill_name,
        t.amount,
        t.status,
        t.stripe_payment_intent_id,
        t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN bills b ON t.bill_id = b.id
      ORDER BY t.created_at DESC
      `
    );

    res.json(transactions);

  } catch (err) {
    console.error('Fetch transactions error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

/* =========================
   ADMIN ANALYTICS
========================= */
router.get('/analytics', adminMiddleware, async (req, res) => {
  try {

    // Total Users
    const [usersCount] = await db.query(
      `SELECT COUNT(*) AS totalUsers FROM users`
    );

    // Total Revenue (PAID transactions)
    const [revenue] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS totalRevenue 
       FROM transactions 
       WHERE status = 'PAID'`
    );

    // Total Unpaid Bills
    const [unpaid] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS totalUnpaid 
       FROM bills 
       WHERE status = 'UNPAID'`
    );

    // Total Transactions
    const [transactionsCount] = await db.query(
      `SELECT COUNT(*) AS totalTransactions FROM transactions`
    );

    res.json({
      totalUsers: usersCount[0].totalUsers,
      totalRevenue: revenue[0].totalRevenue,
      totalUnpaid: unpaid[0].totalUnpaid,
      totalTransactions: transactionsCount[0].totalTransactions
    });

  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

module.exports = router;