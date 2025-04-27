import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/lib/auth';
import mongoose from 'mongoose';

// Helper function to ensure ObjectId is properly formatted
function ensureObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (typeof id === 'string') {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

// GET: Fetch all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get active parameter from URL if exists
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    
    // Find user
    const user = await User.findOne({ email: session.user.email }).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Handle case where user has no conversations yet
    // We need to use an explicit cast here because TypeScript doesn't know about our schema
    const userConversations = (user as any).conversations || [];
    
    // Filter conversations if active parameter is provided
    let conversations = userConversations;
    if (isActive !== null) {
      conversations = conversations.filter((convo: any) => 
        convo.isActive === (isActive === 'true')
      );
    }
    
    // Sort by updatedAt in descending order
    conversations.sort((a: any, b: any) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST: Create or update a conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body structure
    if (!body || !body.conversation) {
      return NextResponse.json({ error: 'Invalid request format. Expected {conversation: {...}}' }, { status: 400 });
    }
    
    const { conversation } = body;
    
    // Validate that the conversation has required fields
    if (!conversation.title) {
      return NextResponse.json({ error: 'Conversation requires a title' }, { status: 400 });
    }
    
    // Ensure messages is always an array
    if (!Array.isArray(conversation.messages)) {
      conversation.messages = [];
    }
    
    // Log for debugging
    console.log('Processing conversation:', {
      id: conversation._id,
      title: conversation.title,
      messageCount: conversation.messages.length
    });
    
    await connectDB();
    
    // If an ID is provided, update the existing conversation
    if (conversation._id) {
      const objectId = ensureObjectId(conversation._id);
      console.log(`Attempting to update conversation ${objectId} for user ${session.user.email}`);
      
      const user = await User.findOneAndUpdate(
        { 
          email: session.user.email,
          "conversations._id": objectId
        },
        { 
          $set: {
            "conversations.$.title": conversation.title,
            "conversations.$.messages": conversation.messages,
            "conversations.$.isActive": conversation.isActive ?? true,
            "conversations.$.updatedAt": new Date()
          }
        },
        { new: true } // Return the modified document
      );
      
      console.log('Update result:', user ? `Found user: ${user.email}` : 'User or conversation not found');
      
      if (!user) {
        return NextResponse.json({ error: 'Conversation not found or user mismatch' }, { status: 404 });
      }
      
      // Find the updated conversation to return it
      const updatedConversation = user.conversations.find(
        (c: any) => c._id.toString() === objectId.toString()
      );
      console.log('Returning updated conversation:', updatedConversation?._id);
      return NextResponse.json({ conversation: updatedConversation });
    } 
    // Otherwise create a new conversation
    else {
      const newConversationId = new mongoose.Types.ObjectId();
      console.log(`Attempting to create new conversation ${newConversationId} for user ${session.user.email}`);
      
      const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { 
          $push: { 
            conversations: {
              _id: newConversationId,
              title: conversation.title || 'New Conversation',
              messages: conversation.messages,
              isActive: conversation.isActive ?? true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        },
        { new: true, upsert: false } // Don't create user if not found, return updated doc
      );
      
      console.log('Create result:', user ? `Found user: ${user.email}` : 'User not found');
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Find the newly created conversation
      const newConversation = user.conversations.find(
        (c: any) => c._id.toString() === newConversationId.toString()
      );
      console.log('Returning new conversation:', newConversation?._id);
      return NextResponse.json({ conversation: newConversation });
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
}

// PATCH: Update conversation properties (e.g., mark as inactive/archived)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isActive } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    await connectDB();

    // Convert string ID to ObjectId if needed
    const objectId = ensureObjectId(id);

    // Use MongoDB positional $ operator to update specific conversation property
    const user = await User.findOneAndUpdate(
      { 
        email: session.user.email,
        "conversations._id": objectId
      },
      { 
        $set: {
          "conversations.$.isActive": isActive,
          "conversations.$.updatedAt": new Date()
        }
      },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    
    // Find the updated conversation
    const updatedConversation = user.conversations.find(
      (c: any) => c._id.toString() === id
    );
    
    return NextResponse.json({ conversation: updatedConversation });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// DELETE: Remove a conversation (or archive it by setting isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const archive = searchParams.get('archive');

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    await connectDB();

    // Convert string ID to ObjectId if needed
    const objectId = ensureObjectId(id);

    // If archive=true, mark as inactive instead of deleting
    if (archive === 'true') {
      const user = await User.findOneAndUpdate(
        { 
          email: session.user.email,
          "conversations._id": objectId
        },
        { 
          $set: {
            "conversations.$.isActive": false,
            "conversations.$.updatedAt": new Date()
          }
        },
        { new: true }
      );
      
      if (!user) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, archived: true });
    } else {
      // Hard delete by pulling the conversation from the array
      const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { $pull: { conversations: { _id: objectId } } },
        { new: true }
      );
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, deleted: true });
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
} 