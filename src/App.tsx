import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Directory from "./pages/Directory";
import News from "./pages/News";
import Gallery from "./pages/Gallery";
import Admin from "./pages/Admin";
import Profile from '@/pages/Profile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/directory" 
              element={
                <ProtectedRoute approvedMemberOnly>
                  <Directory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/news" 
              element={
                <ProtectedRoute>
                  <News />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gallery" 
              element={
                <ProtectedRoute approvedMemberOnly>
                  <Gallery />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute approvedMemberOnly>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
