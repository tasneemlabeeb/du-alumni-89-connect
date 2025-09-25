import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Image, Calendar, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  album_name: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [albumFilter, setAlbumFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isApprovedMember } = useAuth();

  const albums = Array.from(new Set(galleryItems.map(item => item.album_name).filter(Boolean)));

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [albumFilter, galleryItems]);

  const fetchGalleryItems = async () => {
    if (!isApprovedMember) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gallery')
        .select(`
          *,
          profiles!gallery_uploaded_by_fkey (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...galleryItems];

    if (albumFilter !== 'all') {
      filtered = filtered.filter(item => item.album_name === albumFilter);
    }

    setFilteredItems(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isApprovedMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">
            Only approved members can view the photo gallery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-accent py-12 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-lg opacity-90">
            Memories from our reunions, events, and special moments
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter */}
        {albums.length > 0 && (
          <div className="mb-8">
            <Select value={albumFilter} onValueChange={setAlbumFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by Album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albums.map(album => (
                  <SelectItem key={album} value={album!}>{album}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} of {galleryItems.length} photos
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className="aspect-square bg-muted cursor-pointer relative group"
                onClick={() => setSelectedImage(item.image_url)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2">{item.title}</h3>
                
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  {item.album_name && (
                    <Badge variant="secondary" className="text-xs">
                      {item.album_name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(item.created_at)}
                  </div>
                  
                  {item.profiles && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-20">
                        {item.profiles.full_name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No photos found</h3>
            <p className="text-muted-foreground">
              {albumFilter !== 'all' 
                ? 'Try selecting a different album' 
                : 'Photos will appear here once they are uploaded'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}