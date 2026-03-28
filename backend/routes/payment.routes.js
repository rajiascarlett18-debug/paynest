const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth.middleware');
const db = require('../db');
const sendReceiptEmail = require('../utils/email');

/* ===============================
   PAY BILL WITH STRIPE
=============================== */
router.post('/pay-bill', auth, async (req, res) => {
  try {
    const { billId } = req.body;
    const userId = req.user.id;

    if (!billId) {
      return res.status(400).json({ message: 'Bill ID required' });
    }

    /* ===============================
       1️⃣ VALIDATE BILL
    ================================ */
    const [bills] = await db.query(
      'SELECT * FROM bills WHERE id = ? AND user_id = ?',
      [billId, userId]
    );

    if (!bills.length) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const bill = bills[0];

    if (bill.status === 'PAID') {
      return res.status(400).json({ message: 'Bill already paid' });
    }

    /* ===============================
       2️⃣ GET USER DETAILS FIRST 🔥
    ================================ */
    const [users] = await db.query(
      `SELECT full_name, email FROM users WHERE id = ?`,
      [userId]
    );

    const user = users[0];

    /* ===============================
       3️⃣ CREATE STRIPE PAYMENT INTENT
    ================================ */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(bill.amount) * 100),
      currency: 'usd',

      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },

      payment_method: 'pm_card_visa', // test card
      confirm: true,

      receipt_email: user?.email, // ✅ show email in Stripe

      metadata: {
        billId: bill.id.toString(),
        userId: userId.toString(),
        customerName: user?.full_name // ✅ show name in Stripe
      }
    });

    /* ===============================
       4️⃣ IF PAYMENT SUCCEEDED
    ================================ */
    if (paymentIntent.status === 'succeeded') {

      // 🔹 Save transaction
      await db.query(
        `
        INSERT INTO transactions 
        (user_id, bill_id, stripe_payment_intent_id, amount, status)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          userId,
          bill.id,
          paymentIntent.id,
          bill.amount,
          'PAID'
        ]
      );

      // 🔹 Update bill (requires paid_date column)
      await db.query(
        `
        UPDATE bills
        SET status = 'PAID',
            paid_date = NOW()
        WHERE id = ?
        `,
        [bill.id]
      );

      /* ===============================
         5️⃣ SEND RESPONSE FIRST ✅
      ================================ */
      res.status(200).json({
        success: true,
        message: 'Payment successful'
      });

      /* ===============================
         6️⃣ SEND EMAIL (SAFE) 🔥
      ================================ */
      if (user) {
        sendReceiptEmail(user.email, {
          name: user.full_name,
          amount: bill.amount,
          billName: bill.name,
          transactionId: paymentIntent.id,
          paidDate: new Date().toLocaleString()
        }).catch(err => {
          console.error('Email failed:', err);
        });
      }

      return;
    }

    return res.status(400).json({
      success: false,
      message: 'Payment did not complete'
    });

  } catch (err) {
    console.error('Stripe Payment Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Stripe payment failed'
    });
  }
});

module.exports = router;