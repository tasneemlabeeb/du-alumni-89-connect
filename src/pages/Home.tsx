import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  created_at: string;
}
interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
}
export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=400&fit=crop", "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=400&fit=crop", "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&h=400&fit=crop", "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1920&h=400&fit=crop"];
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [heroImages.length]);
  const fetchData = async () => {
    try {
      // Fetch latest news
      const {
        data: newsData
      } = await supabase.from('news').select('id, title, summary, created_at').eq('published', true).order('created_at', {
        ascending: false
      }).limit(3);

      // Fetch upcoming events
      const {
        data: eventsData
      } = await supabase.from('events').select('id, title, description, event_date, location').gte('event_date', new Date().toISOString()).order('event_date', {
        ascending: true
      }).limit(3);

      // Fetch member count
      const {
        count
      } = await supabase.from('members').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'approved');
      setNews(newsData || []);
      setEvents(eventsData || []);
      setMemberCount(count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden flex items-center justify-center text-center text-white">
        {/* Background Images */}
        {heroImages.map((image, index) => <div key={index} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`} style={{
        backgroundImage: `url(${image})`
      }} />)}
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-6 z-10">
          <h1 className="text-4xl font-bold mb-4 md:text-5xl">
           আমরা একসাথে, বন্ধনের শক্তিতে 
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Connecting generations, building futures together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="min-w-32">Join the Community</Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="min-w-32 bg-white/10 border-white/20 text-white hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-3xl font-bold text-primary">{memberCount}</h3>
              <p className="text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-3xl font-bold text-primary">35+</h3>
              <p className="text-muted-foreground">Years of Excellence</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-3xl font-bold text-primary">50+</h3>
              <p className="text-muted-foreground">Countries Worldwide</p>
            </CardContent>
          </Card>
        </section>

        {/* Notable Alumni Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Notable Alumni</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
            name: "Dr Shariful Dulu",
            position: "Chief Medical Officer",
            company: "Global Health Initiative",
            achievement: "Leading healthcare innovation in South Asia",
            photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
          }, {
            name: "Nasimul Porag",
            position: "Dean of Engineering",
            company: "MIT",
            achievement: "Pioneering sustainable technology research",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          }, {
            name: "Kamrul Hassan",
            position: "CEO",
            company: "TechStartup Solutions",
            achievement: "Building the next generation of fintech",
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
          }].map((alumni, index) => (
  <Card
    key={index}
    className="hover:shadow-lg transition-shadow bg-green-100"
  >
    <CardHeader>
      <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
        <img
          src={alumni.photo}
          alt={alumni.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardTitle className="text-lg">{alumni.name}</CardTitle>
      <div className="text-sm text-muted-foreground">
        <p>{alumni.position}</p>
        <p>{alumni.company}</p>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm">{alumni.achievement}</p>
    </CardContent>
  </Card>
))}
          </div>
        </section>




        
        {/* News & Events Preview */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Latest News */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Latest News</h2>
                <Link to="/news">
                  <Button variant="outline" size="sm">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {news.length > 0 ? news.map(item => <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.summary || 'No summary available'}
                      </p>
                    </CardContent>
                  </Card>) : <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No news articles yet</p>
                    </CardContent>
                  </Card>}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
                <Link to="/news">
                  <Button variant="outline" size="sm">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {events.length > 0 ? events.map(event => <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                        {event.location && <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>) : <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No upcoming events</p>
                    </CardContent>
                  </Card>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>;
}