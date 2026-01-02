'use client';

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Camera, Loader2, CheckCircle, AlertCircle, Key } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { departments } from "@/lib/data/departments";
import { faculties } from "@/lib/data/faculties";
import { halls } from "@/lib/data/halls";
import { bloodGroups } from "@/lib/data/bloodGroups";
import { districts } from "@/lib/data/districts";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, saveProfile, uploadPhoto, uploadDocument, deleteDocument } = useProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingFamily, setIsUploadingFamily] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const familyPhotoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Local state for form data - initialize with profile or empty
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    nickName: '',
    department: '',
    hall: '',
    faculty: '',
    contactNo: '',
    bloodGroup: '',
    email: user?.email || '',
    dateOfBirth: '',
    homeDistrict: '',
    showBirthdayToMembers: true,
    showMobileToMembers: true,
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

  // Sync formData when profile is loaded from Firestore
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || user?.displayName || '',
        nickName: profile.nickName || '',
        department: profile.department || '',
        hall: profile.hall || '',
        faculty: profile.faculty || '',
        contactNo: profile.contactNo || '',
        bloodGroup: profile.bloodGroup || '',
        email: profile.email || user?.email || '',
        dateOfBirth: profile.dateOfBirth || '',
        homeDistrict: profile.homeDistrict || '',
        showBirthdayToMembers: profile.showBirthdayToMembers !== undefined ? profile.showBirthdayToMembers : true,
        showMobileToMembers: profile.showMobileToMembers !== undefined ? profile.showMobileToMembers : true,
        profession: profile.profession || '',
        maritalStatus: profile.maritalStatus || '',
        children: profile.children || '',
        presentAddress: profile.presentAddress || '',
        permanentAddress: profile.permanentAddress || '',
        city: profile.city || '',
        country: profile.country || '',
        presentCityOfLiving: profile.presentCityOfLiving || '',
        biography: profile.biography || '',
      });
    }
  }, [profile, user]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = Object.entries(formData).filter(([key]) => 
      !key.includes('Photo') && !key.includes('userId') && !key.includes('At')
    );
    const filledFields = fields.filter(([_, value]) => value && String(value).trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Calculate missing mandatory fields
  const getMissingMandatoryFields = () => {
    const mandatoryFields = {
      fullName: 'Full Name',
      nickName: 'Nick Name',
      department: 'Department',
      hall: 'Hall',
      contactNo: 'Contact Number',
      bloodGroup: 'Blood Group'
    };

    return Object.entries(mandatoryFields)
      .filter(([key]) => !formData[key as keyof typeof formData] || String(formData[key as keyof typeof formData]).trim() === '')
      .map(([, label]) => label);
  };

  const missingFields = [
    !formData.fullName && "Full Name",
    !formData.nickName && "Nick Name",
    !formData.department && "Department",
    !formData.hall && "Hall",
    !formData.bloodGroup && "Blood Group",
    !formData.presentAddress && "Present Address",
    !formData.permanentAddress && "Permanent Address",
    !formData.country && "Country",
    !formData.contactNo && "Contact No",
    !formData.email && "Email No",
    !formData.faculty && "Faculty",
    !formData.presentCityOfLiving && "Present city of living",
  ].filter(Boolean);

  const mandatoryMissingFields = getMissingMandatoryFields();

  const handlePhotoUpload = async (file: File, photoType: 'profile' | 'family') => {
    const setUploading = photoType === 'profile' ? setIsUploadingProfile : setIsUploadingFamily;
    
    try {
      setUploading(true);
      const result = await uploadPhoto(file, photoType);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, photoType: 'profile' | 'family') => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file, photoType);
    }
  };

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOC, DOCX, or image files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingDocument(true);
      const result = await uploadDocument(file);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Document uploaded successfully",
        });
        // Clear the input
        if (documentInputRef.current) {
          documentInputRef.current.value = '';
        }
      } else {
        toast({
          title: "Upload Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDocumentDelete = async (documentUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const result = await deleteDocument(documentUrl);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
            <p className="text-muted-foreground">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    // Check if mandatory fields are filled
    const mandatoryMissing = getMissingMandatoryFields();

    if (mandatoryMissing.length > 0) {
      toast({
        title: "Incomplete Profile",
        description: `Please fill in the following mandatory fields: ${mandatoryMissing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveProfile(formData);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Profile saved successfully",
        });
        // Reload to update profile completion status
        window.location.reload();
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      if (!user?.email) {
        throw new Error("User email not found");
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      toast({
        title: "Success!",
        description: "Your password has been changed successfully",
      });

      // Reset form and close dialog
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordDialog(false);

    } catch (error: any) {
      let errorMessage = "Failed to change password";
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log in again before changing your password";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      {/* Hero Header */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{ 
          backgroundImage: "url('/home_page/Banner.jpg')",
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-slate-200">Manage your profile information & photo</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl -mt-8">
        <div className="space-y-6 mt-4">
          {/* Profile Completion Card */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">Profile Completion</h3>
                    <p className="text-sm text-slate-500">
                      {completionPercentage === 100 ? (
                        <span className="text-green-600 font-medium">Complete</span>
                      ) : (
                        <span><span className="text-orange-600 font-medium">Incomplete</span> - {missingFields.length} fields remaining</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
                </div>
              </div>
              
              <Progress value={completionPercentage} className="h-3 mb-4" />
              
              {mandatoryMissingFields.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Mandatory fields missing (complete these to access member features):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mandatoryMissingFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-red-700">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {missingFields.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">Optional fields for complete profile:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {missingFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile & Family Photos */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera size={20} />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    {profile?.profilePhotoUrl ? (
                      <AvatarImage src={profile.profilePhotoUrl} alt="Profile photo" />
                    ) : null}
                    <AvatarFallback className="text-3xl bg-slate-200">
                      {formData.fullName ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'profile')}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={isUploadingProfile}
                  >
                    {isUploadingProfile ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Upload a professional photo (JPEG, PNG, max 5MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera size={20} />
                  Family Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  {profile?.familyPhotoUrl ? (
                    <div className="h-32 w-32 rounded-lg overflow-hidden relative">
                      <Image
                        src={profile.familyPhotoUrl}
                        alt="Family photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Camera size={40} className="text-slate-400" />
                    </div>
                  )}
                  <input
                    ref={familyPhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'family')}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => familyPhotoInputRef.current?.click()}
                    disabled={isUploadingFamily}
                  >
                    {isUploadingFamily ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Upload a professional photo (JPEG, PNG, max 5MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={false}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickName">
                    Nick Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nickName"
                    value={formData.nickName}
                    onChange={(e) => setFormData({ ...formData, nickName: e.target.value })}
                    disabled={false}
                    placeholder="Enter your nick name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department<span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Enter your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hall">
                    Hall<span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.hall} 
                    onValueChange={(value) => setFormData({ ...formData, hall: value })}
                  >
                    <SelectTrigger id="hall">
                      <SelectValue placeholder="Select your hall" />
                    </SelectTrigger>
                    <SelectContent>
                      {halls.map((hall) => (
                        <SelectItem key={hall} value={hall}>
                          {hall}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty">
                    Faculty<span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.faculty} 
                    onValueChange={(value) => setFormData({ ...formData, faculty: value })}
                  >
                    <SelectTrigger id="faculty">
                      <SelectValue placeholder="Enter your faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">
                    Blood Group
                  </Label>
                  <Select 
                    value={formData.bloodGroup} 
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  >
                    <SelectTrigger id="bloodGroup">
                      <SelectValue placeholder="Select your blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((bloodGroup) => (
                        <SelectItem key={bloodGroup} value={bloodGroup}>
                          {bloodGroup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    placeholder="Your email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    placeholder="Select your date of birth"
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="showBirthdayToMembers"
                      checked={formData.showBirthdayToMembers}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, showBirthdayToMembers: checked === true })
                      }
                    />
                    <label
                      htmlFor="showBirthdayToMembers"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Show birthday to other members
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeDistrict">
                    Home District
                  </Label>
                  <Select 
                    value={formData.homeDistrict} 
                    onValueChange={(value) => setFormData({ ...formData, homeDistrict: value })}
                  >
                    <SelectTrigger id="homeDistrict">
                      <SelectValue placeholder="Select your home district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo">
                    Contact No
                  </Label>
                  <Input
                    id="contactNo"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                    disabled={false}
                    placeholder="Enter your contact number"
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="showMobileToMembers"
                      checked={formData.showMobileToMembers}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, showMobileToMembers: checked === true })
                      }
                    />
                    <label
                      htmlFor="showMobileToMembers"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Show mobile number to other members
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Button */}
                <div className="flex flex-col items-center gap-4 py-4 border-2 border-dashed border-slate-200 rounded-lg">
                  <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Upload size={28} className="text-slate-400" />
                  </div>
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleDocumentSelect}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => documentInputRef.current?.click()}
                    disabled={isUploadingDocument}
                  >
                    {isUploadingDocument ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>

                {/* Documents List */}
                {profile?.documents && profile.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {profile.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl">{getFileIcon(doc.name)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                              <p className="text-xs text-slate-500">
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDocumentDelete(doc.url)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!profile?.documents || profile.documents.length === 0) && !isUploadingDocument && (
                  <p className="text-sm text-center text-slate-500 py-4">
                    No documents uploaded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional & Marital Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional & Marital Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    disabled={false}
                    placeholder="Enter your profession"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Input
                    id="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    disabled={false}
                    placeholder="Enter marital status"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="children">Children</Label>
                  <Input
                    id="children"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                    disabled={false}
                    placeholder="Number of children"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="presentAddress">Present Address</Label>
                  <Input
                    id="presentAddress"
                    value={formData.presentAddress}
                    onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                    disabled={false}
                    placeholder="Enter present address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permanentAddress">Permanent Address</Label>
                  <Input
                    id="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    disabled={false}
                    placeholder="Enter permanent address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={false}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={false}
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="presentCityOfLiving">Present City of Living</Label>
                  <Input
                    id="presentCityOfLiving"
                    value={formData.presentCityOfLiving}
                    onChange={(e) => setFormData({ ...formData, presentCityOfLiving: e.target.value })}
                    disabled={false}
                    placeholder="Enter present city of living"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="biography">Biography</Label>
                <Textarea
                  id="biography"
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  disabled={false}
                  placeholder="Tell us about yourself"
                  rows={6}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center gap-4">
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  <Key size={16} className="mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new password
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordDialog(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleSave} 
              size="lg" 
              className="px-12"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
