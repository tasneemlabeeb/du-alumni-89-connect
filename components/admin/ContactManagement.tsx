'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Mail, 
  MessageSquare, 
  DollarSign, 
  Loader2, 
  Eye, 
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  CheckCheck
} from 'lucide-react';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'enquiry' | 'feedback' | 'fundraising';
  status: 'unread' | 'read' | 'responded';
  created_at: string;
}

export default function ContactManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('type', activeTab);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/contact?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contact submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (submissionId: string, status: string) => {
    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/contact?id=${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });

      fetchSubmissions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/contact?id=${submissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: 'Success',
        description: 'Submission deleted successfully',
      });

      fetchSubmissions();
      setShowViewDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enquiry': return <Mail className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      case 'fundraising': return <DollarSign className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'enquiry': 'Enquiry',
      'feedback': 'Feedback',
      'fundraising': 'Fund Raising',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'enquiry': 'bg-blue-100 text-blue-800',
      'feedback': 'bg-green-100 text-green-800',
      'fundraising': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; color: string; label: string }> = {
      'unread': { icon: Circle, color: 'bg-red-100 text-red-800', label: 'Unread' },
      'read': { icon: CheckCircle2, color: 'bg-yellow-100 text-yellow-800', label: 'Read' },
      'responded': { icon: CheckCheck, color: 'bg-green-100 text-green-800', label: 'Responded' },
    };
    const { icon: Icon, color, label } = config[status] || config['unread'];
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Submissions
              </CardTitle>
              <CardDescription>
                Manage enquiries, feedback, and fundraising requests
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="enquiry" className="gap-2">
                <Mail className="h-4 w-4" />
                Enquiry
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="fundraising" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Fund Raising
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 space-y-3">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No submissions found</h3>
                  <p className="text-muted-foreground">
                    There are no contact submissions at the moment
                  </p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{submission.subject}</h3>
                            <Badge className={getTypeColor(submission.type)}>
                              {getTypeIcon(submission.type)}
                              <span className="ml-1">{getTypeLabel(submission.type)}</span>
                            </Badge>
                            {getStatusBadge(submission.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {submission.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {submission.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {submission.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(submission.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowViewDialog(true);
                              if (submission.status === 'unread') {
                                handleUpdateStatus(submission.id, 'read');
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(submission.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Submission Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.subject}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge className={getTypeColor(selectedSubmission?.type || '')}>
                  {getTypeIcon(selectedSubmission?.type || '')}
                  <span className="ml-1">{getTypeLabel(selectedSubmission?.type || '')}</span>
                </Badge>
                {selectedSubmission && getStatusBadge(selectedSubmission.status)}
                <span className="text-sm">
                  {selectedSubmission?.created_at && new Date(selectedSubmission.created_at).toLocaleString()}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">From</h4>
                <p className="text-sm">{selectedSubmission.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSubmission.email}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Select
                  value={selectedSubmission.status}
                  onValueChange={(value) => handleUpdateStatus(selectedSubmission.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Mark as Unread</SelectItem>
                    <SelectItem value="read">Mark as Read</SelectItem>
                    <SelectItem value="responded">Mark as Responded</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <a href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
