import { NextResponse } from 'next/server';
import FeedbackInterview from '@/models/FeedbackInterview';
import connectDB from '@/lib/mongodb';

export async function POST(request: Request) {
  await connectDB();
  const { interviewId, userId, transcript } = await request.json();
  const feedback = await FeedbackInterview.create({ interviewId, userId, transcript });
  return NextResponse.json({ success: true, feedbackId: feedback._id });
} 