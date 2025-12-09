'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
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
  members: CommitteeMember[];
  pdfURL?: string; // For previous committees
}

function CommitteeContent() {
  const searchParams = useSearchParams();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'previous' | 'honours'>('current');
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);

  // Handle hash-based navigation from submenu
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'current' || hash === 'previous' || hash === 'honours') {
        setActiveTab(hash);
        const first = committees.find(c => c.type === hash);
        setSelectedCommittee(first?.id || null);
      }
    };

    handleHashChange(); // Check on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [committees]);

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const committeesRef = collection(db, 'committees');
      const q = query(committeesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const committeesData: Committee[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // For previous committees, just get the PDF URL, no members
        if (data.type === 'previous') {
          committeesData.push({
            id: doc.id,
            name: data.name,
            type: data.type,
            year: data.year,
            order: data.order,
            members: [],
            pdfURL: data.pdfURL
          });
          continue;
        }
        
        // For current and honours committees, fetch members
        const membersRef = collection(db, 'committees', doc.id, 'members');
        const membersQuery = query(membersRef, orderBy('order', 'asc'));
        const membersSnapshot = await getDocs(membersQuery);
        
        const members = membersSnapshot.docs.map(memberDoc => ({
          id: memberDoc.id,
          ...memberDoc.data()
        })) as CommitteeMember[];
        
        committeesData.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          year: data.year,
          order: data.order,
          members
        });
      }
      
      setCommittees(committeesData);
      
      // Set first committee of active tab as selected
      const firstCommittee = committeesData.find(c => c.type === activeTab);
      if (firstCommittee) {
        setSelectedCommittee(firstCommittee.id);
      }
    } catch (error) {
      console.error('Error fetching committees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommittees = committees.filter(c => c.type === activeTab);
  const selectedCommitteeData = committees.find(c => c.id === selectedCommittee);
  
  const filteredMembers = selectedCommitteeData?.members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[320px] bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/images/Comittee/Banner.jpg')",
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[#2e2c6d] opacity-20"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Newly Formed Committee Members</h1>
          <p className="text-lg text-white/90">Its role, purpose, and how it keeps the alumni network thriving</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by committee type, name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-blue-50 border-blue-100 focus:border-[#1e3a8a]"
            />
          </div>
        </div>

        {/* Tabs and Committee Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Current Committee */}
          <div>
            <Button
              variant="outline"
              className={`w-full mb-4 ${activeTab === 'current' ? 'bg-[#1e3a8a] text-white' : 'bg-white'}`}
              onClick={() => {
                setActiveTab('current');
                const first = committees.find(c => c.type === 'current');
                setSelectedCommittee(first?.id || null);
              }}
            >
              Current Committee ▼
            </Button>
            {activeTab === 'current' && filteredCommittees.map((committee) => (
              <Button
                key={committee.id}
                variant="outline"
                className={`w-full mb-2 ${selectedCommittee === committee.id ? 'bg-[#2e2c6d] text-white' : 'bg-white text-[#2e2c6d]'}`}
                onClick={() => setSelectedCommittee(committee.id)}
              >
                {committee.name}
              </Button>
            ))}
          </div>

          {/* Previous Committee */}
          <div>
            <Button
              variant="outline"
              className={`w-full mb-4 ${activeTab === 'previous' ? 'bg-[#2e2c6d] text-white' : 'bg-white'}`}
              onClick={() => {
                setActiveTab('previous');
                const first = committees.find(c => c.type === 'previous');
                setSelectedCommittee(first?.id || null);
              }}
            >
              Previous Committee ▼
            </Button>
            {activeTab === 'previous' && filteredCommittees.map((committee) => (
              <Button
                key={committee.id}
                variant="outline"
                className={`w-full mb-2 ${selectedCommittee === committee.id ? 'bg-[#2e2c6d] text-white' : 'bg-white text-[#2e2c6d]'}`}
                onClick={() => setSelectedCommittee(committee.id)}
              >
                {committee.year || committee.name}
              </Button>
            ))}
          </div>

          {/* Honours Board */}
          <div>
            <Button
              variant="outline"
              className={`w-full mb-4 ${activeTab === 'honours' ? 'bg-[#2e2c6d] text-white' : 'bg-white'}`}
              onClick={() => {
                setActiveTab('honours');
                const first = committees.find(c => c.type === 'honours');
                setSelectedCommittee(first?.id || null);
              }}
            >
              Honours Board ▼
            </Button>
            {activeTab === 'honours' && filteredCommittees.map((committee) => (
              <Button
                key={committee.id}
                variant="outline"
                className={`w-full mb-2 ${selectedCommittee === committee.id ? 'bg-[#2e2c6d] text-white' : 'bg-white text-[#2e2c6d]'}`}
                onClick={() => setSelectedCommittee(committee.id)}
              >
                {committee.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Committee Members Display */}
        {selectedCommitteeData && (
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-[#2e2c6d] mb-6">
              {selectedCommitteeData.name}
            </h3>
            
            {/* PDF Download for Previous Committees */}
            {selectedCommitteeData.type === 'previous' && selectedCommitteeData.pdfURL ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <a
                    href={selectedCommitteeData.pdfURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#1e3a8a] hover:bg-[#2c4fa3] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Committee PDF
                  </a>
                  <p className="text-sm text-gray-600 mt-4">
                    Click to view or download the committee document
                  </p>
                </div>
              </div>
            ) : selectedCommitteeData.type === 'previous' ? (
              <div className="text-center py-12 text-gray-500">
                No PDF document available for this committee
              </div>
            ) : (
              /* Member Grid for Current and Honours Committees */
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-square relative bg-gray-100">
                        {member.photoURL ? (
                          <Image
                            src={member.photoURL}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={64} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-[#2e2c6d] text-sm mb-1">
                          {member.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{member.position}</p>
                        {member.department && (
                          <p className="text-xs text-gray-500">{member.department}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No members found
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {!selectedCommitteeData && filteredCommittees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No committees found for this category
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommitteePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <CommitteeContent />
    </Suspense>
  );
}
