'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, User, MoreHorizontal, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDate, getStatusColor, getPriorityColor, getInitials } from '@/lib/utils'
import { Task } from '@/types'

interface TaskListProps {
  projectId: string
}

export function TaskList({ projectId }: TaskListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
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

  const filteredTasks = tasks?.filter((task: Task) => {
    if (selectedStatus === 'all') return true
    return task.status === selectedStatus
  }) || []

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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('all')}
        >
          All ({tasks?.length || 0})
        </Button>
        <Button
          variant={selectedStatus === 'TODO' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('TODO')}
        >
          To Do ({tasks?.filter((t: Task) => t.status === 'TODO').length || 0})
        </Button>
        <Button
          variant={selectedStatus === 'IN_PROGRESS' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('IN_PROGRESS')}
        >
          In Progress ({tasks?.filter((t: Task) => t.status === 'IN_PROGRESS').length || 0})
        </Button>
        <Button
          variant={selectedStatus === 'DONE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('DONE')}
        >
          Done ({tasks?.filter((t: Task) => t.status === 'DONE').length || 0})
        </Button>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? "No tasks have been created yet." 
                : `No tasks with status "${selectedStatus}"`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task: Task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <Checkbox
                      checked={task.status === 'DONE'}
                      onCheckedChange={(checked) => {
                        updateTaskStatus(task.id, checked ? 'DONE' : 'TODO')
                      }}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {task.title}
                        </h3>
                        {isOverdue(task.dueDate) && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(task.status)}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </Badge>
                        
                        {task.assignedTo && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">
                              {task.assignedTo.name || task.assignedTo.email}
                            </span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 ${
                            isOverdue(task.dueDate) ? 'text-red-600' : 
                            isDueToday(task.dueDate) ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
