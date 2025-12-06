'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlbumType {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface Collection {
  id: string;
  albumTypeId: string;
  name: string;
  description: string;
  photoCount: number;
  thumbnail?: string;
  order?: number;
  createdAt?: any;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export default function GalleryPage() {
  const [albumTypes, setAlbumTypes] = useState<AlbumType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [photosLimit, setPhotosLimit] = useState(10);
  const [collectionPhotos, setCollectionPhotos] = useState<Record<string, Photo[]>>({});
  const [selectedAlbumType, setSelectedAlbumType] = useState<string>('all');
  const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryMode, setGalleryMode] = useState<'photo' | 'video'>('photo');

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);

      // Fetch album types from API
      console.log('[Gallery] Fetching album types...');
      const albumTypesRes = await fetch('/api/gallery/album-types');
      const albumTypesData = await albumTypesRes.json();
      console.log('[Gallery] Album types:', albumTypesData);
      setAlbumTypes(albumTypesData.albumTypes || []);

      // Fetch collections from API
      console.log('[Gallery] Fetching collections...');
      const collectionsRes = await fetch('/api/gallery/collections');
      const collectionsData = await collectionsRes.json();
      console.log('[Gallery] Collections:', collectionsData);
      setCollections(collectionsData.collections || []);

      // Fetch recent 10 photos
      await fetchRecentPhotos();
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPhotos = async () => {
    try {
      console.log('[Gallery] Fetching recent photos...');
      const photosRes = await fetch('/api/gallery/photos/recent');
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        console.log('[Gallery] Recent photos:', photosData);
        setRecentPhotos(photosData.photos || []);
        setAllPhotos(photosData.photos || []);
      }
    } catch (error) {
      console.error('Error fetching recent photos:', error);
    }
  };

  const loadMorePhotos = () => {
    setPhotosLimit(prev => prev + 10);
  };

  const fetchPhotosForCollection = async (collectionId: string) => {
    try {
      console.log('[Gallery] Fetching photos for collection:', collectionId);
      const photosRes = await fetch(`/api/gallery/photos?collectionId=${collectionId}`);
      const photosData = await photosRes.json();
      console.log('[Gallery] Photos data:', photosData);
      return photosData.photos || [];
    } catch (error) {
      console.error('Error fetching photos:', error);
      return [];
    }
  };

  const handleCollectionToggle = async (collection: Collection) => {
    if (expandedCollection === collection.id) {
      setExpandedCollection(null);
    } else {
      setExpandedCollection(collection.id);
      // Fetch photos if not already fetched
      if (!collectionPhotos[collection.id]) {
        const photos = await fetchPhotosForCollection(collection.id);
        setCollectionPhotos(prev => ({ ...prev, [collection.id]: photos }));
      }
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const filteredCollections =
    selectedAlbumType === 'all'
      ? collections
      : collections.filter((c) => c.albumTypeId === selectedAlbumType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading gallery...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center text-white py-24"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/gallery/gallery_hero_bg.jpg)',
        }}
      >
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Gallery
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              A picture is worth a thousand memories. From reunions and events to shared celebrations,<br />
              our gallery captures the spirit and stories of DUAAB 89
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Photo/Video Gallery Toggle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setGalleryMode('photo')}
                className={`flex items-center justify-center gap-2 px-6 py-4 transition-colors rounded-tl-lg ${
                  galleryMode === 'photo'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="font-medium">Photo Gallery</span>
              </button>
              <button
                onClick={() => setGalleryMode('video')}
                className={`flex items-center justify-center gap-2 px-6 py-4 transition-colors rounded-tr-lg ${
                  galleryMode === 'video'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video className="h-5 w-5" />
                <span className="font-medium">Video Gallery</span>
              </button>
            </div>

            {galleryMode === 'photo' ? (
              <div className="mt-6">
                {/* Album Type Tabs */}
                <div className="border-t border-gray-200">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${albumTypes.length + 1}, 1fr)` }}>
                    <button
                      onClick={() => setSelectedAlbumType('all')}
                      className={`px-4 py-3 font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                        selectedAlbumType === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Photos
                    </button>
                    {albumTypes.map((type, index) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedAlbumType(type.id)}
                        className={`px-4 py-3 font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
                          selectedAlbumType === type.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collections Grid */}
                <div className="p-6">
                  {selectedAlbumType === 'all' ? (
                    /* All Photos View */
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allPhotos.slice(0, photosLimit).map((photo) => (
                          <div
                            key={photo.id}
                            className="aspect-square bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handlePhotoClick(photo)}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Photo'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      {photosLimit < allPhotos.length && (
                        <div className="text-center">
                          <Button 
                            onClick={loadMorePhotos}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2"
                          >
                            Load More Photos
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Collections View for specific album types */
                    filteredCollections.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filteredCollections.map((collection) => (
                          <div key={collection.id} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                            {/* Collection Header */}
                            <div className="bg-indigo-600 text-white px-4 py-2 text-center font-semibold">
                              {collection.name}
                            </div>
                            
                            {/* Collection Thumbnail/Info */}
                            <div 
                              className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => handleCollectionToggle(collection)}
                            >
                              {collection.thumbnail ? (
                                <img
                                  src={collection.thumbnail}
                                  alt={collection.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-4">
                                  <p className="text-gray-500 text-sm">
                                    {collection.description || 'Click to view photos'}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Collection Footer */}
                            <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-600">
                              {collection.photoCount || 0} photo{collection.photoCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Photos - Show below all collections */}
                      {expandedCollection && collectionPhotos[expandedCollection] && (
                        <div className="mt-8 mb-6">
                          <div className="border-t-4 border-indigo-600 mb-6"></div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {collectionPhotos[expandedCollection].map((photo) => (
                            <div
                              key={photo.id}
                              className="aspect-square bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handlePhotoClick(photo)}
                            >
                              <img
                                src={photo.url}
                                alt={photo.caption || filteredCollections.find(c => c.id === expandedCollection)?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No collections available for this album.
                    </div>
                  )
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                Video gallery coming soon...
              </div>
            )}
          </div>
        </div>

        {/* Photo Viewer Dialog */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="sr-only">Photo Viewer</DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="space-y-4">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || ''}
                  className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
                />
                {selectedPhoto.caption && (
                  <p className="text-center text-gray-600 text-lg">{selectedPhoto.caption}</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
