'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Mail, Phone, MapPin, Briefcase, Calendar, Loader2, FileText, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profile?: {
    fullName?: string;
    nickName?: string;
    department?: string;
    hall?: string;
    faculty?: string;
    contactNo?: string;
    bloodGroup?: string;
    profession?: string;
    maritalStatus?: string;
    children?: string;
    presentAddress?: string;
    permanentAddress?: string;
    city?: string;
    country?: string;
    presentCityOfLiving?: string;
    biography?: string;
    profilePhotoUrl?: string;
    familyPhotoUrl?: string;
    documents?: Array<{
      name: string;
      url: string;
      type: string;
      uploadedAt: string;
    }>;
  };
}

export function MemberManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [currentTab, setCurrentTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (user) {
      fetchMembers(currentTab);
    }
  }, [currentTab, user]);

  const fetchMembers = async (status: 'pending' | 'approved' | 'rejected') => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      
      if (!token) {
        console.error('No auth token available');
        toast({
          title: 'Error',
          description: 'Please sign in to access admin features',
          variant: 'destructive',
        });
        return;
      }

      console.log('Fetching members with status:', status);
      const response = await fetch(`/api/admin/members?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Members fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch members: ${response.status}`);
      }

      const data = await response.json();
      console.log('Members fetched:', data.members?.length || 0, 'items');
      setMembers(data.members || []);
    } catch (error: any) {
      console.error('Error in fetchMembers:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: string) => {
    try {
      setActionLoading(memberId);
      const token = await user?.getIdToken();

      const response = await fetch('/api/admin/members/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve member');
      }

      toast({
        title: 'Success',
        description: 'Member approved successfully',
      });

      // Refresh the list
      fetchMembers(currentTab);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve member',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setSelectedMember(null);
      setActionType(null);
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      setActionLoading(memberId);
      const token = await user?.getIdToken();

      const response = await fetch('/api/admin/members/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject member');
      }

      toast({
        title: 'Success',
        description: 'Member rejected successfully',
      });

      // Refresh the list
      fetchMembers(currentTab);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject member',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setSelectedMember(null);
      setActionType(null);
    }
  };

  const confirmAction = (member: Member, action: 'approve' | 'reject') => {
    setSelectedMember(member);
    setActionType(action);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading members...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>
            View and manage member applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No {currentTab} members found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <Card key={member.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Profile Photo */}
                          <div className="flex-shrink-0">
                            {member.profile?.profilePhotoUrl ? (
                              <img
                                src={member.profile.profilePhotoUrl}
                                alt={member.full_name}
                                className="w-24 h-24 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="w-12 h-12 text-slate-400" />
                              </div>
                            )}
                          </div>

                          {/* Member Info */}
                          <div className="flex-grow space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold">
                                  {member.profile?.fullName || member.full_name}
                                </h3>
                                {member.profile?.nickName && (
                                  <p className="text-sm text-muted-foreground">
                                    ({member.profile.nickName})
                                  </p>
                                )}
                                <div className="mt-1">{getStatusBadge(member.status)}</div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{member.email}</span>
                              </div>

                              {member.profile?.contactNo && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{member.profile.contactNo}</span>
                                </div>
                              )}

                              {member.profile?.department && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {member.profile.department}
                                    {member.profile.faculty && ` - ${member.profile.faculty}`}
                                  </span>
                                </div>
                              )}

                              {member.profile?.presentCityOfLiving && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{member.profile.presentCityOfLiving}</span>
                                </div>
                              )}

                              {member.profile?.profession && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                                  <span>{member.profile.profession}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  Applied: {new Date(member.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {member.profile?.biography && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {member.profile.biography}
                                </p>
                              </div>
                            )}

                            {/* Uploaded Documents */}
                            {member.profile?.documents && member.profile.documents.length > 0 && (
                              <div className="mt-4 pt-3 border-t">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    Uploaded Documents ({member.profile.documents.length})
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {member.profile.documents.map((doc, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-lg">{getFileIcon(doc.name)}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate" title={doc.name}>
                                            {doc.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-1 ml-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => window.open(doc.url, '_blank')}
                                          title="View document"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = doc.url;
                                            link.download = doc.name;
                                            link.click();
                                          }}
                                          title="Download document"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {currentTab === 'pending' && (
                            <div className="flex lg:flex-col gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => confirmAction(member, 'approve')}
                                disabled={actionLoading === member.id}
                                className="min-w-[100px]"
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => confirmAction(member, 'reject')}
                                disabled={actionLoading === member.id}
                                className="min-w-[100px]"
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedMember && !!actionType} onOpenChange={() => {
        setSelectedMember(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Member' : 'Reject Member'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' ? (
                <>
                  Are you sure you want to approve <strong>{selectedMember?.full_name}</strong>? 
                  They will gain full access to the platform.
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>{selectedMember?.full_name}</strong>? 
                  They will not be able to access the platform.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedMember) {
                  if (actionType === 'approve') {
                    handleApprove(selectedMember.id);
                  } else {
                    handleReject(selectedMember.id);
                  }
                }
              }}
              className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
