import { NextResponse } from 'next/server';
import VotingPolicy from '@/models/votepolicies';

export async function GET() {
  try {
    // Get unique categories from the voting policies model
    const categories = ['Environment', 'Healthcare', 'Technology', 'Education', 'Economy'];
    
    return NextResponse.json({
      categories
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
