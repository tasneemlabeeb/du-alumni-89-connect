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
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Photo Gallery</h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Explore memories and moments from DU Alumni 89 Connect
            </p>
          </div>
        </div>

        {/* Login Required Message */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6 text-indigo-900">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Members Only Area</h2>
            <p className="text-lg text-slate-600 mb-8">
              Please log in to access the photo gallery and view memories shared by your fellow alumni.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-indigo-900 hover:bg-indigo-800">
                <Link href="/auth">Log In</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <GalleryContent />;
}

function GalleryContent() {
  const { isApprovedMember, profileComplete, isAdmin } = useAuth();

  // Check profile completion requirement
  if (!profileComplete && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6 text-yellow-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Profile Incomplete</h2>
          <p className="text-slate-600 mb-6">
            Please complete your profile with all mandatory information to access member features like gallery and directory.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Required fields: Full Name, Nick Name, Department, Hall, Contact Number, and Blood Group
          </p>
          <Button asChild className="w-full">
            <Link href="/profile">Complete Your Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check approval requirement
  if (!isApprovedMember && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6 text-blue-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Membership Pending Approval</h2>
          <p className="text-slate-600 mb-6">
            Your membership application is being reviewed by our administrators. You need approval from two admins to access member-only features.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You'll receive access once your application has been approved. This usually takes 24-48 hours.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

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
                    ? 'bg-[#2e2c6d] text-white'
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
                    ? 'bg-[#2e2c6d] text-white'
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
                          ? 'bg-[#2e2c6d] text-white'
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
                            ? 'bg-[#2e2c6d] text-white'
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
                            className="bg-[#2e2c6d] hover:bg-[#252357] text-white px-8 py-2"
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
                            <div className="bg-[#2e2c6d] text-white px-4 py-2 text-center font-semibold">
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
                          <div className="border-t-4 border-[#2e2c6d] mb-6"></div>
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
