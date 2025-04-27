'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Interest {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface CurrentActivity {
  name: string;
  type: 'club' | 'leadership' | 'internship' | 'competition';
  description: string;
}

interface Suggestion {
  name: string;
  type: 'club' | 'leadership' | 'internship' | 'competition';
  description: string;
  technologies?: string[];
  spikePotential: boolean;
  spikeExplanation?: string;
}

// Color mapping for activity types
const activityTypeColors = {
  club: 'bg-purple-100 text-purple-800',
  leadership: 'bg-blue-100 text-blue-800',
  internship: 'bg-green-100 text-green-800',
  competition: 'bg-orange-100 text-orange-800',
};

// Color mapping for interest levels
const interestLevelColors = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const ActivityPlanner: React.FC = () => {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [currentActivities, setCurrentActivities] = useState<CurrentActivity[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newInterest, setNewInterest] = useState('');
  const [newInterestLevel, setNewInterestLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [newActivity, setNewActivity] = useState<Partial<CurrentActivity>>({
    name: '',
    type: 'club',
    description: ''
  });

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setInterests([...interests, { name: newInterest, level: newInterestLevel }]);
      setNewInterest('');
      setNewInterestLevel('beginner');
    }
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleAddActivity = () => {
    if (newActivity.name?.trim() && newActivity.description?.trim()) {
      setCurrentActivities([...currentActivities, newActivity as CurrentActivity]);
      setNewActivity({ name: '', type: 'club', description: '' });
    }
  };

  const handleRemoveActivity = (index: number) => {
    setCurrentActivities(currentActivities.filter((_, i) => i !== index));
  };

  const handleGetSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests, currentActivities }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
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
          <h1 className="text-4xl font-bold text-text-primary">Activity Planner</h1>
          <p className="mt-2 text-xl text-text-secondary">Discover personalized opportunities to develop your interests and build expertise</p>
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
          {/* Interests Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Your Interests</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add a new interest"
                  className="flex-1 input-field text-xl py-4 px-4"
                />
                <select
                  value={newInterestLevel}
                  onChange={(e) => setNewInterestLevel(e.target.value as any)}
                  className="input-field text-sm py-2 w-32"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  onClick={handleAddInterest}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiPlus /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary bg-opacity-10 rounded-lg px-3 py-1 flex items-center gap-2"
                  >
                    <span className="text-text-primary">{interest.name}</span>
                    <span className="text-text-secondary text-sm">({interest.level})</span>
                    <button
                      onClick={() => handleRemoveInterest(index)}
                      className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Activities Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Current Activities</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  placeholder="Activity name"
                  className="input-field"
                />
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="club">Club</option>
                  <option value="leadership">Leadership</option>
                  <option value="internship">Internship</option>
                  <option value="competition">Competition</option>
                </select>
              </div>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Activity description"
                className="w-full input-field min-h-[100px]"
              />
              <button
                onClick={handleAddActivity}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus /> Add Activity
              </button>
              <div className="space-y-4">
                {currentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary bg-opacity-10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-text-primary font-medium">{activity.name}</h3>
                        <p className="text-text-secondary text-sm">{activity.type}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveActivity(index)}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                    <p className="text-text-secondary mt-2">{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-text-primary">Personalized Suggestions</h2>
              <button
                onClick={handleGetSuggestions}
                disabled={loading || interests.length === 0}
                className={`btn-primary flex items-center gap-2 ${
                  loading || interests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
                {loading ? 'Generating...' : 'Get Suggestions'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary bg-opacity-10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-text-primary font-medium">{suggestion.name}</h3>
                      <p className="text-text-secondary text-sm">{suggestion.type}</p>
                    </div>
                    {suggestion.spikePotential && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Spike Potential
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary mt-2">{suggestion.description}</p>
                  {suggestion.technologies && suggestion.technologies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestion.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="bg-primary bg-opacity-10 text-text-primary text-xs px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {suggestion.spikeExplanation && (
                    <div className="mt-3 bg-primary bg-opacity-5 rounded-lg p-3">
                      <p className="text-text-secondary text-sm">{suggestion.spikeExplanation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityPlanner; 