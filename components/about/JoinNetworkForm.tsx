'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function JoinNetworkForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to check email');
      }

      const data = await response.json();

      if (data.exists) {
        // Email exists, redirect to sign in
        toast.info('Email already registered. Redirecting to sign in...');
        router.push(`/auth?mode=signin&email=${encodeURIComponent(email)}`);
      } else {
        // Email doesn't exist, redirect to sign up
        toast.info('New email detected. Redirecting to registration...');
        router.push(`/auth?mode=signup&email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input 
        type="email" 
        placeholder="Email address" 
        className="bg-white h-12"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        required
      />
      <Button 
        type="submit"
        className="px-8 h-12 bg-indigo-900 hover:bg-indigo-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Register →'
        )}
      </Button>
    </form>
  );
}
