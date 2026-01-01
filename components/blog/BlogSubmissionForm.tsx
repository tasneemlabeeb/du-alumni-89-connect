'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, FileText, Send } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';

interface BlogSubmissionFormProps {
  onSuccess?: () => void;
}

export default function BlogSubmissionForm({ onSuccess }: BlogSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'campus-memories',
    featured_image_url: '',
    external_url: '', // For published articles - link to original publication
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a blog post',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/blog/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit blog post');
      }

      toast({
        title: 'Success',
        description: 'Your blog post has been submitted for admin approval',
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'campus-memories',
        featured_image_url: '',
        external_url: '',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting blog post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit blog post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submit Your Story
        </CardTitle>
        <CardDescription>
          Share your campus memories or publish an article. Your submission will be reviewed by an admin before publication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus-memories">Campus Memories</SelectItem>
                <SelectItem value="published-articles">Published Articles</SelectItem>
                <SelectItem value="talent-hub">Talent Hub</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.category === 'campus-memories' && 'Share memories from your time at DU'}
              {formData.category === 'published-articles' && 'Share articles, research, or professional insights'}
              {formData.category === 'talent-hub' && 'Showcase your creative work, achievements, or projects'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a compelling title"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Write a brief summary (will be shown in the blog listing)"
              rows={3}
              required
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your full story or article here..."
              rows={12}
              required
            />
          </div>

          {/* External URL field - only show for Published Articles */}
          {formData.category === 'published-articles' && (
            <div className="space-y-2">
              <Label htmlFor="external_url">Original Publication Link (Optional)</Label>
              <Input
                id="external_url"
                type="url"
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://example.com/your-article"
              />
              <p className="text-xs text-muted-foreground">
                If this article was published elsewhere, add the link here so readers can view the original publication.
              </p>
            </div>
          )}

          <ImageUpload
            value={formData.featured_image_url}
            onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
            label="Featured Image"
            folder="blog-images"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your submission will be reviewed by an admin before it appears on the blog. 
              You'll be able to see the status of your submissions in your profile.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
