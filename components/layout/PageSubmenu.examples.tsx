"use client";

import { useState, useEffect } from "react";
import PageSubmenu from "@/components/layout/PageSubmenu";

/**
 * Example 1: Client-side State (Filtering/Tabs)
 * Use this when the submenu controls filtering or tab switching within the same page
 */
export function NewsPageExample() {
  const [category, setCategory] = useState("all");

  return (
    <div>
      <PageSubmenu
        items={[
          { label: "All News", value: "all" },
          { label: "Achievements", value: "achievements" },
          { label: "Announcements", value: "announcements" },
        ]}
        activeValue={category}
        onItemClick={setCategory}
      />
    </div>
  );
}

/**
 * Example 2: Next.js Routing (Page Navigation)
 * Use this when the submenu should navigate to different pages
 */
export function GalleryPageExample() {
  return (
    <div>
      <PageSubmenu
        items={[
          { label: "All Photos", value: "all", href: "/gallery" },
          { label: "Events", value: "events", href: "/gallery/events" },
          { label: "Campus", value: "campus", href: "/gallery/campus" },
        ]}
      />
    </div>
  );
}

/**
 * Example 3: Complete Page Structure
 */
export function CompletePageExample() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 bg-cover bg-center">
        <h1>Page Title</h1>
      </div>

      {/* Page Submenu - Sticky */}
      <PageSubmenu
        items={[
          { label: "Category 1", value: "cat1" },
          { label: "Category 2", value: "cat2" },
          { label: "Category 3", value: "cat3" },
        ]}
        activeValue={activeCategory}
        onItemClick={setActiveCategory}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Your filtered content here */}
      </div>
    </div>
  );
}

/**
 * Example 4: Dynamic Items from API
 */
export function DynamicItemsExample() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    // Fetch categories from API (placeholder)
    const fetchCategories = async () => {
      // const response = await fetch('/api/categories');
      // const cats = await response.json();
      const cats = []; // Replace with actual API call
      
      const items = [
        { label: "All", value: "all" },
        ...cats.map((cat: any) => ({
          label: cat.name,
          value: cat.id
        }))
      ];
      setCategories(items);
    };
    
    fetchCategories();
  }, []);

  return (
    <PageSubmenu
      items={categories}
      activeValue={activeCategory}
      onItemClick={setActiveCategory}
    />
  );
}
