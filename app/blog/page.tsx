'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, User, Search, Loader2, FileText, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BlogSubmissionForm from "@/components/blog/BlogSubmissionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  external_url?: string; // For Published Articles - link to the original publication
}

function BlogContent() {
  const { user, isApprovedMember } = useAuth();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const categoryFromUrl = searchParams.get('category') || 'campus-memories';
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category') || 'campus-memories';
    setActiveCategory(category);
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const category = activeCategory;
      const response = await fetch(`/api/blog/posts?category=${category}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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
      'campus-memories': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'published-articles': 'bg-green-100 text-green-800 hover:bg-green-200',
      'talent-hub': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/News%20&%20Events/Banner.jpg)',
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-3">Blog</h1>
          <p className="text-xl">Stay connected with the sharing memories from DUAAB'89</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Search and Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-3xl w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by author, date, title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base bg-blue-50/50 border-blue-100 focus:bg-white"
              />
            </div>
            {isApprovedMember && (
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your Story
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Submit Your Blog Post</DialogTitle>
                  </DialogHeader>
                  <BlogSubmissionForm 
                    onSuccess={() => {
                      setShowSubmitDialog(false);
                      fetchPosts();
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Category Tabs - Separated Design */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => setActiveCategory('campus-memories')}
              className={`px-8 py-3 rounded-lg border-2 font-medium transition-all ${
                activeCategory === 'campus-memories'
                  ? 'border-[#4A5568] bg-[#4A5568] text-white'
                  : 'border-[#4A5568] text-[#4A5568] hover:bg-[#4A5568]/10'
              }`}
            >
              Campus Memories
            </button>
            <button
              onClick={() => setActiveCategory('published-articles')}
              className={`px-8 py-3 rounded-lg border-2 font-medium transition-all ${
                activeCategory === 'published-articles'
                  ? 'border-[#4A5568] bg-[#4A5568] text-white'
                  : 'border-[#4A5568] text-[#4A5568] hover:bg-[#4A5568]/10'
              }`}
            >
              Published Articles
            </button>
            <button
              onClick={() => setActiveCategory('talent-hub')}
              className={`px-8 py-3 rounded-lg border-2 font-medium transition-all ${
                activeCategory === 'talent-hub'
                  ? 'border-[#4A5568] bg-[#4A5568] text-white'
                  : 'border-[#4A5568] text-[#4A5568] hover:bg-[#4A5568]/10'
              }`}
            >
              Talent Hub
            </button>
          </div>

          {/* Category Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#2e2c6d]">
              {getCategoryLabel(activeCategory)}
            </h2>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-blue-50/30">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image or Placeholder */}
                        <div className="w-full md:w-72 h-48 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                          {post.featured_image_url ? (
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                              <FileText className="h-20 w-20 opacity-50" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <div className="mb-2">
                            <h3 className="text-2xl font-bold text-[#2e2c6d] mb-2 hover:text-[#252350] transition-colors">
                              {post.title}
                            </h3>
                          </div>

                          <p className="text-slate-600 mb-4 flex-1 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
                            <div className="flex flex-col gap-2 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{post.author_name}</span>
                                {post.author_department && (
                                  <>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500">{post.author_department}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>
                                  {new Date(post.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {post.external_url && post.category === 'published-articles' && (
                                <Button 
                                  variant="default"
                                  asChild
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                                    View Publication ↗
                                  </a>
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                asChild
                                className="border-[#4A5568] text-[#4A5568] hover:bg-[#4A5568] hover:text-white transition-all"
                              >
                                <Link href={`/blog/${post.id}`}>
                                  Read more →
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#4A5568] text-[#4A5568] hover:bg-[#4A5568] hover:text-white transition-all px-8"
                >
                  See more →
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No blog posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try a different search term' 
                    : 'No blog posts available in this category at the moment'}
                </p>
                {isApprovedMember && !searchTerm && (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Be the first to share
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}
