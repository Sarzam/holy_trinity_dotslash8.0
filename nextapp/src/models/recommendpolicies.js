import mongoose from 'mongoose';

const recommendedPolicySchema = new mongoose.Schema({
  title: String,
  description: String,
  details: String,
  category: {
    type: String,
    enum: ['health', 'life', 'vehicle', 'property', 'retirement', 'child'],
    default: 'life'
  },
  priority: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

const RecommendedPolicy = mongoose.models.RecommendedPolicy || mongoose.model('RecommendedPolicy', recommendedPolicySchema);

export default RecommendedPolicy;
