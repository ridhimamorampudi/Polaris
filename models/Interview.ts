import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, required: true },
  level: { type: String, required: true },
  techstack: [{ type: String }],
  questions: [{ type: String }],
  userId: { type: String, required: true },
  finalized: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const Interview = mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);

export default Interview;
