import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Clock, Newspaper, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  featured_image_url: string | null;
  created_at: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  featured_image_url: string | null;
  registration_required: boolean;
  max_attendees: number | null;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isApprovedMember } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch news - published news is visible to everyone
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      // Fetch events - only for approved members
      let eventsData = null;
      if (isApprovedMember) {
        const { data } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });
        eventsData = data;
      }

      setNews(newsData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-accent py-12 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">News & Events</h1>
          <p className="text-lg opacity-90">
            Stay updated with the latest news and upcoming events
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news" className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-6">
            <div className="space-y-6">
              {news.length > 0 ? news.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(item.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {item.summary && (
                      <p className="text-muted-foreground mb-4 font-medium">
                        {item.summary}
                      </p>
                    )}
                    
                    <div className="prose max-w-none">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: item.content.replace(/\n/g, '<br />') 
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No news articles yet</h3>
                    <p className="text-muted-foreground">
                      Check back later for the latest updates
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {!isApprovedMember ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground">
                    Only approved members can view events
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {events.length > 0 ? events.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDateTime(event.event_date)}
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {event.registration_required && (
                            <Badge variant="secondary">Registration Required</Badge>
                          )}
                          {event.max_attendees && (
                            <Badge variant="outline">
                              Max {event.max_attendees} attendees
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="prose max-w-none">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: event.description.replace(/\n/g, '<br />') 
                          }} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
                      <p className="text-muted-foreground">
                        Check back later for upcoming events
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}