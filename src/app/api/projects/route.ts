import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProjectsByUserId } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = getProjectsByUserId(session.user.id)

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // For demo purposes, return a mock project
    const mockProject = {
      id: `project_${Date.now()}`,
      name,
      description: description || '',
      status: 'ACTIVE',
      createdById: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: `member_${Date.now()}`,
          userId: session.user.id,
          projectId: `project_${Date.now()}`,
          role: 'OWNER',
          joinedAt: new Date(),
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image
          }
        }
      ],
      tasks: [],
      discussions: [],
      _count: {
        tasks: 0,
        discussions: 0
      }
    }

    return NextResponse.json(mockProject, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

