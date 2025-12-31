# InkLink Architecture

## Overview
InkLink is a premium marketplace and social network for the tattoo industry. It connects users with studios and artists through a highly visual, AI-driven platform.

## Technology Stack

- **Frontend**: Astro 5 (SSR) + React + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Deployment**: Cloudflare Pages (Node.js/SSR Adapter)
- **Payments**: Stripe Connect

---

## Core Layers

### Frontend (Astro + React)
*   **Routing**: File-system based routing in `src/pages`.
    *   `/dashboard/*`: Protected routes for Artists/Admins (SSR check for session).
    *   `/studio/[slug]`: Public studio execution pages (SSG + ISR or purely SSR).
*   **Islands Architecture**: React components are hydrated only when interactive (e.g., Booking Modal, Map View, Chat). Static content (Blogs, Profiles) remains standard HTML.
*   **State Management**: `nanostores` for shared state (User Session, Cart, Notifications).
*   **Styling**: Tailwind CSS with `shadcn/ui` components.
*   **Animations**: GSAP for complex entrance animations + View Transitions for page navigation.

### Backend (Supabase)
*   **Auth**: Built-in Supabase Auth.
    *   Providers: Email/Password, Google.
    *   **Role Management**: Roles (`admin`, `artist`, `studio_owner`) are stored in the `public.profiles` table and synced via triggers or checked at application level.
*   **Database**: PostgreSQL. See definitions in `supabase/` or the [API Documentation](./api.md).
    *   **Core**: Profiles, Studios, Members.
    *   **Operations**: Bookings, Dossiers, Messages, Notifications.
    *   **Catalog**: Services, Styles, Artist Availability, Flash Tattoos.
*   **Storage**: Buckets for:
    *   `avatars`: User profile pictures.
    *   `portfolio`: Artist work (public).
    *   `dossiers`: Concept images (private/restricted).
*   **Realtime**: Enabled on `messages` table for chat functionality.

### Payments (Stripe)
*   **Marketplace Model**: Stripe Connect.
    *   **Artists/Studios**: Onboard as "Connected Accounts".
    *   **Flow**:
        1.  Client pays Deposit -> Funds held in Platform.
        2.  Booking Completed -> Funds transferred to Artist (minus Platform Fee).
*   **Webhooks**: Listened to via an API Route (`src/pages/api/webhooks/stripe.ts`) to update `bookings` status in Supabase.

---

## Data Flow

### User Request (SSR)
1.  Browser requests `/dashboard`.
2.  Astro Middleware (`src/middleware.ts`) checks `sb-access-token` cookie.
3.  If valid, fetches Profile & RLS-protected data server-side.
4.  Renders HTML + Hydrates React Islands.

### Client-Side Interaction (SPA feel)
1.  User clicks "Book Now".
2.  React Component (`BookingModal.tsx`) opens.
3.  Submits data to `src/actions` (Astro Actions) or direct Supabase Client call.
4.  Optimistic UI update via Nanostores.

### AI Recommendations
1.  User browses images.
2.  Client tracks dwell time/likes -> updates `preferences` JSONB in `profiles`.
3.  **Feed Generation**:
    *   Option A (Simple): Postgres function sorts by style overlap.
    *   Option B (Advanced): `Transformers.js` runs client-side (or Edge Function) to re-rank fetched results based on embeddings.

---

## Security
*   **RLS (Row Level Security)**: Primary defense. No data is accessible without a matching policy in PostgreSQL.
*   **Input Validation**: `zod` used for all form submissions and API endpoints.
*   **Secrets**: Service Role Keys and Stripe Secret Keys are never exposed to the client. Using `.env` for management.
