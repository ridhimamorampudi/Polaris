'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

type College = {
  id: string
  name: string
  category: 'Reach' | 'Match' | 'Safety'
}

export default function CollegeList() {
  const [colleges, setColleges] = React.useState<College[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<College['category']>('Match')

  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const newCollege: College = {
      id: Date.now().toString(),
      name: searchQuery.trim(),
      category: selectedCategory,
    }

    setColleges(prev => [...prev, newCollege])
    setSearchQuery('')
    toast.success('College added successfully!')
  }

  const removeCollege = (id: string) => {
    setColleges(prev => prev.filter(college => college.id !== id))
    toast.success('College removed')
  }

  const getCategoryColor = (category: College['category']) => {
    switch (category) {
      case 'Reach':
        return 'bg-red-100 text-red-800'
      case 'Match':
        return 'bg-yellow-100 text-yellow-800'
      case 'Safety':
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary">My College List</h1>
            <p className="mt-2 text-text-secondary">
              Add colleges to your list and categorize them as Reach, Match, or Safety schools.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleAddCollege} className="space-y-4">
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-text-secondary">
                  College Name
                </label>
                <input
                  type="text"
                  id="college"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Enter college name"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as College['category'])}
                  className="input-field mt-1"
                >
                  <option value="Reach">Reach</option>
                  <option value="Match">Match</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full">
                Add College
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {colleges.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No colleges added yet. Start building your list!
              </div>
            ) : (
              colleges.map(college => (
                <motion.div
                  key={college.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">{college.name}</h3>
                    <span className={`inline-block px-2 py-1 text-sm rounded-full mt-1 ${getCategoryColor(college.category)}`}>
                      {college.category}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCollege(college.id)}
                    className="text-text-secondary hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {colleges.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => window.location.href = '/major'}
                className="btn-primary"
              >
                Continue to Major Selection
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 