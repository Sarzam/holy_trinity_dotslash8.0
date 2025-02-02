import { NextResponse } from "next/server";
import User from "@/models/user";
import dbConnect from "@/utils/db";
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        await dbConnect();

        const token = request.headers.get('user-data');
        
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "No token provided"
            }, { status: 401 });
        }

        // Decode JWT token to get userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Invalid token"
            }, { status: 401 });
        }

        const userData = await User.findById(userId).select('-password');

        if (!userData) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: userData
        });

    } catch (error) {
        console.error("Error in user info:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to fetch user info"
        }, { status: 500 });
    }
}
