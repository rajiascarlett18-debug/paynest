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
       2️⃣ CREATE STRIPE PAYMENT INTENT
    ================================ */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(bill.amount) * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      payment_method: 'pm_card_visa', // Stripe test card
      confirm: true,
      metadata: {
        billId: bill.id.toString(),
        userId: userId.toString()
      }
    });

    /* ===============================
       3️⃣ IF PAYMENT SUCCEEDED
    ================================ */
    if (paymentIntent.status === 'succeeded') {

      // 🔹 Insert transaction
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

      // 🔹 Update bill
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
         4️⃣ GET USER DETAILS
      ================================ */
      const [users] = await db.query(
        `SELECT full_name, email FROM users WHERE id = ?`,
        [userId]
      );

      /* ===============================
         5️⃣ SEND RESPONSE FIRST ✅
      ================================ */
      res.status(200).json({
        success: true,
        message: 'Payment successful'
      });

      /* ===============================
         6️⃣ SEND EMAIL (ASYNC SAFE) 🔥
      ================================ */
      if (users.length > 0) {
        const user = users[0];

        sendReceiptEmail(user.email, {
          name: user.full_name,
          amount: bill.amount,
          billName: bill.name,
          transactionId: paymentIntent.id,
          paidDate: new Date().toLocaleString()
        }).catch(emailError => {
          console.error('Email failed:', emailError);
        });
      }

      return; // 🔥 STOP EXECUTION

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