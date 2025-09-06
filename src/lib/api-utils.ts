import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export interface ApiError {
  error: string
  status: number
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number = 500) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new ApiError('Unauthorized', 401)
  }

  return session
}

export async function requireProjectAccess(
  projectId: string, 
  userId: string,
  prisma: any
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: userId
        }
      }
    }
  })

  if (!project) {
    throw new ApiError('Project not found or access denied', 404)
  }

  return project
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function validateRequiredFields(data: any, fields: string[]) {
  const missing = fields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new ApiError(
      `Missing required fields: ${missing.join(', ')}`,
      400
    )
  }
}
