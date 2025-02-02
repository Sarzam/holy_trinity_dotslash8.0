import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import PolicyApplication from '@/models/applypolicy';

export async function GET() {
  try {
    await dbConnect();
    
    const applications = await PolicyApplication.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching policy applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
