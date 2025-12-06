'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Newspaper, Calendar, Plus, Edit, Trash2, Search, Loader2, Eye, EyeOff, Users, FileText, MapPin, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ImageUpload from '@/components/ui/image-upload';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  published: boolean;
  featured_image_url?: string;
  category?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface EventRegistrationForm {
  enabled: boolean;
  fields: FormField[];
  max_attendees?: number;
  deadline?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_end_date?: string;
  location?: string;
  location_url?: string;
  registration_form?: EventRegistrationForm;
  featured_image_url?: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export default function NewsEventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showNewsDialog, setShowNewsDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'news' | 'event', id: string} | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    summary: '',
    published: false,
    featured_image_url: '',
    category: 'announcements'
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_end_date: '',
    location: '',
    location_url: '',
    featured_image_url: '',
    published: false,
    registration_enabled: false,
    max_attendees: '',
    registration_deadline: '',
  });

  const [registrationFields, setRegistrationFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      
      if (!token) {
        console.error('No auth token available');
        toast({ 
          title: "Error", 
          description: "Please sign in to access admin features", 
          variant: "destructive" 
        });
        return;
      }

      console.log('Fetching news and events with token...');
      const [newsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/news', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/events', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        console.log('News fetched:', newsData.news?.length || 0, 'items');
        setNews(newsData.news || []);
      } else {
        console.error('News fetch failed:', newsRes.status, await newsRes.text());
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        console.log('Events fetched:', eventsData.events?.length || 0, 'items');
        setEvents(eventsData.events || []);
      } else {
        console.error('Events fetch failed:', eventsRes.status, await eventsRes.text());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load news and events", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const method = editingNews ? 'PUT' : 'POST';
      const url = editingNews ? `/api/admin/news?id=${editingNews.id}` : '/api/admin/news';

      console.log('📰 Submitting news with data:', {
        title: newsForm.title,
        featured_image_url: newsForm.featured_image_url,
        has_image: !!newsForm.featured_image_url
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newsForm),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('News save failed:', errorText);
        throw new Error('Failed to save news');
      }
      
      const result = await response.json();
      console.log('📰 News saved successfully:', result);
      
      toast({ title: "Success", description: `News ${editingNews ? 'updated' : 'created'} successfully` });
      resetNewsForm();
      setShowNewsDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({ title: "Error", description: "Failed to save news", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `/api/admin/events?id=${editingEvent.id}` : '/api/admin/events';

      const registrationForm: EventRegistrationForm | undefined = eventForm.registration_enabled ? {
        enabled: true,
        fields: registrationFields,
        max_attendees: eventForm.max_attendees ? parseInt(eventForm.max_attendees) : undefined,
        deadline: eventForm.registration_deadline || undefined,
      } : undefined;

      const payload = { 
        ...eventForm, 
        registration_form: registrationForm 
      };

      console.log('Submitting event:', payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to save event';
        throw new Error(errorMessage);
      }
      
      toast({ title: "Success", description: `Event ${editingEvent ? 'updated' : 'created'} successfully` });
      resetEventForm();
      setShowEventDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const url = deleteTarget.type === 'news' ? `/api/admin/news?id=${deleteTarget.id}` : `/api/admin/events?id=${deleteTarget.id}`;
      const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: "Success", description: `${deleteTarget.type === 'news' ? 'News' : 'Event'} deleted successfully` });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const resetNewsForm = () => {
    setNewsForm({ title: '', content: '', summary: '', published: false, featured_image_url: '', category: 'announcements' });
    setEditingNews(null);
  };

  const resetEventForm = () => {
    setEventForm({ title: '', description: '', event_date: '', event_end_date: '', location: '', location_url: '', featured_image_url: '', published: false, registration_enabled: false, max_attendees: '', registration_deadline: '' });
    setRegistrationFields([]);
    setEditingEvent(null);
  };

  const openEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewsForm({ title: item.title, content: item.content, summary: item.summary || '', published: item.published, featured_image_url: item.featured_image_url || '', category: item.category || 'announcements' });
    setShowNewsDialog(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({ title: event.title, description: event.description, event_date: event.event_date, event_end_date: event.event_end_date || '', location: event.location || '', location_url: event.location_url || '', featured_image_url: event.featured_image_url || '', published: event.published, registration_enabled: !!event.registration_form?.enabled, max_attendees: event.registration_form?.max_attendees?.toString() || '', registration_deadline: event.registration_form?.deadline || '' });
    setRegistrationFields(event.registration_form?.fields || []);
    setShowEventDialog(true);
  };

  const addRegistrationField = () => {
    setRegistrationFields([...registrationFields, { id: `field_${Date.now()}`, label: '', type: 'text', required: false, placeholder: '' }]);
  };

  const updateRegistrationField = (id: string, updates: Partial<FormField>) => {
    setRegistrationFields(fields => fields.map(field => field.id === id ? { ...field, ...updates } : field));
  };

  const removeRegistrationField = (id: string) => {
    setRegistrationFields(fields => fields.filter(field => field.id !== id));
  };

  const filteredNews = news.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.content.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEvents = events.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="news" className="gap-2"><Newspaper className="h-4 w-4" />News Articles</TabsTrigger>
          <TabsTrigger value="events" className="gap-2"><Calendar className="h-4 w-4" />Events</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" />News Management</CardTitle>
                  <CardDescription>Create and manage news articles</CardDescription>
                </div>
                <Button onClick={() => { resetNewsForm(); setShowNewsDialog(true); }}><Plus className="h-4 w-4 mr-2" />Add News</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search news..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="space-y-3">
                {filteredNews.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                            <Badge variant={item.published ? 'default' : 'secondary'} className="shrink-0">{item.published ? <><Eye className="h-3 w-3 mr-1" />Published</> : <><EyeOff className="h-3 w-3 mr-1" />Draft</>}</Badge>
                            {item.category && (
                              <Badge variant="outline" className="shrink-0">
                                {item.category === 'achievements' && '🏆 Achievements'}
                                {item.category === 'announcements' && '📢 Announcements'}
                                {item.category === 'media_press' && '📰 Media/Press'}
                                {item.category === 'alumni_stories' && '✨ Alumni Stories'}
                              </Badge>
                            )}
                          </div>
                          {item.summary && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.summary}</p>}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>Created: {new Date(item.created_at).toLocaleDateString()}</span></div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openEditNews(item)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { setDeleteTarget({ type: 'news', id: item.id }); setShowDeleteDialog(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredNews.length === 0 && (
                  <div className="text-center py-12">
                    <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No news articles found</h3>
                    <p className="text-muted-foreground mb-4">{searchTerm ? 'Try a different search term' : 'Get started by creating your first news article'}</p>
                    {!searchTerm && <Button onClick={() => { resetNewsForm(); setShowNewsDialog(true); }}><Plus className="h-4 w-4 mr-2" />Create News Article</Button>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Event Management</CardTitle>
                  <CardDescription>Create and manage events with optional registration</CardDescription>
                </div>
                <Button onClick={() => { resetEventForm(); setShowEventDialog(true); }}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                            <Badge variant={event.published ? 'default' : 'secondary'} className="shrink-0">{event.published ? <><Eye className="h-3 w-3 mr-1" />Published</> : <><EyeOff className="h-3 w-3 mr-1" />Draft</>}</Badge>
                            {event.registration_form?.enabled && <Badge variant="outline" className="shrink-0"><Users className="h-3 w-3 mr-1" />Registration</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.event_date).toLocaleString()}</span>
                            {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openEditEvent(event)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => { setDeleteTarget({ type: 'event', id: event.id }); setShowDeleteDialog(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No events found</h3>
                    <p className="text-muted-foreground mb-4">{searchTerm ? 'Try a different search term' : 'Get started by creating your first event'}</p>
                    {!searchTerm && <Button onClick={() => { resetEventForm(); setShowEventDialog(true); }}><Plus className="h-4 w-4 mr-2" />Create Event</Button>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingNews ? 'Edit News Article' : 'Create News Article'}</DialogTitle></DialogHeader>
          <form onSubmit={handleNewsSubmit} className="space-y-4">
            <div className="space-y-4">
              <div><Label htmlFor="news-title">Title *</Label><Input id="news-title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Enter news title" required /></div>
              
              <div>
                <Label htmlFor="news-category">Category *</Label>
                <Select value={newsForm.category} onValueChange={(value) => setNewsForm({ ...newsForm, category: value })}>
                  <SelectTrigger id="news-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievements">Achievements</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                    <SelectItem value="media_press">Media / Press</SelectItem>
                    <SelectItem value="alumni_stories">Alumni Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div><Label htmlFor="news-summary">Summary</Label><Textarea id="news-summary" value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} placeholder="Brief summary" rows={2} /></div>
              <div><Label htmlFor="news-content">Content *</Label><Textarea id="news-content" value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} placeholder="Write your news..." rows={8} required /></div>
              
              <ImageUpload
                value={newsForm.featured_image_url}
                onChange={(url) => {
                  console.log('📰 News image URL updated:', url);
                  setNewsForm({ ...newsForm, featured_image_url: url });
                }}
                label="Featured Image"
                folder="news"
              />
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg"><Switch id="news-published" checked={newsForm.published} onCheckedChange={(checked) => setNewsForm({ ...newsForm, published: checked })} /><Label htmlFor="news-published" className="cursor-pointer">Publish immediately</Label></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewsDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={actionLoading}>{actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingNews ? 'Update' : 'Create'} News</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle></DialogHeader>
          <form onSubmit={handleEventSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2"><FileText className="h-4 w-4" />Basic Information</h3>
                <div><Label htmlFor="event-title">Event Title *</Label><Input id="event-title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Enter event title" required /></div>
                <div><Label htmlFor="event-description">Description *</Label><Textarea id="event-description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Describe the event..." rows={4} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="event-date">Start Date & Time *</Label><Input id="event-date" type="datetime-local" value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} required /></div>
                  <div><Label htmlFor="event-end-date">End Date & Time</Label><Input id="event-end-date" type="datetime-local" value={eventForm.event_end_date} onChange={(e) => setEventForm({ ...eventForm, event_end_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="event-location">Location</Label><Input id="event-location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="Event venue" /></div>
                  <div><Label htmlFor="event-location-url">Location URL</Label><Input id="event-location-url" type="url" value={eventForm.location_url} onChange={(e) => setEventForm({ ...eventForm, location_url: e.target.value })} placeholder="https://maps.google.com/..." /></div>
                </div>
                
                <ImageUpload
                  value={eventForm.featured_image_url}
                  onChange={(url) => {
                    console.log('🎉 Event image URL updated:', url);
                    setEventForm({ ...eventForm, featured_image_url: url });
                  }}
                  label="Featured Image"
                  folder="events"
                />
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg"><Switch id="event-published" checked={eventForm.published} onCheckedChange={(checked) => setEventForm({ ...eventForm, published: checked })} /><Label htmlFor="event-published" className="cursor-pointer">Publish immediately</Label></div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between"><h3 className="font-medium flex items-center gap-2"><Users className="h-4 w-4" />Event Registration</h3><Switch id="registration-enabled" checked={eventForm.registration_enabled} onCheckedChange={(checked) => setEventForm({ ...eventForm, registration_enabled: checked })} /></div>
                {eventForm.registration_enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="max-attendees">Max Attendees</Label><Input id="max-attendees" type="number" value={eventForm.max_attendees} onChange={(e) => setEventForm({ ...eventForm, max_attendees: e.target.value })} placeholder="Unlimited" /></div>
                      <div><Label htmlFor="registration-deadline">Registration Deadline</Label><Input id="registration-deadline" type="datetime-local" value={eventForm.registration_deadline} onChange={(e) => setEventForm({ ...eventForm, registration_deadline: e.target.value })} /></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><Label>Custom Registration Fields</Label><Button type="button" size="sm" variant="outline" onClick={addRegistrationField}><Plus className="h-3 w-3 mr-1" />Add Field</Button></div>
                      {registrationFields.map((field) => (
                        <Card key={field.id} className="p-3">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input placeholder="Field Label" value={field.label} onChange={(e) => updateRegistrationField(field.id, { label: e.target.value })} />
                                <Select value={field.type} onValueChange={(value) => updateRegistrationField(field.id, { type: value as any })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="tel">Phone</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="textarea">Textarea</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="button" size="sm" variant="ghost" onClick={() => removeRegistrationField(field.id)}><X className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input placeholder="Placeholder" value={field.placeholder || ''} onChange={(e) => updateRegistrationField(field.id, { placeholder: e.target.value })} className="flex-1" />
                              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={field.required} onChange={(e) => updateRegistrationField(field.id, { required: e.target.checked })} className="rounded" />Required</label>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {registrationFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No custom fields. Click "Add Field" to create registration form fields.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={actionLoading}>{actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingEvent ? 'Update' : 'Create'} Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this {deleteTarget?.type}.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={actionLoading}>{actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
