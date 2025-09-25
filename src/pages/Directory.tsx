import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, MapPin, Building, GraduationCap, Mail, Phone, Linkedin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  id: string;
  full_name: string;
  department: string;
  country: string;
  district: string;
  workplace: string;
  bio: string;
  profile_photo_url: string | null;
  email: string;
  phone: string;
  linkedin_url: string;
}

export default function Directory() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { isApprovedMember } = useAuth();

  const departments = Array.from(new Set(profiles.map(p => p.department).filter(Boolean)));
  const countries = Array.from(new Set(profiles.map(p => p.country).filter(Boolean)));

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, departmentFilter, countryFilter, districtFilter, workplaceFilter, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, department, country, district, workplace, bio, 
          profile_photo_url, email, phone, linkedin_url
        `)
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.workplace?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter && departmentFilter !== '') {
      filtered = filtered.filter(profile => profile.department === departmentFilter);
    }

    // Country filter
    if (countryFilter && countryFilter !== '') {
      filtered = filtered.filter(profile => profile.country === countryFilter);
    }

    // District filter
    if (districtFilter && districtFilter !== '') {
      filtered = filtered.filter(profile => profile.district === districtFilter);
    }

    // Workplace filter
    if (workplaceFilter && workplaceFilter !== '') {
      filtered = filtered.filter(profile => profile.workplace === workplaceFilter);
    }

    setFilteredProfiles(filtered);
  };

  if (!isApprovedMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">
            Only approved members can access the alumni directory.
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
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Alumni Directory</h1>
          <p className="text-lg opacity-90">
            Connect with fellow alumni from the Class of '89
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, workplace, district, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {Array.from(new Set(profiles.map(p => p.department).filter(Boolean))).map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                {Array.from(new Set(profiles.map(p => p.country).filter(Boolean))).map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Districts</SelectItem>
                {Array.from(new Set(profiles.map(p => p.district).filter(Boolean))).map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={workplaceFilter} onValueChange={setWorkplaceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Organizations</SelectItem>
                {Array.from(new Set(profiles.map(p => p.workplace).filter(Boolean))).map(workplace => (
                  <SelectItem key={workplace} value={workplace}>{workplace}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProfiles.length} of {profiles.length} members
          </p>
        </div>

        {/* Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{profile.full_name}</CardTitle>
                    {profile.department && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {profile.department}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {profile.workplace && (
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="line-clamp-1">{profile.workplace}</span>
                  </div>
                )}

                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                  <div>
                    {profile.district && <div>{profile.district}</div>}
                    {profile.country && <div>{profile.country}</div>}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {profile.bio}
                  </p>
                )}

                {/* Contact Information (only for approved members) */}
                <div className="pt-2 border-t border-border space-y-2">
                  {profile.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={`mailto:${profile.email}`}
                        className="text-primary hover:underline line-clamp-1"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}

                  {profile.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="line-clamp-1">{profile.phone}</span>
                    </div>
                  )}

                  {profile.linkedin_url && (
                    <div className="flex items-center text-sm">
                      <Linkedin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline line-clamp-1"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No members found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}