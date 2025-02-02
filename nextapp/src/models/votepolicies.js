import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Environment', 'Healthcare', 'Technology', 'Education', 'Economy'],
    required: true
  },
  votingStartDate: {
    type: Date,
    required: true
  },
  votingEndDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  votes: {
    yes: {
      type: Number,
      default: 0,
      select: false // Hidden from regular queries
    },
    no: {
      type: Number,
      default: 0,
      select: false // Hidden from regular queries
    }
  },
  votedUsers: {
    type: Map,
    of: {
      vote: String,
      votedAt: {
        type: Date,
        default: Date.now
      }
    },
    select: false // Hide from regular queries
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add method to check if user has voted
policySchema.methods.hasUserVoted = function(userId) {
  return this.votedUsers.has(userId.toString());
};

// Add method to record vote
policySchema.methods.recordVote = function(userId, vote) {
  if (this.hasUserVoted(userId)) {
    throw new Error('User has already voted');
  }
  this.votedUsers.set(userId.toString(), { vote });
  this.votes[vote]++;
  return this.save();
};

export default mongoose.models.Policy || mongoose.model('Policy', policySchema);
