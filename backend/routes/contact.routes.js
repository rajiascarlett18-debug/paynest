const express = require('express');
const router = express.Router();
const db = require('../db');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    /* =========================
       VALIDATION
    ========================== */
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    /* =========================
       SAVE TO DATABASE
    ========================== */
    await db.query(
      `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, subject || 'General', message]
    );

    /* =========================
       SEND RESPONSE FIRST ⚡
    ========================== */
    res.status(200).json({
      success: true,
      message: "Message sent successfully"
    });

    /* =========================
       EMAILS (ASYNC - SAFE)
    ========================== */

    // 🔹 1. Email to USER
    resend.emails.send({
      from: 'PayNest <onboarding@resend.dev>',
      to: email,
      subject: "We’ve Received Your Message – PayNest",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${name},</h2>
          <p>Thank you for contacting <strong>PayNest</strong>.</p>
          <p>We have received your message and our support team will get back to you shortly.</p>

          <br/>

          <p><strong>Your Message:</strong></p>
          <p style="background:#f4f4f4;padding:10px;border-radius:6px;">
            ${message}
          </p>

          <br/>

          <p>Best regards,</p>
          <p><strong>PayNest Support Team</strong></p>
        </div>
      `
    }).catch(err => console.error('User email failed:', err));

    // 🔹 2. Email to ADMIN (YOU)
    resend.emails.send({
      from: 'PayNest <onboarding@resend.dev>',
      to: 'rajia.scarlett@yahoo.com', // 🔥 YOUR EMAIL
      subject: "New Contact Form Submission",
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'General'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    }).catch(err => console.error('Admin email failed:', err));

  } catch (error) {
    console.error("Contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;