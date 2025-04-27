'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import ConversationHistory from '@/app/components/ConversationHistory';
import { v4 as uuidv4 } from 'uuid';

// Types
type Message = {
  id?: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type Conversation = {
  _id?: string;
  title: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

// Welcome messages shown to new users
const WELCOME_MESSAGES: Message[] = [
  {
    id: uuidv4(),
    content: "Hello! I'm your AI assistant. How can I help you today?",
    sender: 'assistant',
    timestamp: new Date()
  }
];

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user is authenticated and initialize conversation
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // If no current conversation, create a new one or load most recent
      if (!currentConversation) {
        initializeConversation();
      }
    }
  }, [status, session, currentConversation]);

  // Initialize conversation - either load most recent or create new
  const initializeConversation = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch most recent conversation
      const response = await fetch('/api/conversations?active=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      const conversations = data.conversations || [];
      
      if (conversations.length > 0) {
        // Load most recent conversation
        const mostRecent = conversations[0];
        setCurrentConversation(mostRecent);
        setMessages(mostRecent.messages && mostRecent.messages.length > 0 
          ? mostRecent.messages 
          : WELCOME_MESSAGES);
      } else {
        // Create a new conversation
        createNewConversation();
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to load conversation');
      createNewConversation();
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async () => {
    if (!session?.user?.email) return;
    
    try {
      setIsLoading(true);
      
      const newConversation: Conversation = {
        title: 'New Conversation',
        messages: WELCOME_MESSAGES,
        isActive: true
      };
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation: newConversation }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const data = await response.json();
      setCurrentConversation(data.conversation);
      setMessages(WELCOME_MESSAGES);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create new conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Load an existing conversation
  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    
    // If messages array is empty (restart case), use welcome messages
    if (!conversation.messages || conversation.messages.length === 0) {
      setMessages(WELCOME_MESSAGES);
    } else {
      setMessages(conversation.messages);
    }
  };

  // Handle sending a message
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !session?.user?.email || !currentConversation) return;
    
    // Create new user message
    const userMessage: Message = {
      id: uuidv4(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    // Add user message to state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Here you would typically make an API call to get an AI response
      // For this example, we'll simulate a response
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: uuidv4(),
          content: "This is a simulated AI response. In a real app, you would call your AI API here.",
          sender: 'assistant',
          timestamp: new Date()
        };
        
        const messagesWithAiResponse = [...updatedMessages, aiMessage];
        setMessages(messagesWithAiResponse);
        
        // Update the conversation in the database
        saveConversation(messagesWithAiResponse);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsLoading(false);
    }
  };

  // Save conversation to database
  const saveConversation = async (currentMessages: Message[]) => {
    if (!session?.user?.email || !currentConversation) return;
    
    try {
      console.log('Saving conversation:', currentConversation._id);
      
      // Create a title from the first user message if it doesn't have one
      let title = currentConversation.title;
      if (title === 'New Conversation') {
        const firstUserMessage = currentMessages.find(m => m.sender === 'user');
        if (firstUserMessage) {
          title = firstUserMessage.content.length > 30 
            ? firstUserMessage.content.substring(0, 30) + '...' 
            : firstUserMessage.content;
        }
      }
      
      const conversationToSave: Conversation = {
        _id: currentConversation._id,
        title,
        messages: currentMessages,
        isActive: true
      };
      
      console.log('Sending to API:', JSON.stringify({
        _id: conversationToSave._id,
        title: conversationToSave.title,
        messagesCount: conversationToSave.messages.length
      }));
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation: conversationToSave }),
      });
      
      const responseText = await response.text();
      console.log('API Response status:', response.status);
      console.log('API Response:', responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to save conversation: ${responseText}`);
      }
      
      // Parse the response as JSON
      const data = JSON.parse(responseText);
      setCurrentConversation(data.conversation);
      
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error('Failed to save conversation');
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Chat Assistant</h1>
        
        {/* Conversation History Component */}
        <ConversationHistory 
          onLoadConversation={loadConversation}
          onNewConversation={createNewConversation}
          currentConversationId={currentConversation?._id}
        />
        
        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-md mt-6 flex flex-col h-[600px]">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={message.id || index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 text-right opacity-75">
                    {formatTime(new Date(message.timestamp))}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || status !== 'authenticated'}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !input.trim() || status !== 'authenticated'}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Send'
                )}
              </button>
            </div>
            {status !== 'authenticated' && (
              <p className="text-center mt-2 text-sm text-red-500">
                Please sign in to start a conversation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 