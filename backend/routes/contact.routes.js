const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    /* =========================
       SAVE TO DATABASE
    ========================== */
    const sql = `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(sql, [name, email, subject, message]);

    /* =========================
       SETUP YAHOO TRANSPORTER
    ========================== */
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    /* =========================
       SEND EMAIL TO USER
    ========================== */
    await transporter.sendMail({
      from: `"PayNest Support" <${process.env.EMAIL_USER}>`,
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
    });

    /* =========================
       OPTIONAL: SEND ADMIN EMAIL
    ========================== */
    await transporter.sendMail({
      from: `"PayNest System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    res.status(200).json({ message: "Message sent successfully" });

  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
