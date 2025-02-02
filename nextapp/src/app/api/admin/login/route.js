import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/admin';
import jwt from 'jsonwebtoken';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(req) {
  try {
    await dbConnect();
    const { identifier, password, location, captchaInput, captchaToken } = await req.json();

    // Verify CAPTCHA
    if (!verifyCaptcha(captchaInput, captchaToken)) {
      return NextResponse.json({ success: false, message: 'Invalid CAPTCHA' }, { status: 400 });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: identifier });
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Update login location and time
    admin.lastLogin = new Date();
    admin.loginLocations.push({
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date()
    });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
