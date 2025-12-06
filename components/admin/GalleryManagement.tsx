'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FolderPlus, Image as ImageIcon, Upload, X } from 'lucide-react';

interface AlbumType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  order: number;
}

interface Collection {
  id: string;
  albumTypeId: string;
  albumTypeName?: string;
  name: string;
  description: string;
  thumbnail?: string;
  photoCount: number;
  createdAt: string;
  order: number;
}

interface Photo {
  id: string;
  collectionId: string;
  collectionName?: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  createdAt: string;
  order: number;
}

export default function GalleryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [albumTypes, setAlbumTypes] = useState<AlbumType[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbumType, setSelectedAlbumType] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  
  // Dialog states
  const [albumTypeDialogOpen, setAlbumTypeDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [editingAlbumType, setEditingAlbumType] = useState<AlbumType | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  
  // Form states
  const [albumTypeForm, setAlbumTypeForm] = useState({ name: '', description: '', order: 0 });
  const [collectionForm, setCollectionForm] = useState({
    albumTypeId: '',
    name: '',
    description: '',
    order: 0,
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<{ [key: string]: string }>({});
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    fetchAlbumTypes();
    fetchCollections();
    fetchPhotos();
  }, []);

  const fetchAlbumTypes = async () => {
    try {
      console.log('[GalleryManagement] Fetching album types...');
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/gallery/album-types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[GalleryManagement] Album types response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('[GalleryManagement] Album types data:', data);
        setAlbumTypes(data.albumTypes || []);
      } else {
        const errorText = await res.text();
        console.error('[GalleryManagement] Failed to fetch album types:', res.status, errorText);
      }
    } catch (error) {
      console.error('[GalleryManagement] Error fetching album types:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      console.log('[GalleryManagement] Fetching collections...');
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/gallery/collections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[GalleryManagement] Collections response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('[GalleryManagement] Collections data:', data);
        setCollections(data.collections || []);
      } else {
        const errorText = await res.text();
        console.error('[GalleryManagement] Failed to fetch collections:', res.status, errorText);
      }
    } catch (error) {
      console.error('[GalleryManagement] Error fetching collections:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/gallery/photos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleCreateAlbumType = async () => {
    if (!albumTypeForm.name) {
      toast({ title: 'Error', description: 'Album type name is required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/gallery/album-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(albumTypeForm),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Album type created successfully' });
        setAlbumTypeDialogOpen(false);
        setAlbumTypeForm({ name: '', description: '', order: 0 });
        fetchAlbumTypes();
      } else {
        const error = await res.json();
        console.error('API Error:', error);
        toast({ 
          title: 'Error', 
          description: error.error || `Failed with status ${res.status}`, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Create album type error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to create album type', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlbumType = async () => {
    if (!editingAlbumType) return;

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/gallery/album-types/${editingAlbumType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(albumTypeForm),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Album type updated successfully' });
        setAlbumTypeDialogOpen(false);
        setEditingAlbumType(null);
        setAlbumTypeForm({ name: '', description: '', order: 0 });
        fetchAlbumTypes();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update album type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlbumType = async (id: string) => {
    if (!confirm('Are you sure? This will delete all collections and photos under this album type.')) return;

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/gallery/album-types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Album type deleted successfully' });
        fetchAlbumTypes();
        fetchCollections();
        fetchPhotos();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete album type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!collectionForm.name || !collectionForm.albumTypeId) {
      toast({ title: 'Error', description: 'Collection name and album type are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/gallery/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(collectionForm),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Collection created successfully' });
        setCollectionDialogOpen(false);
        setCollectionForm({ albumTypeId: '', name: '', description: '', order: 0 });
        fetchCollections();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create collection', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection) return;

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/gallery/collections/${editingCollection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(collectionForm),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Collection updated successfully' });
        setCollectionDialogOpen(false);
        setEditingCollection(null);
        setCollectionForm({ albumTypeId: '', name: '', description: '', order: 0 });
        fetchCollections();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update collection', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure? This will delete all photos in this collection.')) return;

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/gallery/collections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Collection deleted successfully' });
        fetchCollections();
        fetchPhotos();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete collection', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (photoFiles.length === 0 || !selectedCollection) {
      toast({ title: 'Error', description: 'Please select photos and a collection', variant: 'destructive' });
      return;
    }

    setUploadProgress(true);
    try {
      const token = await user?.getIdToken();

      for (const file of photoFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('collectionId', selectedCollection);
        formData.append('caption', photoCaptions[file.name] || '');

        const res = await fetch('/api/admin/gallery/photos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          toast({ title: 'Error', description: `Failed to upload ${file.name}: ${error.error}`, variant: 'destructive' });
        }
      }

      toast({ title: 'Success', description: `${photoFiles.length} photo(s) uploaded successfully` });
      setPhotoDialogOpen(false);
      setPhotoFiles([]);
      setPhotoCaptions({});
      fetchPhotos();
      fetchCollections();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload photos', variant: 'destructive' });
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/gallery/photos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Photo deleted successfully' });
        fetchPhotos();
        fetchCollections();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete photo', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openEditAlbumTypeDialog = (albumType: AlbumType) => {
    setEditingAlbumType(albumType);
    setAlbumTypeForm({
      name: albumType.name,
      description: albumType.description,
      order: albumType.order,
    });
    setAlbumTypeDialogOpen(true);
  };

  const openEditCollectionDialog = (collection: Collection) => {
    setEditingCollection(collection);
    setCollectionForm({
      albumTypeId: collection.albumTypeId,
      name: collection.name,
      description: collection.description,
      order: collection.order,
    });
    setCollectionDialogOpen(true);
  };

  const filteredCollections = selectedAlbumType
    ? collections.filter((c) => c.albumTypeId === selectedAlbumType)
    : collections;

  const filteredPhotos = selectedCollection
    ? photos.filter((p) => p.collectionId === selectedCollection)
    : photos;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="album-types" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="album-types">Album Types ({albumTypes.length})</TabsTrigger>
          <TabsTrigger value="collections">Collections ({collections.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
        </TabsList>

        {/* Album Types Tab */}
        <TabsContent value="album-types" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Manage Album Types</h3>
              <p className="text-sm text-muted-foreground">Create categories for organizing your photo collections</p>
            </div>
            <Dialog open={albumTypeDialogOpen} onOpenChange={setAlbumTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAlbumType(null);
                  setAlbumTypeForm({ name: '', description: '', order: 0 });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Album Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAlbumType ? 'Edit Album Type' : 'Create Album Type'}</DialogTitle>
                  <DialogDescription>
                    Album types help organize collections (e.g., Events, Memories, Reunions)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="album-type-name">Name *</Label>
                    <Input
                      id="album-type-name"
                      value={albumTypeForm.name}
                      onChange={(e) => setAlbumTypeForm({ ...albumTypeForm, name: e.target.value })}
                      placeholder="e.g., Annual Events"
                    />
                  </div>
                  <div>
                    <Label htmlFor="album-type-description">Description</Label>
                    <Textarea
                      id="album-type-description"
                      value={albumTypeForm.description}
                      onChange={(e) => setAlbumTypeForm({ ...albumTypeForm, description: e.target.value })}
                      placeholder="Brief description of this album type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="album-type-order">Display Order</Label>
                    <Input
                      id="album-type-order"
                      type="number"
                      value={albumTypeForm.order}
                      onChange={(e) => setAlbumTypeForm({ ...albumTypeForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAlbumTypeDialogOpen(false)}>Cancel</Button>
                  <Button onClick={editingAlbumType ? handleUpdateAlbumType : handleCreateAlbumType} disabled={loading}>
                    {loading ? 'Saving...' : editingAlbumType ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albumTypes.map((albumType) => (
              <Card key={albumType.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{albumType.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {albumType.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditAlbumTypeDialog(albumType)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAlbumType(albumType.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {collections.filter((c) => c.albumTypeId === albumType.id).length} collections
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {albumTypes.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No album types yet. Create one to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Manage Collections</h3>
              <p className="text-sm text-muted-foreground">Group photos into themed collections</p>
            </div>
            <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCollection(null);
                  setCollectionForm({ albumTypeId: '', name: '', description: '', order: 0 });
                }}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCollection ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
                  <DialogDescription>
                    Collections contain photos and belong to an album type
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="collection-album-type">Album Type *</Label>
                    <Select
                      value={collectionForm.albumTypeId || undefined}
                      onValueChange={(value) => setCollectionForm({ ...collectionForm, albumTypeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select album type" />
                      </SelectTrigger>
                      <SelectContent>
                        {albumTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="collection-name">Name *</Label>
                    <Input
                      id="collection-name"
                      value={collectionForm.name}
                      onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                      placeholder="e.g., Reunion 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection-description">Description</Label>
                    <Textarea
                      id="collection-description"
                      value={collectionForm.description}
                      onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                      placeholder="Brief description of this collection"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection-order">Display Order</Label>
                    <Input
                      id="collection-order"
                      type="number"
                      value={collectionForm.order}
                      onChange={(e) => setCollectionForm({ ...collectionForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCollectionDialogOpen(false)}>Cancel</Button>
                  <Button onClick={editingCollection ? handleUpdateCollection : handleCreateCollection} disabled={loading}>
                    {loading ? 'Saving...' : editingCollection ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Label>Filter by Album Type</Label>
            <Select value={selectedAlbumType || "all"} onValueChange={(value) => setSelectedAlbumType(value === "all" ? "" : value)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All album types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All album types</SelectItem>
                {albumTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((collection) => (
              <Card key={collection.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {albumTypes.find((t) => t.id === collection.albumTypeId)?.name}
                      </CardDescription>
                      <CardDescription className="text-sm mt-1">
                        {collection.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditCollectionDialog(collection)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCollection(collection.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{collection.photoCount || 0} photos</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCollections.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No collections yet. Create one to organize your photos.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Manage Photos</h3>
              <p className="text-sm text-muted-foreground">Upload and organize photos in collections</p>
            </div>
            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Photos</DialogTitle>
                  <DialogDescription>Select a collection and upload multiple photos</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="photo-collection">Collection *</Label>
                    <Select value={selectedCollection || undefined} onValueChange={setSelectedCollection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name} ({albumTypes.find((t) => t.id === collection.albumTypeId)?.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="photo-files">Photos *</Label>
                    <Input
                      id="photo-files"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setPhotoFiles(files);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Select multiple photos to upload</p>
                  </div>
                  {photoFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Photo Captions (Optional)</Label>
                      {photoFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm flex-1">{file.name}</span>
                          <Input
                            placeholder="Caption"
                            className="w-64"
                            value={photoCaptions[file.name] || ''}
                            onChange={(e) =>
                              setPhotoCaptions({ ...photoCaptions, [file.name]: e.target.value })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handlePhotoUpload} disabled={uploadProgress}>
                    {uploadProgress ? 'Uploading...' : `Upload ${photoFiles.length} Photo(s)`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <Label>Filter by Collection</Label>
            <Select value={selectedCollection || "all"} onValueChange={(value) => setSelectedCollection(value === "all" ? "" : value)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All collections</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {photo.caption && (
                  <CardContent className="pt-3">
                    <p className="text-sm">{photo.caption}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No photos yet. Upload some to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
