import dbConnect from '@/utils/db';
import User from '@/models/user';
import { sendEmail } from '@/utils/sendEmail'; // Assuming you have an email utility
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Connect to the database
    await dbConnect();

    if (!email) {
      return new Response(
        JSON.stringify({ message: 'Email is required', success: false }),
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found with this email', success: false }),
        { status: 404 }
      );
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = resetToken;
    user.verificationExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&email=${email}`;
    const emailSent = await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    });
    if (emailSent) {
      return new Response(
        JSON.stringify({ message: 'Password reset email sent', success: true }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ message: 'Failed to send reset email', success: false }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'Server error', error: error.message, success: false }),
      { status: 500 }
    );
  }
}
