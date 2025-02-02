import nodemailer from 'nodemailer';

export async function POST(req) {
  const { email } = await req.json();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true, otp }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Error sending OTP' }), { status: 500 });
  }
}