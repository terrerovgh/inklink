-- SEED DATA
-- Note: UUIDs are hardcoded for reproducibility in this example. In production, use dynamic IDs or specific known UUIDs.

-- 1. USERS (Profiles)
-- Admin
INSERT INTO public.profiles (id, email, role, full_name, username, bio, preferences)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'terrerov@gmail.com', 'admin', 'Terrerov Admin', 'terrerov', 'System Administrator', '{}');

-- Studio Owner (David)
INSERT INTO public.profiles (id, email, role, full_name, username, bio, preferences, location)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'david@cubatattoostudio.com', 'studio_owner', 'David Owner', 'davidtats', 'Owner of Cuba Tattoo Studio', '{"blackwork": 0.8}', ST_SetSRID(ST_MakePoint(-106.6504, 35.0844), 4326));

-- Artist 1 (Nina)
INSERT INTO public.profiles (id, email, role, full_name, username, bio, preferences, location)
VALUES 
    ('00000000-0000-0000-0000-000000000003', 'nina@cubatattoostudio.com', 'artist', 'Nina Ink', 'ninaink', 'Specialist in Fine Line', '{"fineline": 0.9, "floral": 0.7}', ST_SetSRID(ST_MakePoint(-106.6000, 35.1000), 4326));

-- Artist 2 (Karli)
INSERT INTO public.profiles (id, email, role, full_name, username, bio, preferences, location)
VALUES 
    ('00000000-0000-0000-0000-000000000004', 'karli@cubatattoostudio.com', 'artist', 'Karli Color', 'karlicolor', 'Watercolor Expert', '{"watercolor": 0.9}', ST_SetSRID(ST_MakePoint(-106.6200, 35.0900), 4326));

-- User (Johon)
INSERT INTO public.profiles (id, email, role, full_name, username, bio, preferences, location)
VALUES 
    ('00000000-0000-0000-0000-000000000005', 'johon@inklink.com', 'user', 'Johon Doe', 'johon', 'Tattoo Enthusiast', '{"realism": 0.5, "neotrad": 0.5}', ST_SetSRID(ST_MakePoint(-106.6504, 35.0844), 4326)); -- Albuquerque

-- 2. STUDIOS
INSERT INTO public.studios (id, owner_id, name, slug, description, location, city, country, is_premium)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Cuba Tattoo Studio', 'cuba-tattoo-studio', 'Premium tattoo studio in ABQ', ST_SetSRID(ST_MakePoint(-106.6504, 35.0844), 4326), 'Albuquerque', 'USA', TRUE);

-- 3. STUDIO MEMBERS
-- David (Owner is also artist/member)
INSERT INTO public.studio_members (studio_id, user_id, role)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'owner');

-- Nina
INSERT INTO public.studio_members (studio_id, user_id, role)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'artist');

-- Karli
INSERT INTO public.studio_members (studio_id, user_id, role)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'artist');
