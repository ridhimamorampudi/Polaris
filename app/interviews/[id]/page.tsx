'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

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

interface Answer {
  question: string;
  answer: string;
}

export default function InterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    fetchInterview();
  }, [params.id]);

  const fetchInterview = async () => {
    try {
      const response = await fetch(`/api/interviews/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch interview');
      const data = await response.json();
      setInterview(data.interview);
      setAnswers(data.interview.questions.map((q: string) => ({ question: q, answer: '' })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interview');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);
    } catch (err) {
      setError('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < interview!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            {error || 'Interview not found'}
          </h2>
          <button
            onClick={() => router.push('/interviews')}
            className="btn-primary"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {interview.topic} Interview
              </h1>
              <p className="text-text-secondary">
                {interview.role} - {interview.level} Level
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-secondary">
                  Question {currentQuestionIndex + 1} of {interview.questions.length}
                </span>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 ${
                    isRecording ? 'text-red-500' : 'text-primary'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <FiMicOff className="w-5 h-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <FiMic className="w-5 h-5" />
                      Start Recording
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-text-primary">
                    {interview.questions[currentQuestionIndex]}
                  </h2>
                  <textarea
                    value={answers[currentQuestionIndex].answer}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestionIndex].answer = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    className="input-field w-full min-h-[200px]"
                    placeholder="Type your answer here..."
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn-secondary flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === interview.questions.length - 1}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 