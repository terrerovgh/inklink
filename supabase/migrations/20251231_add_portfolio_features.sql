-- Create styles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for styles
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Styles are viewable by everyone" ON public.styles FOR SELECT USING (true);

-- Add style_id to flash_tattoos
ALTER TABLE public.flash_tattoos ADD COLUMN IF NOT EXISTS style_id UUID REFERENCES public.styles(id);

-- Create table for manual studio portfolio curation
CREATE TABLE IF NOT EXISTS public.studio_portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE,
    flash_tattoo_id UUID REFERENCES public.flash_tattoos(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(studio_id, flash_tattoo_id)
);

-- Enable RLS
ALTER TABLE public.studio_portfolio_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Studio owners can manage portfolio items" ON public.studio_portfolio_items
    USING (auth.uid() = (SELECT owner_id FROM public.studios WHERE id = studio_portfolio_items.studio_id))
    WITH CHECK (auth.uid() = (SELECT owner_id FROM public.studios WHERE id = studio_portfolio_items.studio_id));

CREATE POLICY "Public can view studio portfolio items" ON public.studio_portfolio_items
    FOR SELECT USING (true);
