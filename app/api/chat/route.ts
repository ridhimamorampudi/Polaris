import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Type for conversation messages
type Message = {
  id: string;
  content: string;
  sender: 'user' | 'counselor';
  timestamp: Date;
}

// Type for conversation
type Conversation = {
  id?: string;
  title: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}

// GET endpoint to fetch all conversations
export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations for the current user
    const conversations = await prisma.conversation.findMany({
      where: {
        userEmail: session.user.email,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST endpoint to save a new conversation or update an existing one
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation } = await request.json() as { conversation: Conversation };
    
    // If id is provided, update the existing conversation
    if (conversation.id) {
      const updatedConversation = await prisma.conversation.update({
        where: {
          id: conversation.id,
          userEmail: session.user.email, // Ensure the conversation belongs to the user
        },
        data: {
          title: conversation.title,
          messages: conversation.messages as any, // We're storing the messages as JSON
          updatedAt: new Date(),
        },
      });
      
      return NextResponse.json({ conversation: updatedConversation });
    } 
    // Otherwise create a new conversation
    else {
      const newConversation = await prisma.conversation.create({
        data: {
          userEmail: session.user.email,
          title: conversation.title || 'New Conversation',
          messages: conversation.messages as any, // We're storing the messages as JSON
        },
      });
      
      return NextResponse.json({ conversation: newConversation });
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
}

// DELETE endpoint to remove a conversation
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Delete the conversation
    await prisma.conversation.delete({
      where: {
        id,
        userEmail: session.user.email, // Ensure the conversation belongs to the user
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
} 