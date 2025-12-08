'use client';

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, FileText, Image, Calendar, CheckCircle, XCircle, TrendingUp, UserCheck, Mail } from "lucide-react";
import { MemberManagement } from "@/components/admin/MemberManagement";
import NewsEventManagement from "@/components/admin/NewsEventManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import ContactManagement from "@/components/admin/ContactManagement";
import GalleryManagement from "@/components/admin/GalleryManagement";
import { AdminCommitteeManager } from "@/components/admin/AdminCommitteeManager";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    approvedMembers: 0,
    pendingApprovals: 0,
    rejectedMembers: 0,
    newsCount: 0,
    eventsCount: 0,
    galleryAlbums: 0,
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  const fetchStats = async () => {
    try {
      console.log('[Admin Page] User:', user?.email, 'isAdmin:', isAdmin);
      const token = await user?.getIdToken();
      console.log('[Admin Page] Got token:', token ? 'YES' : 'NO');
      
      // Fetch all member stats
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch('/api/admin/members?status=pending', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/admin/members?status=approved', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/admin/members?status=rejected', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      
      console.log('[Admin Page] API responses:', {
        pending: pendingRes.status,
        approved: approvedRes.status,
        rejected: rejectedRes.status
      });
      
      if (pendingRes.ok && approvedRes.ok && rejectedRes.ok) {
        const pendingData = await pendingRes.json();
        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();
        
        console.log('[Admin Page] Data received:', {
          pending: pendingData.members?.length,
          approved: approvedData.members?.length,
          rejected: rejectedData.members?.length
        });
        
        const pending = pendingData.members?.length || 0;
        const approved = approvedData.members?.length || 0;
        const rejected = rejectedData.members?.length || 0;
        
        setStats(prev => ({
          ...prev,
          pendingApprovals: pending,
          approvedMembers: approved,
          rejectedMembers: rejected,
          totalMembers: pending + approved + rejected,
        }));
      } else {
        console.error('[Admin Page] API calls failed:', {
          pending: !pendingRes.ok ? await pendingRes.text() : 'OK',
          approved: !approvedRes.ok ? await approvedRes.text() : 'OK',
          rejected: !rejectedRes.ok ? await rejectedRes.text() : 'OK'
        });
      }
    } catch (error) {
      console.error('[Admin Page] Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading admin panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Manage members, content, and platform settings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2e2c6d]">Total Members</CardTitle>
              <Users className="h-5 w-5 text-[#2e2c6d]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2e2c6d]">{stats.totalMembers}</div>
              <p className="text-xs text-slate-700 mt-1">All registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Pending</CardTitle>
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{stats.pendingApprovals}</div>
              <p className="text-xs text-orange-700 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Approved</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.approvedMembers}</div>
              <p className="text-xs text-green-700 mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Rejected</CardTitle>
              <XCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{stats.rejectedMembers}</div>
              <p className="text-xs text-red-700 mt-1">Declined applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-8 lg:w-auto">
            <TabsTrigger value="pending" className="relative">
              Pending ({stats.pendingApprovals})
              {stats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="members">All Members</TabsTrigger>
            <TabsTrigger value="committee">Committee</TabsTrigger>
            <TabsTrigger value="content">News & Events</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            <MemberManagement />
          </TabsContent>

          <TabsContent value="members" className="space-y-4 mt-6">
            <MemberManagement />
          </TabsContent>

          <TabsContent value="committee" className="space-y-4 mt-6">
            <AdminCommitteeManager />
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-6">
            <NewsEventManagement />
          </TabsContent>

          <TabsContent value="blog" className="space-y-4 mt-6">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4 mt-6">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-6">
            <ContactManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Platform configuration and settings will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
