'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlus, FiPlay, FiList } from 'react-icons/fi';

interface Interview {
  _id: string;
  topic: string;
  role: string;
  type: string;
  level: string;
  techstack: string[];
  questions: string[];
  createdAt: string;
}

export default function InterviewsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackAvailable, setFeedbackAvailable] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (session?.user?.id) {
      fetchInterviews();
    }
  }, [session]);

  // Check feedback availability whenever interviews are loaded
  useEffect(() => {
    if (interviews.length > 0 && session?.user?.id) {
      checkFeedbackAvailability();
    }
  }, [interviews, session?.user?.id]);

  const fetchInterviews = async () => {
    try {
      const response = await fetch(`/api/interviews?userId=${session?.user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch interviews');
      const data = await response.json();
      setInterviews(data.interviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const checkFeedbackAvailability = async () => {
    try {
      if (!session?.user?.id) return;

      const feedbackStatus: Record<string, boolean> = {};

      // Using Promise.all to fetch feedback status for all interviews in parallel
      if (interviews.length > 0) {
        await Promise.all(
          interviews.map(async (interview) => {
            const res = await fetch(`/api/feedback?interviewId=${interview._id}&userId=${session.user.id}`);
            if (res.ok) {
              const data = await res.json();
              feedbackStatus[interview._id] = !!data.feedback;
            }
          })
        );
        setFeedbackAvailable(feedbackStatus);
      }
    } catch (error) {
      console.error('Error checking feedback availability:', error);
    }
  };

  const handleCreateInterview = () => {
    router.push('/interviews/new');
  };

  const handleStartInterview = (interviewId: string) => {
    router.push(`/interviews/${interviewId}`);
  };

  const handleViewQuestionsOrFeedback = (interviewId: string) => {
    if (feedbackAvailable[interviewId]) {
      router.push(`/interviews/${interviewId}/feedback`);
    } else {
      // If no feedback, redirect to questions or some other view
      router.push(`/interviews/${interviewId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary">My Interviews</h1>
          <button
            onClick={handleCreateInterview}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            New Interview
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-text-secondary mb-4">
              No interviews yet
            </h2>
            <p className="text-text-secondary mb-6">
              Create your first interview to get started
            </p>
            <button
              onClick={handleCreateInterview}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <FiPlus className="w-5 h-5" />
              Create Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {interview.topic}
                  </h3>
                  <div className="space-y-2 text-text-secondary">
                    <p>
                      <span className="font-medium">Role:</span> {interview.role}
                    </p>
                    <p>
                      <span className="font-medium">Level:</span> {interview.level}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span> {interview.type}
                    </p>
                    <div>
                      <span className="font-medium">Tech Stack:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {interview.techstack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => handleStartInterview(interview._id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FiPlay className="w-4 h-4" />
                      Start Interview
                    </button>
                    <button
                      onClick={() => handleViewQuestionsOrFeedback(interview._id)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FiList className="w-4 h-4" />
                      View Questions
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 