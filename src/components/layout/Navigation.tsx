import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Newspaper, 
  Calendar, 
  Image, 
  Info, 
  Settings, 
  LogOut,
  Home,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { user, signOut, isAdmin, isApprovedMember } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About Us', icon: Info },
    ...(isApprovedMember ? [
      { path: '/directory', label: 'Directory', icon: Users },
      { path: '/profile', label: 'Profile', icon: Users },
      { path: '/news', label: 'News & Events', icon: Newspaper },
      { path: '/gallery', label: 'Gallery', icon: Image },
    ] : []),
    ...(isAdmin ? [
      { path: '/admin', label: 'Admin Panel', icon: Settings },
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
        <Link to="/" className="text-2xl font-bold text-primary">
          DU Alumni '89
        </Link>
        
        <div className="flex items-center space-x-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
          
          {user ? (
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="default">Login</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-primary">
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
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
            
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
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
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