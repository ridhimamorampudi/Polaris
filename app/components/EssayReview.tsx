'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiCheck, FiLoader } from 'react-icons/fi';

interface EssayFeedback {
  structure: string;
  tone: string;
  grammar: string;
  emotionalEngagement: string;
  strengths: string[];
  weaknesses: string[];
}

const EssayReview: React.FC = () => {
  const [essayPrompt, setEssayPrompt] = useState('');
  const [wordCount, setWordCount] = useState('');
  const [essayText, setEssayText] = useState('');
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!essayText.trim() || !essayPrompt.trim()) {
      setError('Please provide both the essay prompt and your essay text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/essay-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: essayPrompt,
          essay: essayText,
          wordCount: parseInt(wordCount) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary">Essay Review</h1>
          <p className="mt-2 text-xl text-text-secondary">Get AI-powered feedback on your college essay</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm animate-fadeIn border-l-4 border-red-500">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Essay Details Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Essay Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Essay Prompt
                </label>
                <textarea
                  value={essayPrompt}
                  onChange={(e) => setEssayPrompt(e.target.value)}
                  placeholder="Enter the essay prompt"
                  className="w-full input-field min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Word Count
                </label>
                <input
                  type="number"
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  placeholder="Enter word count"
                  className="input-field w-32"
                />
              </div>
            </div>
          </div>

          {/* Essay Text Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Your Essay</h2>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Paste your essay here"
              className="w-full input-field min-h-[300px] text-lg"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-4 btn-primary flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
              {loading ? 'Analyzing...' : 'Get Feedback'}
            </button>
          </div>

          {/* Feedback Section */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-4">AI Feedback</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Structure</h3>
                  <p className="text-text-secondary">{feedback.structure}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Tone</h3>
                  <p className="text-text-secondary">{feedback.tone}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Grammar</h3>
                  <p className="text-text-secondary">{feedback.grammar}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Emotional Engagement</h3>
                  <p className="text-text-secondary">{feedback.emotionalEngagement}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Strengths</h3>
                  <ul className="list-disc list-inside text-text-secondary space-y-1">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Areas for Improvement</h3>
                  <ul className="list-disc list-inside text-text-secondary space-y-1">
                    {feedback.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EssayReview; 