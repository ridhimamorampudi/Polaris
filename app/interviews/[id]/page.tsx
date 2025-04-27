'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Agent from '@/app/components/Agent';

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

export default function InterviewPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [startAgent, setStartAgent] = useState(false);

  useEffect(() => {
    fetch(`/api/interviews/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setInterview(data.interview);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!interview) return <div>Interview not found</div>;

  if (startAgent && session?.user) {
    return (
      <Agent
        userName={session.user.name || 'User'}
        userId={session.user.id}
        interviewId={interview._id}
        feedbackId={null}
        type="interview"
        questions={interview.questions}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{interview.topic} Interview</h1>
      <button
        className="btn-primary"
        onClick={() => setStartAgent(true)}
      >
        Start AI Interview
      </button>
    </div>
  );
} 