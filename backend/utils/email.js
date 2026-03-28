const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendReceiptEmail = async (to, receiptData) => {
  try {
    const { name, amount, billName, transactionId, paidDate } = receiptData;

    await resend.emails.send({
      from: 'PayNest <onboarding@resend.dev>', // 🔥 Works instantly
      to: to,
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
              Thank you for using PayNest 💙
            </p>

          </div>
        </div>
      `
    });

    console.log('✅ Email sent successfully');

  } catch (err) {
    console.error('❌ Email failed:', err);
  }
};

module.exports = sendReceiptEmail;