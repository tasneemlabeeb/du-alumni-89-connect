# Page Submenu Component

## Overview
The `PageSubmenu` component is a reusable, full-width horizontal navigation bar that displays beneath the main navigation and above page content. It provides a consistent navigation pattern for pages with categories or sub-sections.

## Features
- **Full page-wide**: Spans the entire width of the viewport
- **Active state indication**: Shows an underline indicator for the active item
- **Dual mode support**: Can work with both client-side state and Next.js routing
- **Responsive design**: Horizontal scrolling on mobile devices with hidden scrollbar
- **Consistent styling**: Matches the DU Alumni '89 design system
- **Flexible placement**: Designed to be placed before the page banner/hero section

## Usage

### Placement
The submenu should be placed **after the main navigation** and **before the page banner/hero section**:

```tsx
export default function YourPage() {
  const [category, setCategory] = useState("all");

  return (
    <div className="min-h-screen">
      {/* PageSubmenu - Right after main nav, before banner */}
      <PageSubmenu
        items={[...]}
        activeValue={category}
        onItemClick={setCategory}
      />

      {/* Hero/Banner Section */}
      <div className="hero">...</div>

      {/* Main Content */}
      <div className="container">...</div>
    </div>
  );
}
```

### Client-side State Mode (Filtering/Tabs)
Used when the submenu controls filtering or tab switching within the same page:

```tsx
import PageSubmenu from "@/components/layout/PageSubmenu";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div>
      <PageSubmenu
        items={[
          { label: "All News", value: "all" },
          { label: "Achievements", value: "achievements" },
          { label: "Announcements", value: "announcements" },
          { label: "Media/ Press", value: "media_press" },
          { label: "Alumni Stories", value: "alumni_stories" },
        ]}
        activeValue={activeCategory}
        onItemClick={setActiveCategory}
      />
      {/* Your content */}
    </div>
  );
}
```

### Next.js Routing Mode (Page Navigation)
Used when the submenu links to different pages:

```tsx
import PageSubmenu from "@/components/layout/PageSubmenu";

export default function GalleryPage() {
  return (
    <div>
      <PageSubmenu
        items={[
          { label: "All Photos", value: "all", href: "/gallery" },
          { label: "Events", value: "events", href: "/gallery/events" },
          { label: "Campus Life", value: "campus", href: "/gallery/campus" },
          { label: "Reunions", value: "reunions", href: "/gallery/reunions" },
        ]}
      />
      {/* Your content */}
    </div>
  );
}
```

## Props

### SubmenuItem
```typescript
interface SubmenuItem {
  label: string;      // Display text
  value: string;      // Unique identifier
  href?: string;      // Optional: Link URL for routing mode
}
```

### PageSubmenuProps
```typescript
interface PageSubmenuProps {
  items: SubmenuItem[];           // Array of menu items
  activeValue?: string;           // Currently active item value (for state mode)
  onItemClick?: (value: string) => void;  // Click handler (for state mode)
  className?: string;             // Additional CSS classes
}
```

## Implementation Examples

### 1. News Page (✅ Implemented)
Filters news articles by category:
- All News
- Achievements
- Announcements
- Media/ Press
- Alumni Stories

### 2. Blog Page (✅ Implemented)
Switches between blog categories:
- Campus Memories
- Published Articles
- Talent Hub

### 3. Gallery Page (Example)
Could organize photos by type:
```tsx
<PageSubmenu
  items={[
    { label: "All Photos", value: "all" },
    { label: "Events", value: "events" },
    { label: "Campus Life", value: "campus" },
    { label: "Reunions", value: "reunions" },
    { label: "Achievements", value: "achievements" },
  ]}
  activeValue={photoCategory}
  onItemClick={setPhotoCategory}
/>
```

### 4. Committee Page (Example)
Could show different committee types:
```tsx
<PageSubmenu
  items={[
    { label: "Current Executive", value: "current", href: "/committee" },
    { label: "Advisory Committee", value: "advisory", href: "/committee/advisory" },
    { label: "Previous Committees", value: "previous", href: "/committee/previous" },
  ]}
/>
```

### 5. Directory Page (Example)
Could filter members by department or status:
```tsx
<PageSubmenu
  items={[
    { label: "All Members", value: "all" },
    { label: "Law", value: "law" },
    { label: "Business", value: "business" },
    { label: "Engineering", value: "engineering" },
    { label: "Medicine", value: "medicine" },
  ]}
  activeValue={department}
  onItemClick={setDepartment}
/>
```

## Styling

The component uses:
- **Full Width**: `w-full` spanning entire viewport
- **Active state**: `text-indigo-700` with bottom border
- **Inactive state**: `text-gray-600` with hover effect
- **Border**: Bottom border for visual separation
- **Responsive**: Horizontal scrolling on mobile with hidden scrollbar
- **Padding**: Responsive padding (px-4 md:px-8 lg:px-16)

## Design Pattern

The submenu should be placed:
1. **After the main navigation** (Header component)
2. **Before the page hero/banner section**
3. This creates a clear visual hierarchy

Example structure:
```tsx
<div className="min-h-screen">
  {/* Main Navigation is in layout.tsx */}
  
  {/* Page Submenu - Right after nav, before banner */}
  <PageSubmenu items={...} />
  
  {/* Hero/Banner Section */}
  <div className="hero">...</div>
  
  {/* Main Content */}
  <div className="container">
    {/* Your category-specific content here */}
    {/* You can also add additional filter buttons/tabs here */}
  </div>
</div>
```

## Important Notes

1. **Does NOT replace existing category buttons**: The submenu is designed to work alongside existing category filters/buttons in your page content. It provides top-level navigation while detailed filters remain in the content area.

2. **Page-wide positioning**: The submenu spans the full page width and sits above the banner, creating a secondary navigation layer.

## Accessibility

- Uses semantic HTML (`<button>` for state, `<Link>` for navigation)
- Keyboard navigable
- Clear visual focus states
- Descriptive labels

## Browser Support

- Sticky positioning supported in all modern browsers
- Horizontal scroll supported on mobile devices
- Smooth transitions for better UX
