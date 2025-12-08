'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, GripVertical } from 'lucide-react';
import Image from 'next/image';

interface CommitteeMember {
  id: string;
  name: string;
  position: string;
  department: string;
  photoURL?: string;
  order: number;
}

interface Committee {
  id: string;
  name: string;
  type: 'current' | 'previous' | 'honours';
  year?: string;
  order: number;
  pdfURL?: string; // For previous committees
}

export function AdminCommitteeManager() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddCommitteeOpen, setIsAddCommitteeOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const { toast } = useToast();

  // Form states
  const [newCommittee, setNewCommittee] = useState({
    name: '',
    type: 'current' as 'current' | 'previous' | 'honours',
    year: '',
    pdfFile: null as File | null,
  });

  const [newMember, setNewMember] = useState({
    name: '',
    position: '',
    department: '',
    photoFile: null as File | null,
  });

  useEffect(() => {
    fetchCommittees();
  }, []);

  useEffect(() => {
    if (selectedCommittee) {
      fetchMembers(selectedCommittee);
    }
  }, [selectedCommittee]);

  const fetchCommittees = async () => {
    try {
      const committeesRef = collection(db, 'committees');
      const q = query(committeesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const committeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Committee[];
      
      setCommittees(committeesData);
      
      if (!selectedCommittee && committeesData.length > 0) {
        setSelectedCommittee(committeesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching committees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch committees',
        variant: 'destructive',
      });
    }
  };

  const fetchMembers = async (committeeId: string) => {
    try {
      const membersRef = collection(db, 'committees', committeeId, 'members');
      const q = query(membersRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommitteeMember[];
      
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddCommittee = async () => {
    if (!newCommittee.name.trim()) {
      toast({
        title: 'Error',
        description: 'Committee name is required',
        variant: 'destructive',
      });
      return;
    }

    // For previous committees, PDF is required
    if (newCommittee.type === 'previous' && !newCommittee.pdfFile) {
      toast({
        title: 'Error',
        description: 'PDF document is required for previous committees',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let pdfURL = '';
      
      // Upload PDF if provided (for previous committees)
      if (newCommittee.pdfFile) {
        const storageRef = ref(storage, `committee-pdfs/${Date.now()}_${newCommittee.pdfFile.name}`);
        await uploadBytes(storageRef, newCommittee.pdfFile);
        pdfURL = await getDownloadURL(storageRef);
      }

      const committeesRef = collection(db, 'committees');
      const newOrder = committees.length;
      
      const committeeData: any = {
        name: newCommittee.name,
        type: newCommittee.type,
        year: newCommittee.year || null,
        order: newOrder,
        createdAt: new Date(),
      };

      if (pdfURL) {
        committeeData.pdfURL = pdfURL;
      }
      
      await addDoc(committeesRef, committeeData);

      toast({
        title: 'Success',
        description: 'Committee created successfully',
      });

      setNewCommittee({ name: '', type: 'current', year: '', pdfFile: null });
      setIsAddCommitteeOpen(false);
      fetchCommittees();
    } catch (error) {
      console.error('Error adding committee:', error);
      toast({
        title: 'Error',
        description: 'Failed to create committee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedCommittee) return;
    if (!newMember.name.trim() || !newMember.position.trim()) {
      toast({
        title: 'Error',
        description: 'Name and position are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let photoURL = '';
      
      if (newMember.photoFile) {
        const storageRef = ref(storage, `committee-photos/${selectedCommittee}/${Date.now()}_${newMember.photoFile.name}`);
        await uploadBytes(storageRef, newMember.photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const membersRef = collection(db, 'committees', selectedCommittee, 'members');
      const newOrder = members.length;
      
      await addDoc(membersRef, {
        name: newMember.name,
        position: newMember.position,
        department: newMember.department,
        photoURL,
        order: newOrder,
        createdAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Member added successfully',
      });

      setNewMember({ name: '', position: '', department: '', photoFile: null });
      setIsAddMemberOpen(false);
      fetchMembers(selectedCommittee);
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedCommittee || !editingMember) return;
    
    setLoading(true);
    try {
      let photoURL = editingMember.photoURL;
      
      if (newMember.photoFile) {
        const storageRef = ref(storage, `committee-photos/${selectedCommittee}/${Date.now()}_${newMember.photoFile.name}`);
        await uploadBytes(storageRef, newMember.photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const memberRef = doc(db, 'committees', selectedCommittee, 'members', editingMember.id);
      await updateDoc(memberRef, {
        name: newMember.name,
        position: newMember.position,
        department: newMember.department,
        photoURL,
        updatedAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });

      setEditingMember(null);
      setNewMember({ name: '', position: '', department: '', photoFile: null });
      setIsAddMemberOpen(false);
      fetchMembers(selectedCommittee);
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!selectedCommittee) return;
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const memberRef = doc(db, 'committees', selectedCommittee, 'members', memberId);
      await deleteDoc(memberRef);

      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });

      fetchMembers(selectedCommittee);
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCommittee = async (committeeId: string) => {
    if (!confirm('Are you sure you want to delete this committee and all its members?')) return;

    try {
      // Delete all members first
      const membersRef = collection(db, 'committees', committeeId, 'members');
      const membersSnapshot = await getDocs(membersRef);
      
      for (const memberDoc of membersSnapshot.docs) {
        await deleteDoc(memberDoc.ref);
      }

      // Then delete the committee
      const committeeRef = doc(db, 'committees', committeeId);
      await deleteDoc(committeeRef);

      toast({
        title: 'Success',
        description: 'Committee deleted successfully',
      });

      if (selectedCommittee === committeeId) {
        setSelectedCommittee(null);
        setMembers([]);
      }
      
      fetchCommittees();
    } catch (error) {
      console.error('Error deleting committee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete committee',
        variant: 'destructive',
      });
    }
  };

  const selectedCommitteeData = committees.find(c => c.id === selectedCommittee);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Committee Management</h2>
        <Dialog open={isAddCommitteeOpen} onOpenChange={setIsAddCommitteeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={16} />
              Add Committee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Committee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="committee-name">Committee Name</Label>
                <Input
                  id="committee-name"
                  value={newCommittee.name}
                  onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
                  placeholder="e.g., Executive Committee"
                />
              </div>
              <div>
                <Label htmlFor="committee-type">Type</Label>
                <Select
                  value={newCommittee.type}
                  onValueChange={(value: 'current' | 'previous' | 'honours') => 
                    setNewCommittee({ ...newCommittee, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Committee</SelectItem>
                    <SelectItem value="previous">Previous Committee</SelectItem>
                    <SelectItem value="honours">Honours Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="committee-year">Year (optional)</Label>
                <Input
                  id="committee-year"
                  value={newCommittee.year}
                  onChange={(e) => setNewCommittee({ ...newCommittee, year: e.target.value })}
                  placeholder="e.g., 2014-2015"
                />
              </div>
              {newCommittee.type === 'previous' && (
                <div>
                  <Label htmlFor="committee-pdf">PDF Document *</Label>
                  <Input
                    id="committee-pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewCommittee({ ...newCommittee, pdfFile: file });
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a PDF document for this previous committee
                  </p>
                </div>
              )}
              <Button onClick={handleAddCommittee} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Committee'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Committees List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Committees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {committees.map((committee) => (
              <div key={committee.id} className="flex items-center gap-2">
                <Button
                  variant={selectedCommittee === committee.id ? 'default' : 'outline'}
                  className="flex-1 justify-start text-left"
                  onClick={() => setSelectedCommittee(committee.id)}
                >
                  <div className="truncate">
                    <div className="font-semibold">{committee.name}</div>
                    <div className="text-xs opacity-70">{committee.type}</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCommittee(committee.id)}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            ))}
            {committees.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No committees yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {selectedCommitteeData ? selectedCommitteeData.name : 'Select a committee'}
            </CardTitle>
            {selectedCommittee && selectedCommitteeData?.type !== 'previous' && (
              <Dialog open={isAddMemberOpen} onOpenChange={(open) => {
                setIsAddMemberOpen(open);
                if (!open) {
                  setEditingMember(null);
                  setNewMember({ name: '', position: '', department: '', photoFile: null });
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2" size={16} />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingMember ? 'Edit Member' : 'Add New Member'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="member-name">Name *</Label>
                      <Input
                        id="member-name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Enter member name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-position">Position *</Label>
                      <Input
                        id="member-position"
                        value={newMember.position}
                        onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                        placeholder="e.g., President, Secretary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-department">Department</Label>
                      <Input
                        id="member-department"
                        value={newMember.department}
                        onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-photo">Photo</Label>
                      <Input
                        id="member-photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewMember({ ...newMember, photoFile: file });
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={editingMember ? handleUpdateMember : handleAddMember}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {selectedCommittee ? (
              selectedCommitteeData?.type === 'previous' ? (
                /* PDF Display for Previous Committees */
                <div className="text-center py-12">
                  {selectedCommitteeData.pdfURL ? (
                    <div>
                      <p className="text-gray-600 mb-4">This is a previous committee with a PDF document.</p>
                      <a
                        href={selectedCommitteeData.pdfURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2e2c6d] text-white px-6 py-3 rounded-lg hover:bg-[#252350] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View/Download PDF
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">No PDF document uploaded for this committee.</p>
                  )}
                </div>
              ) : (
                /* Member Grid for Current and Honours Committees */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square relative bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        {member.photoURL ? (
                          <Image
                            src={member.photoURL}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Upload size={32} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{member.name}</h4>
                      <p className="text-xs text-gray-600 mb-1">{member.position}</p>
                      {member.department && (
                        <p className="text-xs text-gray-500 mb-3">{member.department}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setEditingMember(member);
                            setNewMember({
                              name: member.name,
                              position: member.position,
                              department: member.department,
                              photoFile: null,
                            });
                            setIsAddMemberOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a committee to manage its members
              </div>
            )}            {selectedCommittee && members.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No members in this committee yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
