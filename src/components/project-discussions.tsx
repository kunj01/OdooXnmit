'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { MessageSquare, Plus, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, getInitials } from '@/lib/utils'

interface ProjectDiscussionsProps {
  projectId: string
}

export function ProjectDiscussions({ projectId }: ProjectDiscussionsProps) {
  const { data: session } = useSession()
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('')
  const [newDiscussionContent, setNewDiscussionContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: discussions, isLoading, error } = useQuery({
    queryKey: ['project-discussions', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/discussions`)
      if (!response.ok) throw new Error('Failed to fetch discussions')
      return response.json()
    },
  })

  const createDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newDiscussionTitle,
          content: newDiscussionContent,
        }),
      })

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['project-discussions', projectId] })
        setNewDiscussionTitle('')
        setNewDiscussionContent('')
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create discussion:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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
          <p className="text-red-600">Failed to load discussions. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Discussion Form */}
      {showCreateForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a New Discussion</CardTitle>
            <CardDescription>
              Create a new discussion thread for your project team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createDiscussion} className="space-y-4">
              <div>
                <Input
                  placeholder="Discussion title"
                  value={newDiscussionTitle}
                  onChange={(e) => setNewDiscussionTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="What would you like to discuss?"
                  value={newDiscussionContent}
                  onChange={(e) => setNewDiscussionContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Discussion'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Project Discussions</h3>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Discussion
          </Button>
        </div>
      )}

      {/* Discussions List */}
      {discussions?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-600 mb-4">
              Start the conversation by creating your first discussion.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions?.map((discussion: any) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {discussion.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{discussion.user.name || discussion.user.email}</span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(discussion.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {discussion.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
