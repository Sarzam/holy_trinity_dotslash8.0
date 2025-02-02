import dbConnect from "@/utils/db";
import User from "@/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { identifier, password, captchaInput, captchaToken, location } = await req.json();
    
    console.log('Received login request with location:', location);

    if (!location || !location.latitude || !location.longitude) {
      console.error('Missing location data:', location);
      return new Response(
        JSON.stringify({ message: "Location data is required.", success: false }),
        { status: 400 }
      );
    }

    // Validate CAPTCHA
    if (!global.captchaStore || !global.captchaStore[captchaToken]) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired CAPTCHA.", success: false }),
        { status: 400 }
      );
    }

    if (global.captchaStore[captchaToken] !== captchaInput) {
      delete global.captchaStore[captchaToken]; // Clear the token after one attempt
      return new Response(
        JSON.stringify({ message: "Incorrect CAPTCHA.", success: false }),
        { status: 400 }
      );
    }

    // Clear CAPTCHA after validation
    delete global.captchaStore[captchaToken];

    // Validate user credentials
    await dbConnect();
    console.log('Finding user with identifier:', identifier);
    
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      console.log('User not found with identifier:', identifier);
      return new Response(
        JSON.stringify({ message: "User not found.", success: false }),
        { status: 404 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ message: "Incorrect password.", success: false }),
        { status: 401 }
      );
    }

    console.log('User found, updating location for user ID:', user._id);

    // Update user's location and login history
    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          lastLoginAt: new Date(),
          lastLoginLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp,
            accuracy: location.accuracy
          }
        },
        $push: {
          loginHistory: {
            timestamp: new Date(),
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy
            },
            deviceInfo: {
              userAgent: req.headers.get('user-agent'),
              ip: req.headers.get('x-forwarded-for') || 'unknown'
            }
          }
        }
      },
      { new: true } // Return updated document
    );

    console.log('Location update result:', updateResult.lastLoginLocation);

    // Generate JWT with location info
    const token = jwt.sign(
      { 
        userId: user._id,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString()
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Modify the response to include only basic info
    return new Response(
      JSON.stringify({
        success: true,
        token,
        location: updateResult.lastLoginLocation,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobileno: user.mobileno,
          profileCompleted: user.profileCompleted
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error.",
        success: false,
        error: error.message
      }),
      { status: 500 }
    );
  }
}
