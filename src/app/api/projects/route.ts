import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, validateRequiredFields, ApiError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            projectDiscussions: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)

    // Ensure user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    if (!user) {
      throw new ApiError('User not found in database', 404)
    }

    const data = await request.json()
    validateRequiredFields(data, ['name'])

    const { name, description } = data

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            projectDiscussions: true,
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
