import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Types
type Message = {
  id?: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type Conversation = {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

type ConversationHistoryProps = {
  onLoadConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  currentConversationId?: string;
}

export default function ConversationHistory({ 
  onLoadConversation, 
  onNewConversation,
  currentConversationId
}: ConversationHistoryProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch conversations when component mounts or session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchConversations();
    }
  }, [session]);

  // Fetch conversations from the API
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/conversations?active=true');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load your conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/conversations?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      toast.success('Conversation deleted');
      
      // Refresh the conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Archive a conversation instead of deleting it
  const archiveConversation = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/conversations?id=${id}&archive=true`, {
        method: 'DELETE', 
      });
      
      if (!response.ok) {
        throw new Error('Failed to archive conversation');
      }
      
      toast.success('Conversation archived');
      
      // Refresh the conversation list
      fetchConversations();
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to restart conversation (keep title but clear messages)
  const restartConversation = (conversation: Conversation) => {
    // Create a copy with the same properties but empty messages array
    const restartedConvo = {
      ...conversation,
      messages: []
    };
    
    onLoadConversation(restartedConvo);
  };

  return (
    <div className="space-y-4">
      {/* History and New Chat Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowHistory(prev => !prev)}
          className="btn-secondary flex items-center"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        
        <button
          onClick={onNewConversation}
          className="btn-primary flex items-center"
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Conversation
        </button>
      </div>
      
      {/* History Section */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-lg font-semibold p-4 border-b">Your Conversation History</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="loader"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-text-secondary">
                  <p>You don't have any saved conversations yet.</p>
                  <p className="text-sm mt-2">Start chatting to save your first conversation!</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {conversations.map((convo) => (
                    <div 
                      key={convo._id} 
                      className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                        currentConversationId === convo._id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-medium text-text-primary truncate">{convo.title}</h3>
                          <p className="text-xs text-text-secondary">
                            {formatDate(convo.updatedAt || convo.createdAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onLoadConversation(convo)}
                            className="text-primary hover:text-primary-dark"
                            title="Load conversation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => restartConversation(convo)}
                            className="text-green-500 hover:text-green-700"
                            title="Restart conversation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteConversation(convo._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete conversation"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 