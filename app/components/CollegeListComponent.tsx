'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
// Import papaparse dynamically to avoid build issues
import Select from 'react-select'

type College = {
  id: string
  name: string
  category: 'Reach' | 'Match' | 'Safety'
}

type CollegeOption = {
  value: string
  label: string
}

export default function CollegeListComponent() {
  const [colleges, setColleges] = React.useState<College[]>([])
  const [allColleges, setAllColleges] = useState<CollegeOption[]>([])
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = React.useState<College['category']>('Match')

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        // Dynamically import papaparse
        const Papa = (await import('papaparse')).default;
        
        const response = await fetch('/data/us_universities.csv')
        const reader = response.body?.getReader()
        const result = await reader?.read()
        const decoder = new TextDecoder('utf-8')
        const csv = decoder.decode(result?.value)

        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const collegeNames = results.data
              .map((row: any) => row['name']?.trim())
              .filter(Boolean)
              .sort();
            setAllColleges(collegeNames.map(name => ({ value: name, label: name })));
            setIsLoading(false);
          },
          error: (error: any) => {
            console.error('Error parsing CSV:', error);
            toast.error('Failed to load college list.');
            setIsLoading(false);
          }
        });
      } catch (error: any) {
        console.error('Error fetching college data:', error);
        toast.error('Failed to fetch college data.');
        setIsLoading(false);
      }
    }

    fetchColleges()
  }, [])

  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollege) {
      toast.error('Please select a college.')
      return
    }

    const newCollege: College = {
      id: Date.now().toString(),
      name: selectedCollege.value,
      category: selectedCategory,
    }

    setColleges(prev => [...prev, newCollege])
    setSelectedCollege(null)
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
    <div className="card mt-8">
      <h2 className="text-xl font-semibold mb-4">My College List</h2>
      <p className="mb-4 text-text-secondary">
        Add colleges to your list and categorize them as Reach, Match, or Safety schools.
      </p>
        
      <form onSubmit={handleAddCollege} className="space-y-4">
        <div>
          <label htmlFor="college" className="block text-sm font-medium text-text-secondary">
            College Name
          </label>
          <Select
            id="college"
            instanceId="college-select"
            options={allColleges}
            value={selectedCollege}
            onChange={(option) => setSelectedCollege(option as CollegeOption)}
            placeholder="Search or select a college..."
            isLoading={isLoading}
            isClearable
            isSearchable
            className="mt-1"
            styles={{
              control: (base) => ({ ...base, /* Add any custom styles */ }),
              menu: (base) => ({ ...base, zIndex: 9999 /* Ensure dropdown is on top */ })
            }}
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

      <div className="space-y-4 mt-6">
        {colleges.length === 0 ? (
          <div className="text-center py-4 text-text-secondary">
            No colleges added yet. Start building your list!
          </div>
        ) : (
          colleges.map(college => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
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
    </div>
  )
} 