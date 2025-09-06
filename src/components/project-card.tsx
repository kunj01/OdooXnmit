'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Users, Calendar, MessageSquare, CheckCircle } from 'lucide-react'
import { formatDate, getStatusColor, getInitials } from '@/lib/utils'
import { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const completedTasks = project.tasks?.filter(task => task.status === 'DONE').length || 0
  const totalTasks = project.tasks?.length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const dueToday = project.tasks?.filter(task => {
    if (!task.dueDate) return false
    const today = new Date().toDateString()
    return new Date(task.dueDate).toDateString() === today
  }).length || 0

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <Link href={`/projects/${project.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-600 line-clamp-2">
                {project.description || 'No description provided'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Badge 
                variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {project.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(!isMenuOpen)
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{project.members?.length || 0} members</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>{project.projectDiscussions?.length || 0} discussions</span>
          </div>
        </div>

        {/* Due Today Alert */}
        {dueToday > 0 && (
          <div className="flex items-center text-sm text-orange-600 bg-orange-50 rounded-md p-2 mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{dueToday} task{dueToday > 1 ? 's' : ''} due today</span>
          </div>
        )}

        {/* Team Members */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                title={member.user.name || member.user.email}
              >
                {getInitials(member.user.name || member.user.email)}
              </div>
            ))}
            {project.members && project.members.length > 3 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            Updated {formatDate(project.updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
