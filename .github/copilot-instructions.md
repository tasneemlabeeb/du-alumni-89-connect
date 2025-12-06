# Copilot Instructions for du-alumni-89-connect

## Project Overview
- **Stack:** Next.js 15 + TypeScript + Tailwind CSS + shadcn-ui + Firebase + Cloudflare R2
- **Purpose:** Alumni directory, news/events, blog, gallery, authentication, and admin features for DU Alumni 89 Connect.
- **Major Folders:**
  - `app/`: Next.js App Router pages and API routes
  - `components/`: UI and layout components, organized by feature and type
  - `lib/`: Utility functions, Firebase config, Cloudflare R2, and static data
  - `hooks/`: Custom React hooks (e.g., auth, toast, mobile detection)
  - `public/`: Static assets (images, robots.txt)

## Architecture & Patterns
- **Routing:** Next.js 15 App Router with file-based routing in `app/` directory. Navigation handled via `components/layout/Navigation.tsx`.
- **UI:** Use shadcn-ui and Tailwind CSS for all UI elements. See `components/ui/` for reusable primitives.
- **State & Auth:** Auth logic in `hooks/useAuth.tsx`. Use context and hooks for cross-component state.
- **External Services:**
  - **Firebase:** Config in `lib/firebase/config.ts` and `lib/firebase/admin.ts` (see FIREBASE_SETUP.md)
  - **Cloudflare R2:** Config in `lib/cloudflare/r2.ts` for file storage
- **Admin Features:** Admin-only pages/components in `components/admin/` and protected routes.

## Developer Workflow
- **Install:** `npm i`
- **Dev Server:** `npm run dev` (Next.js dev server, hot reload)
- **Build:** `npm run build`
- **Start Production:** `npm start`
- **Lint:** `npm run lint` (uses `eslint.config.js`)
- **Tailwind:** Config in `tailwind.config.ts`, postcss in `postcss.config.js`
- **TypeScript:** Config in `tsconfig.json` and `tsconfig.next.json`

## Conventions & Tips
- **Component Structure:** Prefer Server Components by default. Use 'use client' directive only when needed (interactivity, hooks, browser APIs).
- **Styling:** Use Tailwind classes. Avoid inline styles.
- **Data Fetching:** Use Server Components for data fetching when possible. Client-side fetching with hooks when needed.
- **API Routes:** Place in `app/api/` directory following Next.js conventions.
- **Sensitive Config:** Do not commit secrets. Use environment variables. See FIREBASE_SETUP.md for setup.

## Examples
- **Add a new page:** Create in `app/` directory following Next.js App Router conventions.
- **Add a new UI primitive:** Place in `components/ui/`, use Tailwind and shadcn-ui patterns.
- **Add an API route:** Create in `app/api/` directory with route.ts file.

---
For Next.js deployment and Lovable platform workflows, see [README.md](../README.md).
