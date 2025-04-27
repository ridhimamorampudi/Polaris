import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/lib/auth';
import mongoose from 'mongoose';

// Tell Next.js this route should be dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }  
        }
      );
    }

    await connectDB();
    
    // Find the user and their conversations
    const user = await User.findOne({ email: session.user.email }).lean() as any;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create a test conversation if none exist
    if (!user.conversations || user.conversations.length === 0) {
      const testConversation = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Test Conversation',
        messages: [
          {
            content: 'This is a test message',
            sender: 'user',
            timestamp: new Date()
          },
          {
            content: 'This is a test response',
            sender: 'assistant',
            timestamp: new Date()
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add the test conversation
      await User.findOneAndUpdate(
        { email: session.user.email },
        { $push: { conversations: testConversation } }
      );
      
      return NextResponse.json({ 
        message: 'Created test conversation',
        conversationId: testConversation._id,
        userBefore: {
          name: user.name,
          email: user.email,
          hasConversations: false
        }
      });
    }
    
    // Return information about existing conversations
    return NextResponse.json({
      message: 'User already has conversations',
      userInfo: {
        name: user.name,
        email: user.email,
        conversationCount: user.conversations.length
      },
      conversationSummary: user.conversations.map((c: any) => ({
        id: c._id.toString(),
        title: c.title,
        messageCount: c.messages.length,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      })),
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
    
  } catch (error) {
    console.error('Test conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to test conversations', details: (error as Error).message },
      { status: 500 }
    );
  }
} 