'use client'

import React from 'react'
import EssayReview from '../components/EssayReview'
import { Metadata } from 'next'

export default function EssayPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <EssayReview />
      </div>
    </div>
  );
} 