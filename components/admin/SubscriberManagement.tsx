'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export function SubscriberManagement() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchSubscribers();
    }
  }, [user]);

  const fetchSubscribers = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/subscribers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const dataToExport = filteredSubscribers.map(sub => ({
      'Email Address': sub.email,
      'Subscription Date': sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
    
    // Set column widths
    const wscols = [
      { wch: 40 }, // Email
      { wch: 25 }  // Date
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
            disabled={filteredSubscribers.length === 0}
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Subscribers ({filteredSubscribers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">Loading subscribers...</TableCell>
                </TableRow>
              ) : filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">No subscribers found.</TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
