'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ArrowLeft, Loader2, FileText, Share2, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image_url?: string;
  author_name: string;
  author_department?: string;
  created_at: string;
  updated_at: string;
  external_url?: string; // For Published Articles - link to the original publication
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Set the current URL when component mounts (client-side only)
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/blog/posts/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Blog post not found');
        } else {
          setError('Failed to load blog post');
        }
        return;
      }

      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">
              {error || 'Blog post not found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <Card className="overflow-hidden">
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="w-full h-96 bg-slate-200">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardContent className="p-8 md:p-12">
              {/* Category Badge */}
              <div className="mb-4">
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryLabel(post.category)}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{post.author_name}</span>
                  {post.author_department && (
                    <span className="text-xs">({post.author_department})</span>
                  )}
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span>at</span>
                  <span>
                    {new Date(post.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Excerpt */}
              <div className="mb-8">
                <p className="text-xl text-slate-700 font-medium italic leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <Separator className="my-8" />

              {/* Content */}
              <div className="prose prose-slate max-w-none">
                <div className="text-lg leading-relaxed whitespace-pre-wrap text-slate-700">
                  {post.content}
                </div>
              </div>

              {/* Social Share Section */}
              <Separator className="my-8" />
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Share this article</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Facebook Share */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600"
                      onClick={() => {
                        const shareUrl = currentUrl || window.location.href;
                        console.log('Sharing to Facebook:', shareUrl);
                        const facebookUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                        window.open(facebookUrl, '_blank', 'width=600,height=400');
                      }}
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>

                    {/* Twitter/X Share */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-sky-50 border-sky-200 text-sky-600"
                      onClick={() => {
                        const shareUrl = currentUrl || window.location.href;
                        const text = `${post.title} by ${post.author_name}`;
                        console.log('Sharing to Twitter:', shareUrl, text);
                        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                        window.open(twitterUrl, '_blank', 'width=600,height=400');
                      }}
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>

                    {/* LinkedIn Share */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
                      onClick={() => {
                        const shareUrl = currentUrl || window.location.href;
                        console.log('Sharing to LinkedIn:', shareUrl);
                        const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(post.title + ' - ' + shareUrl)}`;
                        window.open(linkedinUrl, '_blank', 'width=600,height=600');
                      }}
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>

                    {/* WhatsApp Share */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-green-50 border-green-300 text-green-600"
                      onClick={() => {
                        const shareUrl = currentUrl || window.location.href;
                        const text = `${post.title} by ${post.author_name}\n\n${shareUrl}`;
                        console.log('Sharing to WhatsApp:', text);
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </Button>

                    {/* Email Share */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                      onClick={() => {
                        const shareUrl = currentUrl || window.location.href;
                        const subject = `Check out: ${post.title}`;
                        const body = `I thought you might find this interesting:\n\n${post.title}\nBy ${post.author_name}\n\n${post.excerpt}\n\nRead more: ${shareUrl}`;
                        console.log('Sharing via Email:', shareUrl);
                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* External Link for Published Articles */}
              {post.external_url && post.category === 'published-articles' && (
                <>
                  <Separator className="my-8" />
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">
                      View Original Publication
                    </h3>
                    <p className="text-green-700 mb-4">
                      This article was originally published elsewhere. Click below to read the full article at its source.
                    </p>
                    <Button 
                      asChild
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                        View Original Article ↗
                      </a>
                    </Button>
                  </div>
                </>
              )}

              {/* Footer */}
              <Separator className="my-12" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(post.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <Button variant="outline" asChild>
                  <Link href="/blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Posts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts Section (placeholder for future enhancement) */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <p className="text-muted-foreground text-center py-8 bg-white rounded-lg border">
              More posts from {getCategoryLabel(post.category)} coming soon...
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
