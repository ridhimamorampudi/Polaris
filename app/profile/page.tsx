'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProfileSetup() {
  const [formData, setFormData] = React.useState({
    name: '',
    gpa: '',
    satAct: '',
    apCourses: [] as string[],
    activities: [] as string[],
    interests: [] as string[],
  })

  const [step, setStep] = React.useState(1)
  const totalSteps = 5

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagInput = (field: 'apCourses' | 'activities' | 'interests', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeTag = (field: 'apCourses' | 'activities' | 'interests', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < totalSteps) {
      setStep(prev => prev + 1)
    } else {
      // Here you would typically save the data to your backend
      toast.success('Profile saved successfully!')
      // Navigate to college list page
      window.location.href = '/colleges'
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-text-secondary">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Basic Information</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="gpa" className="block text-sm font-medium text-text-secondary">
                    GPA
                  </label>
                  <input
                    type="number"
                    id="gpa"
                    name="gpa"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Test Scores</h2>
                <div>
                  <label htmlFor="satAct" className="block text-sm font-medium text-text-secondary">
                    SAT/ACT Score (Optional)
                  </label>
                  <input
                    type="number"
                    id="satAct"
                    name="satAct"
                    value={formData.satAct}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                    placeholder="Enter your score"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">AP Courses</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Add AP Courses
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleTagInput('apCourses', (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.apCourses.map((course, index) => (
                      <span key={index} className="tag">
                        {course}
                        <button
                          type="button"
                          onClick={() => removeTag('apCourses', index)}
                          className="ml-2 text-text-secondary hover:text-text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Activities</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Add Activities
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleTagInput('activities', (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.activities.map((activity, index) => (
                      <span key={index} className="tag">
                        {activity}
                        <button
                          type="button"
                          onClick={() => removeTag('activities', index)}
                          className="ml-2 text-text-secondary hover:text-text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary">Interests</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Add Interests
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleTagInput('interests', (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.interests.map((interest, index) => (
                      <span key={index} className="tag">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeTag('interests', index)}
                          className="ml-2 text-text-secondary hover:text-text-primary"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="btn-primary ml-auto"
              >
                {step === totalSteps ? 'Save and Continue' : 'Next'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 