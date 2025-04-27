import mongoose from 'mongoose';

const FeedbackInterviewSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  userId: { type: String, required: true },
  transcript: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'feedback-interview' });

export default mongoose.models.FeedbackInterview || mongoose.model('FeedbackInterview', FeedbackInterviewSchema);