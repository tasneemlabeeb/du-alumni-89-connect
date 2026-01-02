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
import Image from "next/image";
import Link from "next/link";

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
    homeDistrict?: string;
    dateOfBirth?: string;
    batch?: string;
    showBirthdayToMembers?: boolean;
    showMobileToMembers?: boolean;
  };
}

interface Memorial {
  name: string;
  department: string;
  hall?: string;
  year: string;
  imagePath?: string;
}

const memorials: Memorial[] = [
  {
    name: "Abu Ahmed",
    department: "Management",
    year: "2020",
    imagePath: "/in-memoriam/Abu-Ahmed,-Management,-2020.png"
  },
  {
    name: "Md. Nasir Uddin",
    department: "Mathematics",
    hall: "Fazlul Haquq Hall",
    year: "2024",
    imagePath: "/in-memoriam/Md. Nasir Uddin, Mathematics, 2025.png"
  },
  {
    name: "Md. Rofiqul Islam",
    department: "Statistics",
    year: "2021",
    imagePath: "/in-memoriam/Md.-Rofiqul-Islam,-Statistics,-2021.png"
  },
  {
    name: "Shamsun Naher Rekha",
    department: "Political Science",
    year: "February 2025",
    imagePath: "/in-memoriam/Shamsun Naher Rekha, Political Science, February 2025.png"
  },
  {
    name: "Zahidul Hasan Bhuiyan",
    department: "Statistics",
    year: "2025",
    imagePath: "/in-memoriam/Zahidul Hasan Bhuiyan, Statictics, 2025.png"
  },
  {
    name: "Md Mokaddes Ali (Mukul)",
    department: "Mathematics",
    hall: "Muktijoddha Ziaur Rahman Hall",
    year: "2014"
  },
  {
    name: "Md Sayed Ali",
    department: "Mathematics",
    hall: "Muktijoddha Ziaur Rahman Hall",
    year: "2018"
  },
  {
    name: "Naznin Akhter Lina",
    department: "Bangla",
    hall: "Ruqayyah Hall",
    year: "2011"
  },
  {
    name: "Rowshan Ara Begum Smriti",
    department: "Bangla",
    hall: "Ruqayyah Hall",
    year: "15 February 2017"
  },
  {
    name: "Mokhlesur Rahman Sagar",
    department: "Bangla",
    hall: "S. M. Hall",
    year: "16 June 2021"
  },
  {
    name: "Afifa Sultana",
    department: "Bangla",
    hall: "Ruqayyah Hall",
    year: "2025"
  },
  {
    name: "Ishrat Jahan Kalpona",
    department: "Bangla",
    year: "21 October 2025"
  },
  {
    name: "Sajjat Hossain",
    department: "Bangla",
    hall: "Surya Sen Hall",
    year: "2021"
  }
];

// Normalize hall names to standard format
function normalizeHallName(hall: string | undefined): string | undefined {
  if (!hall) return undefined;
  
  const normalized = hall.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Map variations to standard names
  const hallMappings: { [key: string]: string } = {
    // A. F. Rahman Hall variations
    'a f rahman hall': 'A. F. Rahman Hall',
    'a.f. rahman hall': 'A. F. Rahman Hall',
    'sir a f rahman hall': 'A. F. Rahman Hall',
    'sir a.f. rahman': 'A. F. Rahman Hall',
    'f rahman hall': 'A. F. Rahman Hall',
    
    // Bangabandhu Sheikh Mujibur Rahman Hall variations
    'bangabandhu sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu sheikh mojibur rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu sheikh mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabondhu sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabundu (mujib) hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'banghobondhu sheikh mujibur rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangobandhu sheikh mujibur rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangobondhu sheikh mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bongobondhu sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'b b mujibar rahman': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bb sheikh mujibur rahman hall.': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sheikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sheikh mojibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sk. mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'sk mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'skeikh mujibur rahman hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    'bangabandhu sk. mujib hall': 'Bangabandhu Sheikh Mujibur Rahman Hall',
    
    // Bangladesh Kuwait Maitree Hall variations
    'bangladesh kuwait maitree hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh kuwait maitry hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh kuwait moitri hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh kwait maitre hall': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh-kuwait maitree': 'Bangladesh Kuwait Maitree Hall',
    'bangladesh-kuwait maitree hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait maitree hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait maitry hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait moitri': 'Bangladesh Kuwait Maitree Hall',
    'kuwait moitri hall': 'Bangladesh Kuwait Maitree Hall',
    'kuwait moyitri': 'Bangladesh Kuwait Maitree Hall',
    
    // Begum Rokeya Hall variations
    'begum rokeya hall': 'Begum Rokeya Hall',
    'rokeya hall': 'Begum Rokeya Hall',
    'rokeya': 'Begum Rokeya Hall',
    'ruqayyah hall': 'Begum Rokeya Hall',
    'ruqayyah': 'Begum Rokeya Hall',
    'rukeya hall': 'Begum Rokeya Hall',
    
    // Fazlul Haq Muslim Hall variations
    'fazlul haq muslim hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque muslim hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque muslinn hall': 'Fazlul Haq Muslim Hall',
    'fazlul haq muslinn hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque hall': 'Fazlul Haq Muslim Hall',
    'fazlul haque': 'Fazlul Haq Muslim Hall',
    'fazlul hoque': 'Fazlul Haq Muslim Hall',
    'fazlul hauque hall': 'Fazlul Haq Muslim Hall',
    'fazlul huq muslim hall': 'Fazlul Haq Muslim Hall',
    'fh hall': 'Fazlul Haq Muslim Hall',
    'f. h hall': 'Fazlul Haq Muslim Hall',
    
    // Haji Muhammad Mohsin Hall variations
    'haji muhammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohammad mohashin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohammad mohshin hall': 'Haji Muhammad Mohsin Hall',
    'haji mohsin hall': 'Haji Muhammad Mohsin Hall',
    'haji muhammad mohsin': 'Haji Muhammad Mohsin Hall',
    'hazi md mohsin hall': 'Haji Muhammad Mohsin Hall',
    'hazi mohammad mohasin hall': 'Haji Muhammad Mohsin Hall',
    'hazi mohammad mohsin': 'Haji Muhammad Mohsin Hall',
    'hazi mohammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'hazi muhammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'kazi mohammad mohsin hall': 'Haji Muhammad Mohsin Hall',
    'mohoshin hall': 'Haji Muhammad Mohsin Hall',
    'mohosin hall': 'Haji Muhammad Mohsin Hall',
    'mohsin hall': 'Haji Muhammad Mohsin Hall',
    
    // Jagannath Hall variations
    'jagannath hall': 'Jagannath Hall',
    'jagannat hall': 'Jagannath Hall',
    'jagonnath hall': 'Jagannath Hall',
    
    // Kabi Jasimuddin Hall variations
    'kabi jasimuddin hall': 'Kabi Jasimuddin Hall',
    'kabi jashimuddin hall': 'Kabi Jasimuddin Hall',
    'kabi jashim uddin hall': 'Kabi Jasimuddin Hall',
    'kabi jasim uddin hall': 'Kabi Jasimuddin Hall',
    'kabi jasimuddin': 'Kabi Jasimuddin Hall',
    'kobi jashim uddin': 'Kabi Jasimuddin Hall',
    'kobi joshim uddin': 'Kabi Jasimuddin Hall',
    'jashim uddin hall': 'Kabi Jasimuddin Hall',
    'jashimuddin hall': 'Kabi Jasimuddin Hall',
    'jasim uddin': 'Kabi Jasimuddin Hall',
    'jasim uddin hall': 'Kabi Jasimuddin Hall',
    'jasimuddin hall': 'Kabi Jasimuddin Hall',
    
    // Muktijoddha Ziaur Rahman Hall variations
    'muktijoddha ziaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'muktijoddha ziaur rahman': 'Muktijoddha Ziaur Rahman Hall',
    'muktijoddha ziaur rohman hall': 'Muktijoddha Ziaur Rahman Hall',
    'muktijoddha zlaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'muktizoddha ziaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'ziaur rahman hall': 'Muktijoddha Ziaur Rahman Hall',
    'ziaur rahman': 'Muktijoddha Ziaur Rahman Hall',
    
    // Salimullah Muslim Hall variations
    'salimullah muslim hall': 'Salimullah Muslim Hall',
    'salimulla hall': 'Salimullah Muslim Hall',
    'salimullah hall': 'Salimullah Muslim Hall',
    'salimullah muslim': 'Salimullah Muslim Hall',
    'salinnullah muslinn hall': 'Salimullah Muslim Hall',
    'sallmullah': 'Salimullah Muslim Hall',
    'sir salimullah muslim hall': 'Salimullah Muslim Hall',
    'sir solimullah hall': 'Salimullah Muslim Hall',
    'sm hall': 'Salimullah Muslim Hall',
    's.m hall': 'Salimullah Muslim Hall',
    's.m.hall': 'Salimullah Muslim Hall',
    's m hall': 'Salimullah Muslim Hall',
    
    // Sergeant Zahurul Haque Hall variations
    'sergeant zahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'sergent zahurul haq hall': 'Sergeant Zahurul Haque Hall',
    'sergent zahurul huq hall': 'Sergeant Zahurul Haque Hall',
    'sargent jahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'sergeant jahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'sergeant zahurul huq hall': 'Sergeant Zahurul Haque Hall',
    'surgent jahurul hall': 'Sergeant Zahurul Haque Hall',
    'surgent zuhurul haque hall': 'Sergeant Zahurul Haque Hall',
    'zahurul haq': 'Sergeant Zahurul Haque Hall',
    'zahurul haq hall': 'Sergeant Zahurul Haque Hall',
    'zahurul haque': 'Sergeant Zahurul Haque Hall',
    'zahurul haque hall': 'Sergeant Zahurul Haque Hall',
    'zahurul huq hall': 'Sergeant Zahurul Haque Hall',
    'jahurul haque hall': 'Sergeant Zahurul Haque Hall',
    
    // Shahidullah Hall variations
    'shahidullah hall': 'Shahidullah Hall',
    'dr. mohammad shahidullah hall': 'Shahidullah Hall',
    'dr. mohammad shahidullah hall.': 'Shahidullah Hall',
    'shahldullah hall': 'Shahidullah Hall',
    'shaldullah hall': 'Shahidullah Hall',
    
    // Shamsunnahar Hall (already clean)
    'shamsunnahar hall': 'Shamsunnahar Hall',
    
    // Surja Sen Hall variations
    'surja sen hall': 'Surja Sen Hall',
    'surjasen hall': 'Surja Sen Hall',
    'surjasen hall.': 'Surja Sen Hall',
    'surjo sen hall': 'Surja Sen Hall',
    'surya sen hall': 'Surja Sen Hall',
    'master da surja sen hall': 'Surja Sen Hall',
    'master da surjasen hall': 'Surja Sen Hall',
    'master da surya sen': 'Surja Sen Hall',
    'masterda surja sen': 'Surja Sen Hall',
    'shurzo shen hall': 'Surja Sen Hall',
    
    // Zia Hall variations
    'zia hall': 'Zia Hall',
    'hall zia hall': 'Zia Hall',
  };
  
  return hallMappings[normalized] || hall.trim();
}

export default function DirectoryPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Members Directory</h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Connect with fellow alumni from DU Batch 89
            </p>
          </div>
        </div>

        {/* Login Required Message */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6 text-indigo-900">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Members Only Area</h2>
            <p className="text-lg text-slate-600 mb-8">
              Please log in to access the members directory and connect with your fellow alumni.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-indigo-900 hover:bg-indigo-800">
                <Link href="/auth">Log In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-indigo-900 text-indigo-900 hover:bg-indigo-50">
                <Link href="/auth?mode=signup">Register</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <DirectoryContent />;
}

function DirectoryContent() {
  const { isApprovedMember, profileComplete, isAdmin } = useAuth();

  // Check profile completion requirement
  if (!profileComplete && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6 text-yellow-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Profile Incomplete</h2>
          <p className="text-slate-600 mb-6">
            Please complete your profile with all mandatory information to access member features like gallery and directory.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Required fields: Full Name, Nick Name, Department/Institute, Hall, Contact Number, and Blood Group
          </p>
          <Button asChild className="w-full">
            <Link href="/profile">Complete Your Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check approval requirement
  if (!isApprovedMember && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6 text-blue-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Membership Pending Approval</h2>
          <p className="text-slate-600 mb-6">
            Your membership application is being reviewed by our administrators. You need approval from two admins to access member-only features.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You'll receive access once your application has been approved. This usually takes 24-48 hours.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(undefined);
  const [selectedHall, setSelectedHall] = useState<string | undefined>(undefined);
  const [selectedHomeDistrict, setSelectedHomeDistrict] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedOrganization, setSelectedOrganization] = useState<string | undefined>(undefined);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | undefined>(undefined);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 50;

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

  // Extract unique values for filters from actual member data
  // Normalize hall names before creating unique list
  const uniqueHalls = Array.from(new Set(
    members
      .map(m => m.profile?.hall)
      .filter(Boolean)
      .map(h => normalizeHallName(h!.trim()))
      .filter(Boolean)
  )).sort();

  const uniquePresentCities = Array.from(new Set(
    members
      .map(m => m.profile?.presentCityOfLiving)
      .filter(Boolean)
      .map(c => c!.trim())
      .filter(c => c.length > 0)
  )).sort();

  const uniqueCountries = Array.from(new Set(
    members
      .map(m => m.profile?.country)
      .filter(Boolean)
      .map(c => c!.trim())
      .filter(c => c.length > 0)
  )).sort();

  // Valid blood groups only - handle various formats
  const uniqueBloodGroups = Array.from(new Set(
    members
      .map(m => {
        const bg = m.profile?.bloodGroup?.trim();
        if (!bg) return null;
        
        // Normalize blood group format
        // Remove parentheses: A(+) -> A+
        let normalized = bg.replace(/\(([+-])\)/, '$1');
        
        // Check if it's a valid blood group pattern
        const validPattern = /^(A|B|AB|O)[+-]$/;
        if (validPattern.test(normalized)) {
          return normalized;
        }
        
        return null;
      })
      .filter(Boolean) as string[]
  )).sort();

  const filteredMembers = members.filter(member => {
    const searchFields = [
      member.full_name,
      member.profile?.nickName,
      member.profile?.department,
      member.profile?.hall,
      member.profile?.presentCityOfLiving,
      member.profile?.country,
      member.profile?.profession,
      member.profile?.homeDistrict,
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || member.profile?.department === selectedDepartment;
    
    // Normalize hall name for comparison
    const memberHallNormalized = normalizeHallName(member.profile?.hall?.trim());
    const matchesHall = !selectedHall || memberHallNormalized === selectedHall;
    
    const matchesPresentCity = !selectedHomeDistrict || member.profile?.presentCityOfLiving?.trim() === selectedHomeDistrict;
    const matchesCountry = !selectedCountry || member.profile?.country?.trim() === selectedCountry;
    
    // Normalize blood group for comparison
    const memberBloodGroup = member.profile?.bloodGroup?.trim().replace(/\(([+-])\)/, '$1');
    const matchesBloodGroup = !selectedBloodGroup || memberBloodGroup === selectedBloodGroup;

    return matchesSearch && matchesDepartment && matchesHall && matchesPresentCity && matchesCountry && matchesBloodGroup;
  });

  // Pagination calculations
  const totalMembers = filteredMembers.length;
  const totalPages = Math.ceil(totalMembers / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const endIndex = startIndex + membersPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedHall, selectedHomeDistrict, selectedCountry, selectedBloodGroup]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of members section
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div 
          className="h-[320px] bg-cover bg-center relative"
          style={{ 
            backgroundImage: "url('/home_page/Banner.jpg')",
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#2e2c6d] opacity-25"></div>
            <div className="text-center text-white relative z-10">
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
        className="h-[320px] bg-cover bg-center relative"
        style={{ 
          backgroundImage: "url('/home_page/Banner.jpg')",
          backgroundPosition: 'center 30%'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2e2c6d] opacity-25"></div>
          <div className="text-center text-white relative z-10">
            <h1 className="text-4xl font-bold mb-2">Members</h1>
            <p className="text-slate-200">Connect with fellow alumni from the Class of '89</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Profiles in Excellence Section - Hidden for now */}
        {/* <div className="mb-12">
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
        </div> */}

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
            <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Department/ Institute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments/Institutes</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedHall} onValueChange={(value) => setSelectedHall(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Hall" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Halls</SelectItem>
                {uniqueHalls.map((hall) => (
                  <SelectItem key={hall} value={hall}>
                    {hall}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedHomeDistrict} onValueChange={(value) => setSelectedHomeDistrict(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Present City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniquePresentCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedOrganization} onValueChange={(value) => setSelectedOrganization(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="org1">Organization 1</SelectItem>
                <SelectItem value="org2">Organization 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBloodGroup} onValueChange={(value) => setSelectedBloodGroup(value === "all" ? undefined : value)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Groups</SelectItem>
                {uniqueBloodGroups.map((bloodGroup) => (
                  <SelectItem key={bloodGroup} value={bloodGroup}>
                    {bloodGroup}
                  </SelectItem>
                ))}
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
            <>
              {paginatedMembers.map((member) => (
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
                          <p><span className="font-medium">Department/Institute:</span> {member.profile.department}</p>
                        )}
                        {member.profile?.contactNo && member.profile?.showMobileToMembers !== false && (
                          <p><span className="font-medium">Contact:</span> {member.profile.contactNo}</p>
                        )}
                        {member.profile?.dateOfBirth && member.profile?.showBirthdayToMembers !== false && (
                          <p><span className="font-medium">Birthday:</span> {new Date(member.profile.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                        )}
                        {member.profile?.homeDistrict && (
                          <p><span className="font-medium">Home District:</span> {member.profile.homeDistrict}</p>
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
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="col-span-full mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="h-9 w-9"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-slate-500">...</span>
                      )}
                    </>
                  )}

                  {/* Page numbers around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === currentPage || 
                             page === currentPage - 1 || 
                             page === currentPage + 1 ||
                             (currentPage <= 2 && page <= 3) ||
                             (currentPage >= totalPages - 1 && page >= totalPages - 2);
                    })
                    .map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="h-9 w-9"
                      >
                        {page}
                      </Button>
                    ))}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-slate-500">...</span>
                      )}
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="h-9 w-9"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            )}

            {/* Results info */}
            <div className="col-span-full text-center text-sm text-slate-600 mt-4">
              Showing {startIndex + 1}-{Math.min(endIndex, totalMembers)} of {totalMembers} members
            </div>
          </>
          )}
        </div>

        {/* In Memoriam Section */}
        <div id="memoriam" className="bg-slate-100 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">In Memoriam</h2>
          <p className="text-center text-slate-600 mb-8 italic">
            Remembering our beloved members who are no longer with us
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {memorials.map((memorial, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  {memorial.imagePath ? (
                    <div className="relative aspect-[3/4] bg-slate-100">
                      <Image
                        src={memorial.imagePath}
                        alt={memorial.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-indigo-900/20 flex items-center justify-center mb-2">
                          <span className="text-2xl font-serif text-indigo-900">
                            {memorial.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-white">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2">{memorial.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{memorial.department}</p>
                    {memorial.hall && (
                      <p className="text-xs text-slate-500 line-clamp-1">{memorial.hall}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{memorial.year}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
