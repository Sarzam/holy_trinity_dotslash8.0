import { NextResponse } from 'next/server';
import User from '@/models/user';
import RecommendedPolicy from '@/models/recommendpolicies';
import VotingPolicy from '@/models/votepolicies';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ageGroup = searchParams.get('ageGroup');
  const gender = searchParams.get('gender');
  const occupation = searchParams.get('occupation');
  const education = searchParams.get('education');

  try {
    // Build age filter
    let ageFilter = {};
    if (ageGroup !== 'all') {
      const [min, max] = ageGroup.split('-');
      ageFilter = { age: { $gte: parseInt(min), $lte: parseInt(max) } };
    }

    // Build gender filter
    let genderFilter = {};
    if (gender !== 'all') {
      genderFilter = { gender };
    }

    // Build occupation filter
    let occupationFilter = {};
    if (occupation !== 'all') {
      occupationFilter = { occupation };
    }

    // Build education filter
    let educationFilter = {};
    if (education !== 'all') {
      educationFilter = { education };
    }

    const userStats = await User.aggregate([
      { 
        $match: { 
          ...ageFilter, 
          ...genderFilter,
          ...occupationFilter,
          ...educationFilter 
        } 
      },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const recommendationStats = await RecommendedPolicy.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const votingPoliciesStats = await VotingPolicy.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const policyVoteStats = await VotingPolicy.aggregate([
      {
        $project: {
          title: 1,
          yesVotes: '$votes.yes',
          noVotes: '$votes.no'
        }
      }
    ]);

    const locationData = await User.aggregate([
      { 
        $match: { 
          ...ageFilter, 
          ...genderFilter,
          ...occupationFilter,
          ...educationFilter,
          'location.latitude': { $exists: true },
          'location.longitude': { $exists: true }
        } 
      },
      {
        $group: {
          _id: {
            lat: '$location.latitude',
            lng: '$location.longitude'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const occupationStats = await User.aggregate([
      { 
        $match: { 
          ...ageFilter, 
          ...genderFilter,
          occupation: { $exists: true }
        } 
      },
      {
        $group: {
          _id: '$occupation',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort by occupation name
      }
    ]);

    return NextResponse.json({
      userStats,
      recommendationStats,
      votingPoliciesStats,
      policyVoteStats,
      locationData,
      occupationStats
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
