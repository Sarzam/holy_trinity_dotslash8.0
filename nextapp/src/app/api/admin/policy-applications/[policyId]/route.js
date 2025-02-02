import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PolicyApplication from '@/models/applypolicy';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { policyId } = params;
    const { status } = await request.json();

    const updatedPolicy = await PolicyApplication.findByIdAndUpdate(
      policyId,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!updatedPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating policy status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
