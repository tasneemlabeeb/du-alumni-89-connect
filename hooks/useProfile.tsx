'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface ProfileData {
  // Basic Information
  fullName: string;
  nickName: string;
  department: string;
  hall: string;
  faculty: string;
  contactNo: string;
  bloodGroup: string;
  email: string;
  
  // Professional & Marital Information
  profession: string;
  maritalStatus: string;
  children: string;
  
  // Location Information
  presentAddress: string;
  permanentAddress: string;
  city: string;
  country: string;
  presentCityOfLiving: string;
  
  // About Me
  biography: string;
  
  // Photos
  profilePhotoUrl?: string;
  familyPhotoUrl?: string;
  
  // Documents
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  
  // Metadata
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await user?.getIdToken();
      const response = await fetch('/api/profile', {
        headers: {
          'x-user-id': user?.uid || '',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      if (data.profile) {
        setProfile(data.profile);
      } else {
        // Initialize empty profile with user's email
        setProfile({
          fullName: user?.displayName || '',
          email: user?.email || '',
          nickName: '',
          department: '',
          hall: '',
          faculty: '',
          contactNo: '',
          bloodGroup: '',
          profession: '',
          maritalStatus: '',
          children: '',
          presentAddress: '',
          permanentAddress: '',
          city: '',
          country: '',
          presentCityOfLiving: '',
          biography: '',
        });
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<ProfileData>) => {
    try {
      setError(null);
      const token = await user?.getIdToken();
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || '',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      return { success: true, message: data.message };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const uploadPhoto = async (file: File, photoType: 'profile' | 'family') => {
    try {
      setError(null);
      const token = await user?.getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photoType', photoType);

      const response = await fetch('/api/profile/upload-photo', {
        method: 'POST',
        headers: {
          'x-user-id': user?.uid || '',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }

      const data = await response.json();
      
      // Update local profile state with new photo URL
      setProfile(prev => prev ? {
        ...prev,
        [photoType === 'profile' ? 'profilePhotoUrl' : 'familyPhotoUrl']: data.url,
      } : null);

      return { success: true, url: data.url, message: data.message };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const uploadDocument = async (file: File) => {
    try {
      setError(null);
      const token = await user?.getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload-document', {
        method: 'POST',
        headers: {
          'x-user-id': user?.uid || '',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const data = await response.json();
      
      // Refresh profile to get updated documents list
      await fetchProfile();

      return { success: true, url: data.url, message: data.message };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteDocument = async (documentUrl: string) => {
    try {
      setError(null);
      const token = await user?.getIdToken();

      const response = await fetch('/api/profile/delete-document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || '',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ documentUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }

      // Refresh profile to get updated documents list
      await fetchProfile();

      return { success: true, message: 'Document deleted successfully' };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    profile,
    loading,
    error,
    saveProfile,
    uploadPhoto,
    uploadDocument,
    deleteDocument,
    refetch: fetchProfile,
  };
}
