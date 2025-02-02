import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import mongoose from 'mongoose';
import ApplyPolicy from '@/models/applypolicy'; // Make sure this model exists

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { policyId } = params;
    const { status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return NextResponse.json(
        { error: 'Invalid policy ID' },
        { status: 400 }
      );
    }

    const updatedPolicy = await ApplyPolicy.findByIdAndUpdate(
      policyId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true } // Return the updated document
    );

    if (!updatedPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      status,
      policy: updatedPolicy 
    });

  } catch (error) {
    console.error('Error updating policy status:', error);
    return NextResponse.json(
      { error: 'Failed to update policy status' },
      { status: 500 }
    );
  }
}
