'use client';

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { departments } from "@/lib/data/departments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: string;
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
  };
}

export default function DirectoryPage() {
  const { isApprovedMember } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedHomeDistrict, setSelectedHomeDistrict] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved members from Firestore
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/members');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data.members || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const featuredProfiles = members.slice(0, 3);
  const inMemoriam = Array(4).fill(null);

  const filteredMembers = members.filter(member => {
    const searchFields = [
      member.full_name,
      member.profile?.nickName,
      member.profile?.department,
      member.profile?.hall,
      member.profile?.presentCityOfLiving,
      member.profile?.country,
      member.profile?.profession,
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || member.profile?.department === selectedDepartment;
    const matchesHall = !selectedHall || member.profile?.hall === selectedHall;
    const matchesCountry = !selectedCountry || member.profile?.country === selectedCountry;
    const matchesBloodGroup = !selectedBloodGroup || member.profile?.bloodGroup === selectedBloodGroup;

    return matchesSearch && matchesDepartment && matchesHall && matchesCountry && matchesBloodGroup;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ 
            backgroundImage: "url('/home_page/Banner.jpg')",
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">Members</h1>
              <p className="text-slate-200">Connect with fellow alumni from the Class of '89</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            <h1 className="text-4xl font-bold mb-2">Members</h1>
            <p className="text-slate-200">Connect with fellow alumni from the Class of '89</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Profiles in Excellence Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Profiles in Excellence</h2>
          <div className="relative">
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 shrink-0"
              >
                <ChevronLeft size={20} />
              </Button>
              
              <div className="grid md:grid-cols-3 gap-6 flex-1 max-w-5xl">
                {featuredProfiles.map((profile) => (
                  <Card key={profile.id} className="bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 shrink-0"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Search by name, nickname, subject, hall, home district, city, country"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Department/ Institute" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedHall} onValueChange={setSelectedHall}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Hall" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hall1">Hall 1</SelectItem>
                <SelectItem value="hall2">Hall 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedHomeDistrict} onValueChange={setSelectedHomeDistrict}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Home District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dhaka">Dhaka</SelectItem>
                <SelectItem value="chittagong">Chittagong</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bangladesh">Bangladesh</SelectItem>
                <SelectItem value="usa">USA</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org1">Organization 1</SelectItem>
                <SelectItem value="org2">Organization 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a+">A+</SelectItem>
                <SelectItem value="b+">B+</SelectItem>
                <SelectItem value="o+">O+</SelectItem>
                <SelectItem value="ab+">AB+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-slate-600 mt-4">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>

        {/* Member Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No members found</h3>
              <p className="text-slate-500">
                {searchTerm || selectedDepartment || selectedHall || selectedCountry || selectedBloodGroup
                  ? 'Try adjusting your search filters'
                  : 'No approved members in the directory yet'}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <Card key={member.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white z-10"
                >
                  <Plus size={18} />
                </Button>
                
                <CardContent className="p-0">
                  <div className="flex gap-4 p-6">
                    <Avatar className="h-20 w-20 shrink-0">
                      {member.profile?.profilePhotoUrl ? (
                        <AvatarImage src={member.profile.profilePhotoUrl} alt={member.profile.fullName || member.full_name} />
                      ) : null}
                      <AvatarFallback className="bg-slate-200 text-slate-600 text-lg">
                        {(member.profile?.fullName || member.full_name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {member.profile?.fullName || member.full_name}
                        {member.profile?.nickName && (
                          <span className="text-sm text-slate-600 font-normal"> ({member.profile.nickName})</span>
                        )}
                      </h3>
                      <div className="space-y-1 text-sm text-slate-600">
                        {member.profile?.profession && (
                          <p><span className="font-medium">Profession:</span> {member.profile.profession}</p>
                        )}
                        {member.profile?.department && (
                          <p><span className="font-medium">Department:</span> {member.profile.department}</p>
                        )}
                        {member.profile?.contactNo && (
                          <p><span className="font-medium">Contact:</span> {member.profile.contactNo}</p>
                        )}
                        {member.profile?.presentCityOfLiving && (
                          <p><span className="font-medium">Location:</span> {member.profile.presentCityOfLiving}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={16} />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* In Memoriam Section */}
        <div className="bg-slate-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">In Memoriam</h2>
          <div className="relative">
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 shrink-0"
              >
                <ChevronLeft size={20} />
              </Button>
              
              <div className="grid grid-cols-4 gap-6 flex-1 max-w-4xl">
                {inMemoriam.map((_, idx) => (
                  <div key={idx} className="aspect-square rounded-full bg-white shadow-sm"></div>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 shrink-0"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
