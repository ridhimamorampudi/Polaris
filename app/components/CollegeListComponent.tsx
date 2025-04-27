'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
// Import papaparse dynamically to avoid build issues
import Select from 'react-select'
import { useSession } from 'next-auth/react'

type College = {
  _id?: string
  id?: string
  name: string
  category: 'Reach' | 'Match' | 'Safety'
  applicationStatus?: string
  notes?: string
  deadline?: string
}

type CollegeOption = {
  value: string
  label: string
}

export default function CollegeListComponent() {
  const { data: session } = useSession()
  const [colleges, setColleges] = useState<College[]>([])
  const [allColleges, setAllColleges] = useState<CollegeOption[]>([])
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<College['category']>('Match')

  // Fetch both user's college list and the list of all colleges
  useEffect(() => {
    const fetchCollegeData = async () => {
      setIsLoading(true)
      
      try {
        // Fetch user's saved college list from the database
        const userCollegesResponse = await fetch('/api/colleges')
        if (userCollegesResponse.ok) {
          const data = await userCollegesResponse.json()
          setColleges(data.collegeList || [])
        } else {
          console.error('Failed to fetch user college list')
        }
        
        // Fetch all available colleges from CSV
        const Papa = (await import('papaparse')).default
        const csvResponse = await fetch('/data/us_universities.csv')
        const reader = csvResponse.body?.getReader()
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
              .sort()
            setAllColleges(collegeNames.map(name => ({ value: name, label: name })))
          },
          error: (error: any) => {
            console.error('Error parsing CSV:', error)
            toast.error('Failed to load college options.')
          }
        })
      } catch (error: any) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load college data.')
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchCollegeData()
    }
  }, [session])

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollege) {
      toast.error('Please select a college.')
      return
    }

    if (!session) {
      toast.error('You must be signed in to save colleges')
      return
    }

    setIsSaving(true)

    try {
      const newCollege: College = {
        name: selectedCollege.value,
        category: selectedCategory,
        applicationStatus: 'Planning'
      }

      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCollege)
      })

      if (!response.ok) {
        throw new Error('Failed to save college')
      }

      const data = await response.json()
      setColleges(data.collegeList)
      setSelectedCollege(null)
      toast.success('College added successfully!')
    } catch (error) {
      console.error('Error adding college:', error)
      toast.error('Failed to add college to your list')
    } finally {
      setIsSaving(false)
    }
  }

  const removeCollege = async (college: College) => {
    if (!session) {
      toast.error('You must be signed in to modify your college list')
      return
    }
    
    try {
      // Optimistically update UI
      setColleges(prev => prev.filter(c => c._id !== college._id))
      
      // Update the database by sending the updated list without the removed college
      const updatedList = colleges.filter(c => c._id !== college._id)
      
      const response = await fetch('/api/colleges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ collegeList: updatedList })
      })

      if (!response.ok) {
        throw new Error('Failed to update college list')
      }
      
      toast.success('College removed successfully!')
    } catch (error) {
      console.error('Error removing college:', error)
      toast.error('Failed to remove college')
      
      // Restore the college if the server request failed
      const response = await fetch('/api/colleges')
      if (response.ok) {
        const data = await response.json()
        setColleges(data.collegeList || [])
      }
    }
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

  if (isLoading) {
    return (
      <div className="card mt-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
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

        <button 
          type="submit" 
          className="btn-primary w-full flex items-center justify-center"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
              Saving...
            </>
          ) : 'Add College'}
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
              key={college._id || college.id}
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
                {college.applicationStatus && (
                  <span className="ml-2 inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                    {college.applicationStatus}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeCollege(college)}
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