'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apCourses } from '../data/apCourses'
import { useSession } from 'next-auth/react'
import CollegeListComponent from '../components/CollegeListComponent'

export default function ProfileSetup() {
  const { data: session } = useSession()
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    gpa: '',
    satAct: '',
    apCourses: [] as string[],
  })

  const [step, setStep] = React.useState(1)
  const totalSteps = 3

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setFormData({
              name: session?.user?.name || '',
              gpa: data.gpa?.toString() || '',
              satAct: data.satAct?.toString() || '',
              apCourses: data.apCourses || [],
            })
            setIsFirstTime(false)
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (session?.user?.email) {
      fetchProfile()
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAPCourseSelect = (course: string) => {
    setFormData(prev => ({
      ...prev,
      apCourses: prev.apCourses.includes(course)
        ? prev.apCourses.filter(c => c !== course)
        : [...prev.apCourses, course]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFirstTime && step < totalSteps) {
      setStep(prev => prev + 1)
    } else {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success('Profile saved successfully!')
          setIsFirstTime(false)
          setIsEditing(false)
          if (isFirstTime) {
            window.location.href = '/dashboard'
          }
        } else {
          throw new Error('Failed to save profile')
        }
      } catch (error) {
        console.error('Error saving profile:', error)
        toast.error('Failed to save profile')
      }
    }
  }

  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
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
                      Select AP Courses
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                      {apCourses.map((course) => (
                        <label key={course} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.apCourses.includes(course)}
                            onChange={() => handleAPCourseSelect(course)}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span className="text-sm">{course}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(prev => prev - 1)}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                )}
                <button type="submit" className="btn-primary ml-auto">
                  {step === totalSteps ? 'Save & Continue' : 'Next'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    )
  } else if (isEditing) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-text-primary">Your Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
                <div>
                  <label htmlFor="satAct" className="block text-sm font-medium text-text-secondary">
                    SAT/ACT Score
                  </label>
                  <input
                    type="number"
                    id="satAct"
                    name="satAct"
                    value={formData.satAct}
                    onChange={handleInputChange}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary">
                    AP Courses
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded mt-1">
                    {apCourses.map((course) => (
                      <label key={course} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.apCourses.includes(course)}
                          onChange={() => handleAPCourseSelect(course)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{course}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
              <p className="mt-2 text-text-secondary">
                Review and manage your profile information
              </p>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary-outline"
                >
                  Edit Profile
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary">Full Name</h3>
                    <p className="mt-1 text-text-primary">{formData.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary">GPA</h3>
                    <p className="mt-1 text-text-primary">{formData.gpa}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary">SAT/ACT Score</h3>
                    <p className="mt-1 text-text-primary">{formData.satAct || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text-secondary">AP Courses</h3>
                  {formData.apCourses.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {formData.apCourses.map((course) => (
                        <span key={course} className="tag">
                          {course}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-text-secondary">No AP courses selected</p>
                  )}
                </div>
              </div>
            </div>

            {/* College List Component */}
            <CollegeListComponent />
            
          </motion.div>
        </div>
      </div>
    )
  }
} 