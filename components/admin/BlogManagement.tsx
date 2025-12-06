'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Trash2,
  Calendar,
  User
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image_url?: string;
  author_id: string;
  author_name: string;
  author_department?: string;
  status: 'pending' | 'approved' | 'rejected';
  published: boolean;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export default function BlogManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/blog?status=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/blog?id=${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve post');

      toast({
        title: 'Success',
        description: 'Blog post approved and published',
      });

      fetchPosts();
      setShowViewDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve blog post',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost) return;

    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/blog?id=${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          action: 'reject',
          rejection_reason: rejectionReason,
        }),
      });

      if (!response.ok) throw new Error('Failed to reject post');

      toast({
        title: 'Success',
        description: 'Blog post rejected',
      });

      fetchPosts();
      setShowRejectDialog(false);
      setShowViewDialog(false);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject blog post',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/blog?id=${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete post');

      toast({
        title: 'Success',
        description: 'Blog post deleted',
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'campus-memories': 'Campus Memories',
      'published-articles': 'Published Articles',
      'talent-hub': 'Talent Hub',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'campus-memories': 'bg-blue-100 text-blue-800',
      'published-articles': 'bg-green-100 text-green-800',
      'talent-hub': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blog Post Management
          </CardTitle>
          <CardDescription>
            Review and manage blog submissions from approved members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>

            {['pending', 'approved', 'rejected'].map((status) => (
              <TabsContent key={status} value={status} className="mt-6 space-y-3">
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No {status} posts</h3>
                    <p className="text-muted-foreground">
                      There are no {status} blog posts at the moment
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              <Badge className={getCategoryColor(post.category)}>
                                {getCategoryLabel(post.category)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.author_name}
                                {post.author_department && ` (${post.author_department})`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {post.rejection_reason && (
                              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-xs text-red-800">
                                  <strong>Rejection reason:</strong> {post.rejection_reason}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowViewDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(post.id)}
                                  disabled={actionLoading}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedPost(post);
                                    setShowRejectDialog(true);
                                  }}
                                  disabled={actionLoading}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(post.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* View Post Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getCategoryColor(selectedPost?.category || '')}>
                  {getCategoryLabel(selectedPost?.category || '')}
                </Badge>
                <span className="text-sm">by {selectedPost?.author_name}</span>
                <span className="text-sm">
                  {selectedPost?.created_at && new Date(selectedPost.created_at).toLocaleDateString()}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              {selectedPost.featured_image_url && (
                <img
                  src={selectedPost.featured_image_url}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="font-semibold mb-2">Excerpt</h4>
                <p className="text-muted-foreground">{selectedPost.excerpt}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Full Content</h4>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedPost?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewDialog(false);
                    setShowRejectDialog(true);
                  }}
                  disabled={actionLoading}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedPost && handleApprove(selectedPost.id)}
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve & Publish
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Blog Post</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this blog post. The author will see this feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this post is being rejected..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
