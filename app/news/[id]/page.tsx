'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, ArrowLeft, Loader2, FileText } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  featured_image_url?: string;
  published: boolean;
  created_at: string;
  updated_at?: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchNews(params.id as string);
    }
  }, [params.id]);

  const fetchNews = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/news/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('News item not found');
        } else {
          setError('Failed to load news item');
        }
        return;
      }

      const data = await response.json();
      setNews(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news item');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'general': 'General News',
      'achievements': 'Achievements',
      'announcements': 'Announcements',
      'media_press': 'Media/Press',
      'alumni_stories': 'Alumni Stories',
    };
    return labels[category] || 'News';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-100 text-blue-800',
      'achievements': 'bg-green-100 text-green-800',
      'announcements': 'bg-orange-100 text-orange-800',
      'media_press': 'bg-purple-100 text-purple-800',
      'alumni_stories': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-700" />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">
              {error || 'News item not found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              The news item you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="bg-indigo-700 hover:bg-indigo-800">
              <Link href="/news">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News & Events
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
            <Link href="/news">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News & Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <Card className="overflow-hidden">
            {/* Featured Image */}
            {news.featured_image_url && (
              <div className="w-full h-96 bg-slate-200">
                <img
                  src={news.featured_image_url}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardContent className="p-8 md:p-12">
              {/* Category Badge */}
              {news.category && (
                <div className="mb-4">
                  <Badge className={getCategoryColor(news.category)}>
                    {getCategoryLabel(news.category)}
                  </Badge>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {news.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(news.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span>at</span>
                  <span>
                    {new Date(news.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Summary */}
              {news.summary && (
                <>
                  <div className="mb-8">
                    <p className="text-xl text-slate-700 font-medium italic leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                  <Separator className="my-8" />
                </>
              )}

              {/* Content */}
              <div className="prose prose-slate max-w-none">
                <div className="text-lg leading-relaxed whitespace-pre-wrap text-slate-700">
                  {news.content}
                </div>
              </div>

              {/* Footer */}
              <Separator className="my-12" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {news.updated_at && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(news.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
                <Button variant="outline" asChild>
                  <Link href="/news">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All News
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related News Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More from {news.category ? getCategoryLabel(news.category) : 'News'}</h2>
            <p className="text-muted-foreground text-center py-8 bg-white rounded-lg border">
              More news articles coming soon...
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
