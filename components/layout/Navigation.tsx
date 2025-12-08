'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut,
  Menu,
  X,
  Shield,
  Search
} from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { user, signOut, isAdmin } = useAuth();
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
            <div className="flex-1 flex flex-col ml-4">
              {/* Title row */}
              <div className="flex items-center py-3">
                <h1 className="text-[#2e2c6d] text-2xl lg:text-3xl font-bold tracking-wide" style={{ fontFamily: "'Evil Empire', Arial, sans-serif" }}>
                  DHAKA UNIVERSITY ALUMNI ASSOCIATION BATCH&apos;89
                </h1>
              </div>

              {/* Navigation row */}
              <div className="flex items-center justify-between py-2 pb-4">
                <div className="flex items-center space-x-1">
                  {navItems.map(({ path, label }) => (
                    <Link
                      key={path}
                      href={path}
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded ${
                        pathname === path
                          ? 'bg-[#2e2c6d] text-white'
                          : 'text-gray-700 hover:bg-[#2e2c6d]/10'
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded flex items-center gap-2 ${
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
                      className={`px-3 py-2 text-sm font-medium transition-colors rounded ${
                        pathname === '/profile'
                          ? 'bg-[#2e2c6d] text-white'
                          : 'text-gray-700 hover:bg-[#2e2c6d]/10'
                      }`}
                    >
                      Profile
                    </Link>
                  )}
                </div>

                {/* Registration button */}
                <div className="ml-4">
                  {user ? (
                    <Button 
                      onClick={handleSignOut}
                      size="sm"
                      className="bg-[#2e2c6d] text-white hover:bg-[#252350] rounded-full px-6"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        size="sm"
                        className="bg-[#2e2c6d] hover:bg-[#252350] text-white rounded-full px-6"
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
