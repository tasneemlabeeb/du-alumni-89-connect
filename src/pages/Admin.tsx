import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  Shield,
  Calendar,
  Newspaper,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import NewsEventManagement from '@/components/admin/NewsEventManagement';

interface PendingMember {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    department: string;
    country: string;
    workplace: string;
  } | null;
}

interface Member {
  id: string;
  user_id: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
    department: string;
    country: string;
    workplace: string;
  } | null;
}

export default function Admin() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch pending members
      const { data: pendingData } = await supabase
        .from('members')
        .select('id, user_id, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch all members
      const { data: allMembersData } = await supabase
        .from('members')
        .select('id, user_id, status')
        .order('created_at', { ascending: false });

      // Fetch profiles for all users
      const userIds = [...new Set([
        ...(pendingData?.map(m => m.user_id) || []),
        ...(allMembersData?.map(m => m.user_id) || [])
      ])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, department, country, workplace')
        .in('user_id', userIds);

      // Create profile lookup
      const profileLookup = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Combine data
      const pendingWithProfiles = (pendingData || []).map(member => ({
        ...member,
        profiles: profileLookup[member.user_id] || null
      }));

      const allMembersWithProfiles = (allMembersData || []).map(member => ({
        ...member,
        profiles: profileLookup[member.user_id] || null
      }));

      // Calculate stats
      const total = allMembersWithProfiles?.length || 0;
      const approved = allMembersWithProfiles?.filter(m => m.status === 'approved').length || 0;
      const pending = allMembersWithProfiles?.filter(m => m.status === 'pending').length || 0;
      const rejected = allMembersWithProfiles?.filter(m => m.status === 'rejected').length || 0;

      setPendingMembers(pendingWithProfiles);
      setAllMembers(allMembersWithProfiles);
      setStats({ total, approved, pending, rejected });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAction = async (memberId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_at: action === 'approve' ? new Date().toISOString() : null
        })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Member ${action}d successfully`,
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} member`,
        variant: "destructive"
      });
    }
  };

  const exportMemberData = async () => {
    try {
      const approvedMembers = allMembers.filter(m => m.status === 'approved');
      
      const csvData = approvedMembers.map(member => ({
        'Full Name': member.profiles?.full_name || '',
        'Email': member.profiles?.email || '',
        'Department': member.profiles?.department || '',
        'Country': member.profiles?.country || '',
        'Workplace': member.profiles?.workplace || ''
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `du-alumni-89-members-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Member data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-lg opacity-90">
            Manage members, content, and website settings
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <UserX className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="members">All Members</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Member Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingMembers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{member.profiles?.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                          <div className="flex gap-2 mt-1">
                            {member.profiles?.department && (
                              <Badge variant="outline">{member.profiles.department}</Badge>
                            )}
                            {member.profiles?.country && (
                              <Badge variant="outline">{member.profiles.country}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied: {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleMemberAction(member.id, 'approve')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleMemberAction(member.id, 'reject')}
                            variant="destructive"
                            size="sm"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending applications</h3>
                    <p className="text-muted-foreground">
                      All member applications have been processed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Members</CardTitle>
                <Button onClick={exportMemberData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <span className="font-medium">{member.profiles?.full_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {member.profiles?.email}
                        </span>
                      </div>
                      <Badge 
                        variant={
                          member.status === 'approved' ? 'default' : 
                          member.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <NewsEventManagement />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Website configuration and settings will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}