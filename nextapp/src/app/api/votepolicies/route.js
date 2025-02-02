import { NextResponse } from 'next/server';
import Policy from '@/models/votepolicies';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const policies = await Policy.find(
      { status: 'active' },
      'title shortDescription description category votingStartDate votingEndDate status'
    );
    return NextResponse.json(policies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { policyId, vote } = await req.json();
    const policy = await Policy.findById(policyId);

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    if (policy.hasUserVoted(session.user.id)) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    await policy.recordVote(session.user.id, vote);
    return NextResponse.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
