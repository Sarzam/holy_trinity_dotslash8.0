import { NextResponse } from 'next/server';
import dbConnect from "@/utils/db";
import User from "@/models/user";
import { verifyUser } from "@/utils/verifyUser";  // Make sure this path is correct

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const userData = await verifyUser(token);
    if (!userData || !userData.userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const updateData = await request.json();

    // First check if user exists
    const existingUser = await User.findById(userData.userId);
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Update user with validation
    const updatedUser = await User.findByIdAndUpdate(
      userData.userId,
      {
        $set: {
          age: updateData.age || existingUser.age,
          gender: updateData.gender || existingUser.gender,
          maritalStatus: updateData.maritalStatus || existingUser.maritalStatus,
          permanentAddress: updateData.permanentAddress || existingUser.permanentAddress,
          currentAddress: updateData.currentAddress || existingUser.currentAddress,
          occupation: updateData.occupation || existingUser.occupation,
          education: updateData.education || existingUser.education,
          isGovernmentEmployee: updateData.isGovernmentEmployee ?? existingUser.isGovernmentEmployee,
          department: updateData.department || existingUser.department,
          spouseName: updateData.spouseName || existingUser.spouseName,
          children: updateData.children || existingUser.children,
          profileCompleted: true
        }
      },
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    console.log('Updated user:', updatedUser); // Debug log

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileno: updatedUser.mobileno,
        gender: updatedUser.gender,
        age: updatedUser.age,
        maritalStatus: updatedUser.maritalStatus,
        permanentAddress: updatedUser.permanentAddress,
        currentAddress: updatedUser.currentAddress,
        occupation: updatedUser.occupation,
        education: updatedUser.education,
        isGovernmentEmployee: updatedUser.isGovernmentEmployee,
        department: updatedUser.department,
        spouseName: updatedUser.spouseName,
        children: updatedUser.children,
        profileCompleted: updatedUser.profileCompleted
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
