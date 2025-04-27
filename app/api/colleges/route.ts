import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

// Get user's college list
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ collegeList: user.collegeList || [] })
  } catch (error) {
    console.error('Error fetching college list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college list' },
      { status: 500 }
    )
  }
}

// Add a college to the user's list
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, applicationStatus, notes, deadline } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'College name and category are required' },
        { status: 400 }
      )
    }

    await connectDB()
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $push: { 
          collegeList: {
            name,
            category,
            applicationStatus: applicationStatus || 'Planning',
            notes,
            deadline: deadline ? new Date(deadline) : undefined
          }
        }
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'College added successfully',
      collegeList: user.collegeList
    })
  } catch (error) {
    console.error('Error adding college:', error)
    return NextResponse.json(
      { error: 'Failed to add college' },
      { status: 500 }
    )
  }
}

// Update/Replace entire college list
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collegeList } = body

    if (!Array.isArray(collegeList)) {
      return NextResponse.json(
        { error: 'College list must be an array' },
        { status: 400 }
      )
    }

    await connectDB()
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { collegeList },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'College list updated successfully',
      collegeList: user.collegeList
    })
  } catch (error) {
    console.error('Error updating college list:', error)
    return NextResponse.json(
      { error: 'Failed to update college list' },
      { status: 500 }
    )
  }
} 