'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { user, signOut, isAdmin, isApprovedMember } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/directory', label: 'Members' },
    { path: '/blog', label: 'Blog' },
    { path: '/news', label: 'News & Events' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact' },
    ...(user ? [
      { path: '/profile', label: 'Profile' },
    ] : []),
  ];

  const handleSignOut = () => {
    signOut();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-card border-b border-border sticky top-0 z-50">
        <Link href="/" className="text-2xl font-bold text-primary">
          DU Alumni '89
        </Link>
        
        <div className="flex items-center space-x-3">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              className={`px-3 py-2 rounded-md transition-colors ${
                pathname === path
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              style={pathname === path ? { backgroundColor: '#2a2934' } : undefined}
            >
              <span>{label}</span>
            </Link>
          ))}
          
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                pathname === '/admin'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
              }`}
            >
              <Shield size={16} />
              <span>Admin Panel</span>
            </Link>
          )}
          
          {user ? (
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          ) : (
            <Link href="/auth">
              <Button variant="default">Login</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold text-primary">
            DU Alumni '89
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="px-4 py-2 space-y-2 border-t border-border">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md transition-colors ${
                  pathname === path
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                style={pathname === path ? { backgroundColor: '#2a2934' } : undefined}
              >
                <span>{label}</span>
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  pathname === '/admin'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                }`}
              >
                <Shield size={16} />
                <span>Admin Panel</span>
              </Link>
            )}
            
            <div className="pt-2 border-t border-border">
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full justify-start"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              ) : (
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}