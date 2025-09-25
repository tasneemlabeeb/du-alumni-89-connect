import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Newspaper, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ImageIcon 
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  published: boolean;
  featured_image_url?: string;
  created_at: string;
  author_id: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  registration_required: boolean;
  max_attendees?: number;
  featured_image_url?: string;
  created_at: string;
  organizer_id: string;
}

export default function NewsEventManagement() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // News form state
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    summary: '',
    published: false,
    featured_image_url: ''
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    registration_required: false,
    max_attendees: '',
    featured_image_url: ''
  });

  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showNewsDialog, setShowNewsDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsResponse, eventsResponse] = await Promise.all([
        supabase.from('news').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('event_date', { ascending: false })
      ]);

      if (newsResponse.error) throw newsResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      setNews(newsResponse.data || []);
      setEvents(eventsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newsData = {
        ...newsForm,
        max_attendees: eventForm.max_attendees ? parseInt(eventForm.max_attendees) : null,
        author_id: (await supabase.auth.getUser()).data.user?.id
      };

      if (editingNews) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNews.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "News updated successfully" });
      } else {
        const { error } = await supabase
          .from('news')
          .insert([newsData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "News created successfully" });
      }

      setNewsForm({ title: '', content: '', summary: '', published: false, featured_image_url: '' });
      setEditingNews(null);
      setShowNewsDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Error",
        description: "Failed to save news",
        variant: "destructive"
      });
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...eventForm,
        max_attendees: eventForm.max_attendees ? parseInt(eventForm.max_attendees) : null,
        organizer_id: (await supabase.auth.getUser()).data.user?.id
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Event created successfully" });
      }

      setEventForm({ 
        title: '', 
        description: '', 
        event_date: '', 
        location: '', 
        registration_required: false, 
        max_attendees: '', 
        featured_image_url: '' 
      });
      setEditingEvent(null);
      setShowEventDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;
    
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Success", description: "News deleted successfully" });
      fetchData();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Failed to delete news",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="news" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="news">News Management</TabsTrigger>
        <TabsTrigger value="events">Event Management</TabsTrigger>
      </TabsList>

      <TabsContent value="news" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Newspaper className="h-5 w-5 mr-2" />
              News Articles
            </CardTitle>
            <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingNews(null);
                  setNewsForm({ title: '', content: '', summary: '', published: false, featured_image_url: '' });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add News
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleNewsSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="news-title">Title</Label>
                    <Input
                      id="news-title"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="news-summary">Summary</Label>
                    <Textarea
                      id="news-summary"
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="news-content">Content</Label>
                    <Textarea
                      id="news-content"
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="news-image">Featured Image URL</Label>
                    <Input
                      id="news-image"
                      type="url"
                      value={newsForm.featured_image_url}
                      onChange={(e) => setNewsForm({ ...newsForm, featured_image_url: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="news-published"
                      checked={newsForm.published}
                      onCheckedChange={(checked) => setNewsForm({ ...newsForm, published: checked })}
                    />
                    <Label htmlFor="news-published">Published</Label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingNews ? 'Update' : 'Create'} News
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowNewsDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <Badge variant={item.published ? 'default' : 'secondary'}>
                          {item.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNews(item);
                          setNewsForm({
                            title: item.title,
                            content: item.content,
                            summary: item.summary || '',
                            published: item.published,
                            featured_image_url: item.featured_image_url || ''
                          });
                          setShowNewsDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteNews(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredNews.length === 0 && (
                <div className="text-center py-8">
                  <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No news found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No news matches your search criteria' : 'Start by creating your first news article'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Events
            </CardTitle>
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingEvent(null);
                  setEventForm({ 
                    title: '', 
                    description: '', 
                    event_date: '', 
                    location: '', 
                    registration_required: false, 
                    max_attendees: '', 
                    featured_image_url: '' 
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Title</Label>
                    <Input
                      id="event-title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Event Date</Label>
                      <Input
                        id="event-date"
                        type="datetime-local"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event-location">Location</Label>
                      <Input
                        id="event-location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="event-image">Featured Image URL</Label>
                    <Input
                      id="event-image"
                      type="url"
                      value={eventForm.featured_image_url}
                      onChange={(e) => setEventForm({ ...eventForm, featured_image_url: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="event-registration"
                        checked={eventForm.registration_required}
                        onCheckedChange={(checked) => setEventForm({ ...eventForm, registration_required: checked })}
                      />
                      <Label htmlFor="event-registration">Registration Required</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="event-attendees">Max Attendees</Label>
                      <Input
                        id="event-attendees"
                        type="number"
                        value={eventForm.max_attendees}
                        onChange={(e) => setEventForm({ ...eventForm, max_attendees: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingEvent ? 'Update' : 'Create'} Event
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 {new Date(event.event_date).toLocaleString()}</span>
                        {event.location && <span>📍 {event.location}</span>}
                        {event.registration_required && <Badge variant="outline">Registration Required</Badge>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEvent(event);
                          setEventForm({
                            title: event.title,
                            description: event.description,
                            event_date: event.event_date,
                            location: event.location || '',
                            registration_required: event.registration_required,
                            max_attendees: event.max_attendees?.toString() || '',
                            featured_image_url: event.featured_image_url || ''
                          });
                          setShowEventDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No events match your search criteria' : 'Start by creating your first event'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}