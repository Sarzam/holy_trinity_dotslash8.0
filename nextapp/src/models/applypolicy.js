import mongoose from 'mongoose';

const policyApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    justification: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

let PolicyApplication;

try {
  PolicyApplication = mongoose.models.PolicyApplication || mongoose.model('PolicyApplication', policyApplicationSchema);
} catch (error) {
  console.error("Error while checking or defining PolicyApplication model: ", error);
  throw error;
}

export default PolicyApplication;
