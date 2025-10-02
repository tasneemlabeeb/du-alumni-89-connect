import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-600 to-green-800 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="flex items-center justify-center h-full">
            <Link to="/" className="w-full h-full flex items-center justify-center">
              {/* DU Logo - Maximum Size */}
              <img 
                src="/du-logo.png" 
                alt="Dhaka University Logo" 
                className="w-full h-48 object-contain hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">About</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-white/90 hover:text-white transition-colors text-sm">
                Our Story
              </Link>
              <Link to="/news" className="block text-white/90 hover:text-white transition-colors text-sm">
                News & Events
              </Link>
              <Link to="/gallery" className="block text-white/90 hover:text-white transition-colors text-sm">
                Gallery
              </Link>
              <Link to="/directory" className="block text-white/90 hover:text-white transition-colors text-sm">
                Alumni Directory
              </Link>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <div className="space-y-2">
              <Link to="/networking" className="block text-white/90 hover:text-white transition-colors text-sm">
                Networking
              </Link>
              <Link to="/mentorship" className="block text-white/90 hover:text-white transition-colors text-sm">
                Mentorship
              </Link>
              <Link to="/career" className="block text-white/90 hover:text-white transition-colors text-sm">
                Career Support
              </Link>
              <Link to="/events" className="block text-white/90 hover:text-white transition-colors text-sm">
                Events
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white/90">
                <Mail size={16} />
                <span className="text-sm">contact@dualumni89.com</span>
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <Phone size={16} />
                <span className="text-sm">+880 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <MapPin size={16} />
                <span className="text-sm">Dhaka University, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/80 text-sm">
            © 2025 DU Alumni '89. All rights reserved. Built by{' '}
            <a 
              href="https://www.oryon-x.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 underline transition-colors"
            >
              Oryon X
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}