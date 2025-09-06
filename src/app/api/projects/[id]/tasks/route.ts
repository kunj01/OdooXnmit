import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, handleApiError, validateRequiredFields, requireProjectAccess, ApiError } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request)
    const { id: projectId } = await params
    
    // Check if user has access to project
    await requireProjectAccess(projectId, session.user.id, prisma)

    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId
      },
      include: {
        assignedTo: true,
        createdBy: true,
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request)
    const { id: projectId } = await params
    
    // Check if user has access to project
    await requireProjectAccess(projectId, session.user.id, prisma)

    const data = await request.json()
    validateRequiredFields(data, ['title'])

    const { title, description, priority, dueDate, assignedToId } = data

    // If assignedToId is provided, verify the user is a member of the project
    if (assignedToId) {
      const assignedUser = await prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: assignedToId
        }
      })

      if (!assignedUser) {
        throw new ApiError('Assigned user is not a member of this project', 400)
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId,
        projectId: projectId,
        createdById: session.user.id
      },
      include: {
        assignedTo: true,
        createdBy: true,
        comments: {
          include: {
            user: true
          }
        }
      }
    })

    // Create notification for assigned user
    if (assignedToId && assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${title}`,
          type: 'TASK_ASSIGNED',
          userId: assignedToId
        }
      })
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
