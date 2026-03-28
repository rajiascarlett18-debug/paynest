const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendReceiptEmail = async (to, receiptData) => {
  const { name, amount, billName, transactionId, paidDate } = receiptData;

  const mailOptions = {
    from: `"PayNest" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Payment Receipt - PayNest',
    html: `
      <div style="font-family:Arial;padding:25px;background:#f8fafc;">
        <div style="background:white;padding:25px;border-radius:12px;">
          <h2 style="color:#2563eb;">Payment Successful ✅</h2>
          <p>Hello ${name},</p>
          <p>Your payment has been processed successfully.</p>

          <hr/>

          <p><strong>Bill:</strong> ${billName}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Date:</strong> ${paidDate}</p>

          <hr/>

          <p style="font-size:13px;color:#777;">
            Thank you for using PayNest.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendReceiptEmail;