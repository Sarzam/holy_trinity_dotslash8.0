import dbConnect from '@/utils/db';
import User from '@/models/user';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Connect to the database
    await dbConnect();

    // Find the user with the token
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 400 }
      );
    }

    // Mark user as verified and clear the token fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return new Response(
      JSON.stringify({ message: 'Email verified successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'Server error', error: error.message }),
      { status: 500 }
    );
  }
}
