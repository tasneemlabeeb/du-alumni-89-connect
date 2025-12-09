'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  User
} from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { user, signOut, isAdmin } = useAuth();
  const { profile } = useProfile();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/directory', label: 'Members' },
    { path: '/committee', label: 'Committee' },
    { path: '/news', label: 'News & Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/archive', label: 'Archive' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
    { path: '/fund', label: 'Fund' },
  ];

  const aboutSubmenuItems = [
    { label: "Legacy of DU", href: "/about#legacy" },
    { label: "Journey of DUAAB'89", href: "/about#journey" },
    { label: "Mission & Vision", href: "/about#mission" },
    { label: "Constitution", href: "/about#constitution" },
    { label: "Messages", href: "/about#messages" },
    { label: "Automation Journey", href: "/about#automation" },
  ];

  const blogSubmenuItems = [
    { label: "Campus Memories", href: "/blog?category=campus-memories" },
    { label: "Published Articles", href: "/blog?category=published-articles" },
    { label: "Talent Hub", href: "/blog?category=talent-hub" },
  ];

  const committeeSubmenuItems = [
    { label: "Current Committee", href: "/committee#current" },
    { label: "Previous Committees", href: "/committee#previous" },
    { label: "Honours Board", href: "/committee#honours" },
  ];

  const newsSubmenuItems = [
    { label: "Achievements", href: "/news?category=achievements" },
    { label: "Announcements", href: "/news?category=announcements" },
    { label: "Media/ Press", href: "/news?category=media_press" },
    { label: "Alumni Stories", href: "/news?category=alumni_stories" },
  ];

  const gallerySubmenuItems = [
    { label: "Reunions & Gatherings", href: "/gallery#reunions" },
    { label: "Community Initiatives", href: "/gallery#community" },
    { label: "Throwback Moments", href: "/gallery#throwback" },
  ];

  const membersSubmenuItems = [
    { label: "Membership Services", href: "/directory#services" },
    { label: "Membership Guidelines", href: "/directory#guidelines" },
    { label: "Profiles in Excellence", href: "/directory#excellence" },
    { label: "In Memoriam", href: "/directory#memoriam" },
  ];

  const membersSubmenuItemsSecondRow = [
    { label: "- Registration  - Profile Update", href: "/directory#registration-update" },
    { label: "- How to Register  - How to Update", href: "/directory#how-to" },
  ];

  const showAboutSubmenu = pathname === '/about' || pathname?.startsWith('/about#');
  const showBlogSubmenu = pathname === '/blog' || pathname?.startsWith('/blog?');
  const showCommitteeSubmenu = pathname === '/committee' || pathname?.startsWith('/committee#');
  const showNewsSubmenu = pathname === '/news' || pathname?.startsWith('/news?');
  const showGallerySubmenu = pathname === '/gallery' || pathname?.startsWith('/gallery#');
  const showMembersSubmenu = pathname === '/directory' || pathname?.startsWith('/directory#');

  const handleSignOut = () => {
    signOut();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-stretch">
            {/* Logo - spans both lines on the left */}
            <div className="flex items-center py-3">
              <Link href="/" className="relative w-20 h-20">
                <Image
                  src="/home_page/DUAAB logo Blue.png"
                  alt="DUAAB Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Right side - Title and Navigation stacked */}
            <div className="flex-1 flex flex-col ml-4 min-w-0">
              {/* Title row - Only title and profile picture */}
              <div className="flex items-center justify-between py-3 gap-4">
                <h1 className="text-[#2e2c6d] text-xl lg:text-2xl xl:text-3xl font-bold flex-1 min-w-0 leading-tight" style={{ fontFamily: "'Evil Empire', Arial, sans-serif", letterSpacing: '0.3em' }}>
                  DHAKA UNIVERSITY ALUMNI ASSOCIATION BATCH&apos;89
                </h1>
                
                {/* Profile Avatar - shown only when logged in */}
                {user && (
                  <Link href="/profile" className="flex items-center flex-shrink-0">
                    <Avatar className="h-10 w-10 border-2 border-[#2e2c6d] hover:border-[#252350] transition-colors cursor-pointer">
                      <AvatarImage src={profile?.profilePhotoUrl} alt={profile?.fullName || user.email || 'User'} />
                      <AvatarFallback className="bg-[#2e2c6d] text-white">
                        <User size={20} />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                )}
              </div>

              {/* Navigation row - Menu items and Registration/Logout button */}
              <div className="flex items-center justify-between py-2 pb-4">
                <div className="flex items-center space-x-1 flex-wrap">
                  {navItems.map(({ path, label }) => (
                    <Link
                      key={path}
                      href={path}
                      className={`px-3 py-2 text-sm font-semibold transition-colors rounded ${
                        pathname === path
                          ? 'bg-[#2e2c6d] text-white'
                          : 'text-[#2f2c6d] hover:bg-[#2e2c6d]/10'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`px-3 py-2 text-sm font-semibold transition-colors rounded flex items-center gap-2 ${
                        pathname === '/admin'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      <Shield size={16} />
                      Admin
                    </Link>
                  )}

                  {user && (
                    <Link
                      href="/profile"
                      className={`px-3 py-2 text-sm font-semibold transition-colors rounded ${
                        pathname === '/profile'
                          ? 'bg-[#2e2c6d] text-white'
                          : 'text-[#2f2c6d] hover:bg-[#2e2c6d]/10'
                      }`}
                    >
                      Profile
                    </Link>
                  )}
                </div>

                {/* Registration/Logout Button - moved to navigation row */}
                <div className="ml-4 flex-shrink-0">
                  {user ? (
                    <Button 
                      onClick={handleSignOut}
                      size="sm"
                      className="bg-[#2e2c6d] text-white hover:bg-[#252350] rounded-full px-4 lg:px-6"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        size="sm"
                        className="bg-[#2e2c6d] hover:bg-[#252350] text-white rounded-full px-4 lg:px-6 whitespace-nowrap"
                      >
                        Member Registration
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Submenu - shown only on About page */}
        {showAboutSubmenu && (
          <div className="w-full bg-[#F5F5F5] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center h-14 gap-4">
                <span className="text-[#2e2c6d] font-semibold text-base">About</span>
                <div className="flex items-center gap-1">
                  {aboutSubmenuItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                      >
                        {item.label}
                      </Link>
                      {index < aboutSubmenuItems.length - 1 && (
                        <span className="text-[#4A5568]">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Submenu - shown only on Blog page */}
        {showBlogSubmenu && (
          <div className="w-full bg-[#F5F5F5] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center h-14 gap-4">
                <span className="text-[#2e2c6d] font-semibold text-base">Blog</span>
                <div className="flex items-center gap-1">
                  {blogSubmenuItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                      >
                        {item.label}
                      </Link>
                      {index < blogSubmenuItems.length - 1 && (
                        <span className="text-[#4A5568]">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Committee Submenu - shown only on Committee page */}
        {showCommitteeSubmenu && (
          <div className="w-full bg-[#F5F5F5] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center h-14 gap-4">
                <span className="text-[#2e2c6d] font-semibold text-base">Committee</span>
                <div className="flex items-center gap-1">
                  {committeeSubmenuItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                      >
                        {item.label}
                      </Link>
                      {index < committeeSubmenuItems.length - 1 && (
                        <span className="text-[#4A5568]">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News & Events Submenu - shown only on News page */}
        {showNewsSubmenu && (
          <div className="w-full bg-[#F5F5F5] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center h-14 gap-4">
                <span className="text-[#2e2c6d] font-semibold text-base">Event</span>
                <div className="flex items-center gap-1">
                  {newsSubmenuItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                      >
                        {item.label}
                      </Link>
                      {index < newsSubmenuItems.length - 1 && (
                        <span className="text-[#4A5568]">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Submenu - shown only on Gallery page */}
        {showGallerySubmenu && (
          <div className="w-full bg-[#F5F5F5] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-center h-14 gap-4">
                <span className="text-[#2e2c6d] font-semibold text-base">Gallery</span>
                <div className="flex items-center gap-1">
                  {gallerySubmenuItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                      >
                        {item.label}
                      </Link>
                      {index < gallerySubmenuItems.length - 1 && (
                        <span className="text-[#4A5568]">|</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Submenu - shown only on Members/Directory page */}
        {showMembersSubmenu && (
          <div className="w-full bg-[#F5F5F5] border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-2">
              <div className="flex items-start justify-center gap-4">
                <span className="text-[#2e2c6d] font-semibold text-base mt-2">Members</span>
                <div className="flex flex-col gap-1">
                  {/* First Row */}
                  <div className="flex items-center gap-1">
                    {membersSubmenuItems.map((item, index) => (
                      <div key={item.href} className="flex items-center">
                        <Link
                          href={item.href}
                          className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                        >
                          {item.label}
                        </Link>
                        {index < membersSubmenuItems.length - 1 && (
                          <span className="text-[#4A5568]">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Second Row */}
                  <div className="flex items-center gap-1">
                    {membersSubmenuItemsSecondRow.map((item, index) => (
                      <div key={item.href} className="flex items-center">
                        <Link
                          href={item.href}
                          className="text-sm font-normal text-[#4A5568] hover:text-[#2D3748] transition-colors whitespace-nowrap px-2"
                        >
                          {item.label}
                        </Link>
                        {index < membersSubmenuItemsSecondRow.length - 1 && (
                          <span className="text-[#4A5568]">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/home_page/DUAAB logo Blue.png"
                  alt="DUAAB Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-[#1e3a8a] text-[18px] font-bold leading-tight" style={{ fontFamily: "'Evil Empire', Arial, sans-serif" }}>
                DHAKA UNIVERSITY ALUMNI ASSOCIATION BATCH&apos;89
              </span>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex-shrink-0"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="bg-[#2e2c6d]">
            <div className="px-4 py-2 space-y-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded transition-colors ${
                    pathname === path
                      ? 'bg-[#252350] text-white'
                      : 'text-white hover:bg-[#252350]'
                  }`}
                >
                  {label}
                </Link>
              ))}
              
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors ${
                    pathname === '/admin'
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <Shield size={16} />
                  Admin Panel
                </Link>
              )}

              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded transition-colors ${
                    pathname === '/profile'
                      ? 'bg-[#2e2c6d] text-white'
                      : 'text-white hover:bg-[#2e2c6d]'
                  }`}
                >
                  Profile
                </Link>
              )}
              
              <div className="pt-2 border-t border-[#2e2c6d]">
                {user ? (
                  <Button 
                    onClick={handleSignOut}
                    className="w-full justify-start bg-white text-[#2e2c6d] hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#2e2c6d] hover:bg-[#252350] text-white">
                      Member Registration
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
