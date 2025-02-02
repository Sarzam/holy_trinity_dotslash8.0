import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import RecommendedPolicy from "@/models/recommendpolicies";
import User from "@/models/user"; // Import User model
import axios from "axios"; // Import axios for making requests to Flask server
import jwt from "jsonwebtoken"; // Import jwt for decoding the token

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get user profile from query params
    const { searchParams } = new URL(request.url);
    const age = searchParams.get('age');
    const occupation = searchParams.get('occupation');
    const maritalStatus = searchParams.get('maritalStatus');

    // Initialize if empty
    const count = await RecommendedPolicy.countDocuments();
    if (count === 0 && Array.isArray(policies)) {
      const initialPolicies = policies.map(policy => ({
        title: policy.title,
        description: policy.description,
        details: policy.details,
        category: policy.category || 'life',
        priority: Math.floor(Math.random() * 5) + 1,
        ageRange: policy.ageRange || { min: 18, max: 70 },
        suitableFor: policy.suitableFor || []
      }));
      await RecommendedPolicy.insertMany(initialPolicies);
    }

    // Build query based on user profile
    let query = {};
    if (age) {
      query['ageRange.min'] = { $lte: parseInt(age) };
      query['ageRange.max'] = { $gte: parseInt(age) };
    }
    if (occupation) {
      query.suitableFor = occupation;
    }
    if (maritalStatus) {
      query.maritalStatus = maritalStatus;
    }

    const recommendedPolicies = await RecommendedPolicy.find(query);
    return NextResponse.json({ success: true, policies: recommendedPolicies });
  } catch (error) {
    console.error("Error fetching recommended policies:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch recommended policies" });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { message, userId } = await request.json();

    // Decode the JWT token to extract the userId
    const decodedToken = jwt.verify(userId, process.env.JWT_SECRET);
    const userIdFromToken = decodedToken.userId;

    // Fetch user profile from the database
    const user = await User.findById(userIdFromToken);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Collect user information
    const userInfo = {
      name: user.name,
      age: user.age,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      occupation: user.occupation,
      education: user.education,
      isGovernmentEmployee: user.isGovernmentEmployee,
      children: user.children,
      location: {
        latitude: user.location?.latitude,
        longitude: user.location?.longitude,
      },
    };

    // Log the built object
    console.log("Built user info object:", userInfo);

    // Send data to Flask server
    const flaskResponse = await axios.post("http://localhost:5000/recommend_policies", {
      user_data: userInfo,
      user_query: message
    });

    if (flaskResponse.data.relevant_policies) {
      return NextResponse.json({
        success: true,
        policies: flaskResponse.data.relevant_policies,
        reply: flaskResponse.data.relevant_policies.join('\n') // Ensure reply is a string
      });
    } else {
      return NextResponse.json({ success: false, message: "Flask server error" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    return NextResponse.json({ success: false, message: "Failed to process request" });
  }
}