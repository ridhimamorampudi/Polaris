import { NextResponse } from 'next/server';
import FeedbackInterview from '@/models/FeedbackInterview';
import connectDB from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const interviewId = url.searchParams.get('interviewId');
    const userId = url.searchParams.get('userId');
    
    if (!interviewId || !userId) {
      return NextResponse.json(
        { error: 'Interview ID and User ID are required' },
        { status: 400 }
      );
    }
    
    // Find the most recent feedback for this interview by this user
    const feedback = await FeedbackInterview.findOne({ 
      interviewId, 
      userId 
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { interviewId, userId, transcript } = await request.json();
    
    if (!interviewId || !userId || !transcript) {
      return NextResponse.json(
        { error: 'Interview ID, User ID, and transcript are required' },
        { status: 400 }
      );
    }
    
    const feedback = await FeedbackInterview.create({ interviewId, userId, transcript });
    return NextResponse.json({ success: true, feedbackId: feedback._id });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
} 