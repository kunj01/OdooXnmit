'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, User, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, getPriorityColor, getInitials } from '@/lib/utils'
import { Task } from '@/types'

interface TaskBoardProps {
  projectId: string
}

const columns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100' },
]

export function TaskBoard({ projectId }: TaskBoardProps) {
  const queryClient = useQueryClient()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/tasks`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      return response.json()
    },
  })

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const isDueToday = (dueDate: Date | null) => {
    if (!dueDate) return false
    return new Date(dueDate).toDateString() === new Date().toDateString()
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Card key={column.id} className="animate-pulse">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load tasks. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks?.filter((task: Task) => task.status === column.id) || []
        
        return (
          <Card key={column.id} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {column.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 min-h-[200px]">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">No tasks</div>
                </div>
              ) : (
                columnTasks.map((task: Task) => (
                  <Card
                    key={task.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      isOverdue(task.dueDate) ? 'border-red-200 bg-red-50' : ''
                    }`}
                    onClick={() => {
                      // Navigate to task detail or open modal
                      console.log('Open task:', task.id)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {task.title}
                          </h4>
                          {isOverdue(task.dueDate) && (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          
                          {task.assignedTo && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {getInitials(task.assignedTo.name || task.assignedTo.email)}
                            </div>
                          )}
                        </div>
                        
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 text-xs ${
                            isOverdue(task.dueDate) ? 'text-red-600' : 
                            isDueToday(task.dueDate) ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
