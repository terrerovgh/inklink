-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enums
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'artist', 'studio_owner', 'user');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'deposit_paid', 'scheduled', 'completed', 'cancelled');
CREATE TYPE dossier_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'archived');
CREATE TYPE marketplace_status AS ENUM ('active', 'assigned', 'closed');

-- PROFILES (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb, -- AI Style Weights: {"realism": 0.9, "traditional": 0.2}
    location GEOGRAPHY(POINT), -- User's location for feed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDIOS
CREATE TABLE public.studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    location GEOGRAPHY(POINT),
    address TEXT,
    city TEXT,
    country TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDIO MEMBERS
CREATE TABLE public.studio_members (
    studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'artist', -- 'artist', 'guest', 'manager'
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (studio_id, user_id)
);

-- DOSSIERS (The central project entity)
CREATE TABLE public.dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    body_zone TEXT, -- e.g., "Forearm", "Back"
    size_cm TEXT, -- e.g., "15x15cm"
    budget_min INTEGER,
    budget_max INTEGER,
    concept_images TEXT[], -- Array of URLs
    status dossier_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MARKET LISTINGS (Public Dossiers)
CREATE TABLE public.market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
    status marketplace_status DEFAULT 'active',
    location_filter GEOGRAPHY(POINT), -- Priority location
    radius_km INTEGER DEFAULT 50, -- Visibility radius
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FLASH TATTOOS
CREATE TABLE public.flash_tattoos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    price INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dossier_id UUID REFERENCES public.dossiers(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    studio_id UUID REFERENCES public.studios(id) ON DELETE SET NULL, -- Optional (might be independent artist)
    status booking_status DEFAULT 'pending',
    date TIMESTAMPTZ,
    deposit_amount INTEGER DEFAULT 0,
    total_price INTEGER,
    stripe_payment_intent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (Chat)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLOG POSTS
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Markdown/HTML
    image_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICES
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_min INTEGER NOT NULL, -- e.g., 60 for 1 hour
    price INTEGER, -- Base price
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT service_owner_check CHECK (studio_id IS NOT NULL OR artist_id IS NOT NULL)
);

-- ARTIST AVAILABILITY
CREATE TABLE public.artist_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE, -- If not recurring
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STYLES
CREATE TABLE public.styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILE STYLES (Join Table)
CREATE TABLE public.profile_styles (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    style_id UUID REFERENCES public.styles(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, style_id)
);

-- DOSSIER STYLES (Join Table)
CREATE TABLE public.dossier_styles (
    dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
    style_id UUID REFERENCES public.styles(id) ON DELETE CASCADE,
    PRIMARY KEY (dossier_id, style_id)
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    type TEXT, -- 'booking_update', 'message', 'system'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Basic Setup)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, Self update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Studios: Public read, Owner update
CREATE POLICY "Studios are viewable by everyone" ON public.studios FOR SELECT USING (true);
CREATE POLICY "Owners can update their studio" ON public.studios FOR UPDATE USING (auth.uid() = owner_id);

-- Dossiers: Owner read/update
CREATE POLICY "Users can view own dossiers" ON public.dossiers FOR SELECT USING (auth.uid() = user_id);
-- (Add policies for artists to view dossiers they are booked for or applied to - simplified for now)

-- Bookings: Participant read
CREATE POLICY "Participants can view bookings" ON public.bookings FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = artist_id);

-- Services: Public read, Owner update
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Artists can update their services" ON public.services FOR UPDATE USING (auth.uid() = artist_id);

-- Styles: Public read
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Styles are viewable by everyone" ON public.styles FOR SELECT USING (true);

-- Notifications: User read only
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);


-- STORAGE BUCKETS
-- (Note: In Supabase, buckets are usually created via API/Dashboard, but this script documents it)
-- insert into storage.buckets (id, name, public) values ('dossiers', 'dossiers', true);
-- insert into storage.buckets (id, name, public) values ('portfolios', 'portfolios', true);

-- Storage Policies
-- Dossiers: Authenticated users can upload, Everyone can view
-- create policy "Authenticated users can upload dossiers" on storage.objects for insert with check (bucket_id = 'dossiers' and auth.role() = 'authenticated');
-- create policy "Users can update own dossier files" on storage.objects for update using (bucket_id = 'dossiers' and auth.uid()::text = (storage.foldername(name))[1]);

-- Portfolios: Authenticated uploads
-- create policy "Authenticated users can upload portfolio" on storage.objects for insert with check (bucket_id = 'portfolios' and auth.role() = 'authenticated');

