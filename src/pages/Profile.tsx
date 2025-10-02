import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Upload, User, Save, Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  country: string;
  district: string;
  workplace: string;
  bio: string;
  linkedin_url: string;
  graduation_year: number;
  profile_photo_url: string;
}

// Calculate profile completion percentage
const calculateProfileCompletion = (profile: ProfileData) => {
  const fields = [
    { key: 'full_name', label: 'Full Name', value: profile.full_name, required: true },
    { key: 'email', label: 'Email', value: profile.email, required: true },
    { key: 'phone', label: 'Phone Number', value: profile.phone, required: false },
    { key: 'department', label: 'Department', value: profile.department, required: false },
    { key: 'country', label: 'Country', value: profile.country, required: false },
    { key: 'district', label: 'District/State', value: profile.district, required: false },
    { key: 'workplace', label: 'Current Workplace', value: profile.workplace, required: false },
    { key: 'bio', label: 'Biography', value: profile.bio, required: false },
    { key: 'linkedin_url', label: 'LinkedIn Profile', value: profile.linkedin_url, required: false },
    { key: 'profile_photo_url', label: 'Profile Photo', value: profile.profile_photo_url, required: false }
  ];
  
  const filledFields = fields.filter(field => field.value && field.value.toString().trim() !== '');
  const percentage = Math.round((filledFields.length / fields.length) * 100);
  
  return {
    percentage,
    filledFields: filledFields.length,
    totalFields: fields.length,
    fields: fields.map(field => ({
      ...field,
      filled: field.value && field.value.toString().trim() !== ''
    }))
  };
};

// Get completion status
const getCompletionStatus = (percentage: number) => {
  if (percentage >= 90) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
  if (percentage >= 70) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle };
  if (percentage >= 50) return { status: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertCircle };
  return { status: 'Incomplete', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle };
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    country: '',
    district: '',
    workplace: '',
    bio: '',
    linkedin_url: '',
    graduation_year: 1989,
    profile_photo_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          country: data.country || '',
          district: data.district || '',
          workplace: data.workplace || '',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          graduation_year: data.graduation_year || 1989,
          profile_photo_url: data.profile_photo_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, profile_photo_url: data.publicUrl }));
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully"
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">My Profile</h1>
          <p className="text-lg opacity-90">
            Manage your profile information and photo
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Completion Section */}
        {(() => {
          const completion = calculateProfileCompletion(profile);
          const status = getCompletionStatus(completion.percentage);
          const StatusIcon = status.icon;
          
          return (
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StatusIcon className={`h-5 w-5 mr-2 ${status.color}`} />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Progress value={completion.percentage} className="w-48" />
                    <span className="text-2xl font-bold">{completion.percentage}%</span>
                    <Badge className={`${status.color} ${status.bgColor} border-0`}>
                      {status.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {completion.filledFields} of {completion.totalFields} fields completed
                  </div>
                </div>
                
                {completion.percentage < 100 && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">Missing Information:</h4>
                    <div className="flex flex-wrap gap-2">
                      {completion.fields
                        .filter(field => !field.filled)
                        .map(field => (
                          <Badge key={field.key} variant="outline" className="text-xs">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                )}
                
                {completion.percentage >= 80 && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="text-green-800 text-sm">
                      🎉 Great job! Your profile is well-completed and will be more visible to other alumni.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile.profile_photo_url} 
                    alt={profile.full_name} 
                  />
                  <AvatarFallback className="text-lg">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() || <User />}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    </div>
                  </Label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a professional photo (JPG, PNG, max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={profile.graduation_year}
                    onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) })}
                    min="1980"
                    max="2030"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    placeholder="e.g., Computer Science, Economics"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workplace">Current Workplace</Label>
                  <Input
                    id="workplace"
                    value={profile.workplace}
                    onChange={(e) => setProfile({ ...profile, workplace: e.target.value })}
                    placeholder="e.g., Company Name, Organization"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    placeholder="e.g., Bangladesh, USA, UK"
                  />
                </div>
                
                <div>
                  <Label htmlFor="district">District/State</Label>
                  <Input
                    id="district"
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    placeholder="e.g., Dhaka, California, London"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself, your achievements, interests..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="px-8">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}