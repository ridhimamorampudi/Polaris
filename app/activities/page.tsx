'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Image from 'next/image'

type Activity = {
  id: string
  title: string
  description: string
  image: string
  category: string
}

const suggestedActivities: Activity[] = [
  {
    id: '1',
    title: 'Student Government',
    description: 'Develop leadership skills and make a difference in your school community.',
    image: '/activities/student-gov.svg',
    category: 'Leadership'
  },
  {
    id: '2',
    title: 'Science Olympiad',
    description: 'Compete in science competitions and develop research skills.',
    image: '/activities/science.svg',
    category: 'Academic'
  },
  {
    id: '3',
    title: 'Community Service Club',
    description: 'Give back to your community through organized volunteer work.',
    image: '/activities/community.svg',
    category: 'Service'
  },
  {
    id: '4',
    title: 'Debate Team',
    description: 'Enhance public speaking and critical thinking abilities.',
    image: '/activities/debate.svg',
    category: 'Academic'
  },
  {
    id: '5',
    title: 'Environmental Club',
    description: 'Work on sustainability projects and environmental awareness.',
    image: '/activities/environment.svg',
    category: 'Service'
  },
  {
    id: '6',
    title: 'Robotics Club',
    description: 'Build and program robots while learning engineering principles.',
    image: '/activities/robotics.svg',
    category: 'STEM'
  }
]

export default function ActivityPlanner() {
  const [selectedActivities, setSelectedActivities] = React.useState<string[]>([])
  const [filter, setFilter] = React.useState<string>('all')

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        toast.success('Activity removed from your list')
        return prev.filter(id => id !== activityId)
      } else {
        toast.success('Activity added to your list')
        return [...prev, activityId]
      }
    })
  }

  const filteredActivities = filter === 'all'
    ? suggestedActivities
    : suggestedActivities.filter(activity => activity.category === filter)

  const categories = ['all', ...Array.from(new Set(suggestedActivities.map(a => a.category)))]

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">Activity Planner</h1>
            <p className="mt-2 text-text-secondary">
              Based on your interests, we recommend these activities
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center space-x-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map(activity => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card overflow-hidden"
              >
                <div className="relative h-48 bg-gray-100 rounded-t-lg">
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {activity.title}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-accent bg-opacity-10 text-accent mt-2">
                        {activity.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleActivityToggle(activity.id)}
                      className={`p-2 rounded-full transition-colors ${
                        selectedActivities.includes(activity.id)
                          ? 'text-primary bg-primary bg-opacity-10'
                          : 'text-text-secondary hover:text-primary'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {selectedActivities.includes(activity.id) ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className="mt-4 text-text-secondary">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedActivities.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  toast.success('Activities saved! Ready for essay review.')
                  window.location.href = '/essay'
                }}
                className="btn-primary"
              >
                Continue to Essay Review
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 