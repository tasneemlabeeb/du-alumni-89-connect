'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Mail, Phone, MapPin, Briefcase, Calendar, Loader2, FileText, Download, Eye, ShieldCheck, ShieldAlert, Filter } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { departments } from '@/lib/data/departments';
import { halls } from '@/lib/data/halls';
import * as XLSX from 'xlsx';

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approval_count?: number;
  approved_by_admins?: string[];
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
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'make_admin' | 'remove_admin' | null>(null);
  const [currentTab, setCurrentTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionNote, setRejectionNote] = useState<string>('');
  
  // Filter states
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');

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
        body: JSON.stringify({ 
          memberId,
          reason: rejectionNote.trim() || undefined,
        }),
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
      setRejectionNote(''); // Clear the rejection note
      setActionType(null);
    }
  };

  const handleUpdateRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      setActionLoading(userId);
      const token = await user?.getIdToken();

      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      toast({
        title: 'Success',
        description: `User role updated to ${role} successfully`,
      });

      // Refresh the list
      fetchMembers(currentTab);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setSelectedMember(null);
      setActionType(null);
    }
  };

  const exportToExcel = () => {
    try {
      const filteredMembers = members.filter(m => {
        const matchesDept = deptFilter === 'all' || m.profile?.department === deptFilter;
        const matchesHall = hallFilter === 'all' || m.profile?.hall === hallFilter;
        return matchesDept && matchesHall;
      });

      if (filteredMembers.length === 0) {
        toast({
          title: "No data",
          description: "No members match the current filters",
          variant: "destructive"
        });
        return;
      }

      const exportData = filteredMembers.map(m => ({
        'Full Name': m.profile?.fullName || m.full_name,
        'Email': m.email,
        'Phone': m.profile?.contactNo || '',
        'Department/Institute': m.profile?.department || '',
        'Hall': m.profile?.hall || '',
        'Profession': m.profile?.profession || '',
        'City': m.profile?.presentCityOfLiving || '',
        'Status': m.status,
        'Joined Date': new Date(m.created_at).toLocaleDateString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Members");
      
      // Generate filename with filters
      let filename = "Approved_Members";
      if (deptFilter !== 'all') filename += `_${deptFilter.replace(/\s+/g, '_')}`;
      if (hallFilter !== 'all') filename += `_${hallFilter.replace(/\s+/g, '_')}`;
      filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

      XLSX.writeFile(workbook, filename);
      
      toast({
        title: "Success",
        description: `Exported ${filteredMembers.length} members to Excel`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate Excel file",
        variant: "destructive"
      });
    }
  };

  const confirmAction = (member: Member, action: 'approve' | 'reject' | 'make_admin' | 'remove_admin') => {
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>
              View and manage member applications
            </CardDescription>
          </div>
          {currentTab === 'approved' && (
            <Button variant="outline" size="sm" onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export to Excel
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              {currentTab === 'approved' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Department/Institute" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments/Institutes</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={hallFilter} onValueChange={setHallFilter}>
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Hall" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Halls</SelectItem>
                      {halls.map(hall => (
                        <SelectItem key={hall} value={hall}>{hall}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(deptFilter !== 'all' || hallFilter !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setDeptFilter('all'); setHallFilter('all'); }}
                      className="h-8 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>

            <TabsContent value={currentTab} className="mt-0">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No {currentTab} members found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members
                    .filter(m => {
                      if (currentTab !== 'approved') return true;
                      const matchesDept = deptFilter === 'all' || m.profile?.department === deptFilter;
                      const matchesHall = hallFilter === 'all' || m.profile?.hall === hallFilter;
                      return matchesDept && matchesHall;
                    })
                    .map((member) => (
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
                                <div className="mt-1 flex items-center gap-2">
                                  {getStatusBadge(member.status)}
                                  {member.status === 'pending' && member.approval_count !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      {member.approval_count}/2 Approvals
                                    </Badge>
                                  )}
                                </div>
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
                          <div className="flex lg:flex-col gap-2 flex-shrink-0">
                            {currentTab === 'pending' && (
                              <>
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
                              </>
                            )}
                            
                            {currentTab === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => confirmAction(member, (member as any).role === 'admin' ? 'remove_admin' : 'make_admin')}
                                disabled={actionLoading === member.id}
                                className="min-w-[120px]"
                              >
                                {actionLoading === member.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (member as any).role === 'admin' ? (
                                  <>
                                    <ShieldAlert className="w-4 h-4 mr-1 text-amber-600" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4 mr-1 text-blue-600" />
                                    Make Admin
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
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
              {actionType === 'approve' ? 'Approve Member' : 
               actionType === 'reject' ? 'Reject Member' :
               actionType === 'make_admin' ? 'Make Admin' : 'Remove Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' ? (
                <>
                  Are you sure you want to approve <strong>{selectedMember?.full_name}</strong>? 
                  They will gain full access to the platform.
                </>
              ) : actionType === 'reject' ? (
                <>
                  <p className="mb-4">
                    Are you sure you want to reject <strong>{selectedMember?.full_name}</strong>? 
                    They will not be able to access the platform.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="rejectionNote">
                      Rejection Note (Optional)
                    </Label>
                    <Textarea
                      id="rejectionNote"
                      placeholder="Enter a reason for rejection. This will be sent to the applicant via email."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      The applicant will receive an email notification with this note.
                    </p>
                  </div>
                </>
              ) : actionType === 'make_admin' ? (
                <>
                  Are you sure you want to make <strong>{selectedMember?.full_name}</strong> an admin? 
                  They will have full access to the admin panel.
                </>
              ) : (
                <>
                  Are you sure you want to remove admin privileges from <strong>{selectedMember?.full_name}</strong>?
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
                  } else if (actionType === 'reject') {
                    handleReject(selectedMember.id);
                  } else if (actionType === 'make_admin') {
                    handleUpdateRole(selectedMember.user_id, 'admin');
                  } else if (actionType === 'remove_admin') {
                    handleUpdateRole(selectedMember.user_id, 'user');
                  }
                }
              }}
              className={actionType === 'reject' || actionType === 'remove_admin' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
