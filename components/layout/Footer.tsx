'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Send, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto px-4 pb-4">
      <div 
        className="max-w-7xl mx-auto rounded-[32px] overflow-hidden shadow-2xl" 
        style={{ backgroundColor: '#2e2c6c' }}
      >
        <div className="px-8 py-12 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
            {/* Logo Column */}
            <div className="flex justify-center md:justify-start">
              <Link href="/">
                <img 
                  src="/images/About Us/DUAAB logo WHite.png" 
                  alt="DUAAB'89 Logo" 
                  className="h-40 w-auto"
                />
              </Link>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 text-white">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-[13px] leading-relaxed">House-11, Road-33, Gulshan-1, Dhaka</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Send className="h-4 w-4 flex-shrink-0" />
                <span className="text-[13px]">info@duaab89.org</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-[13px]">
                  <p>President: 01716913621</p>
                  <p>Secretary: 01785055555</p>
                  <p>Treasurer: 01711162365</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="text-white md:pl-8">
              <h3 className="font-medium text-[15px] mb-6">Quick links</h3>
              <div className="space-y-3 text-[13px]">
                <Link href="/" className="block hover:text-white/70 transition-colors">
                  Home
                </Link>
                <Link href="/about" className="block hover:text-white/70 transition-colors">
                  About
                </Link>
                <Link href="/directory" className="block hover:text-white/70 transition-colors">
                  Members
                </Link>
              </div>
            </div>

            {/* Account & Social */}
            <div className="text-white md:pl-8">
              <div className="space-y-3 text-[13px] mb-8">
                <Link href="/auth" className="block hover:text-white/70 transition-colors">
                  Login
                </Link>
                <Link href="/auth?mode=signup" className="block hover:text-white/70 transition-colors">
                  Register
                </Link>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-[13px]">Follow us</span>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#3b5998] p-1 rounded hover:bg-[#3b5998]/80 transition-colors"
                >
                  <Facebook className="h-4 w-4 fill-white text-white" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/40 text-[11px]">
              © {new Date().getFullYear()} DU Alumni Association Batch &apos;89. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}