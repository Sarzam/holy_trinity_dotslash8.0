import dbConnect from '@/utils/db'; // Adjust the path to your dbConnect file
import User from '@/models/user'; // Adjust the path to your User model
import bcrypt from 'bcrypt';
import { sendEmail } from '@/utils/sendEmail'; // Import your email utility
import crypto from 'crypto';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, mobileno, password, captchaToken, captchaInput, location } = body;

    console.log('Received CAPTCHA data:', { captchaToken, captchaInput }); // Debug log
    console.log('Global CAPTCHA store:', global.captchaStore); // Debug log

    // Connect to the database
    await dbConnect();

    // Validate input fields
    if (!name || !email || !mobileno || !password || !captchaToken || !captchaInput || !location) {
      return new Response(
        JSON.stringify({ 
          message: 'All fields are required', 
          success: false,
          missingFields: { name, email, mobileno, password, captchaToken, captchaInput, location }
        }),
        { status: 400 }
      );
    }

    // Step 1: Verify CAPTCHA
    if (!global.captchaStore) {
      console.error('CAPTCHA store not initialized');
      return new Response(
        JSON.stringify({ message: 'CAPTCHA system error', success: false }),
        { status: 500 }
      );
    }

    const storedCaptcha = global.captchaStore[captchaToken];
    console.log('Stored CAPTCHA:', storedCaptcha);
    console.log('User input CAPTCHA:', captchaInput);

    if (!storedCaptcha) {
      return new Response(
        JSON.stringify({ message: 'CAPTCHA expired or invalid', success: false }),
        { status: 400 }
      );
    }

    if (storedCaptcha.toLowerCase() !== captchaInput.toLowerCase()) {
      return new Response(
        JSON.stringify({ message: 'Incorrect CAPTCHA', success: false }),
        { status: 400 }
      );
    }

    // Remove used CAPTCHA
    delete global.captchaStore[captchaToken];

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'User already exists with this email', success: false }),
        { status: 400 }
      );
    }

    // Step 3: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Generate an OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Step 5: Create a new user (initially unverified)
    const user = await User.create({
      name,
      email,
      mobileno,
      password: hashedPassword, 
      isVerified: false, // Add an `isVerified` field in your User model
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
      location, // Include the location field
    });

    // Step 5: Send the OTP email
    await sendEmail({
      to: email,
      subject: 'Email Verification OTP',
      text: `Hello ${name},\n\nYour OTP for email verification is ${otp}.`,
      html: `<p>Hello ${name},</p>
             <p>Your OTP for email verification is <strong>${otp}</strong>.</p>`,
    });

    // Step 6: Return success response
    return new Response(
      JSON.stringify({
        message: 'User created successfully. Please check your email for the OTP to verify your account.',
        userId: user._id,
        success: true
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Server error', 
        error: error.message,
        success: false 
      }),
      { status: 500 }
    );
  }
}