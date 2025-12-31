-- Create function to handle new artist creation
CREATE OR REPLACE FUNCTION public.handle_new_artist()
RETURNS TRIGGER AS $$
BEGIN
  -- Cast to text to avoid enum errors, though strictly 'ARTIST' is the enum value
  -- checking case insensitively just in case
  IF upper(NEW.role::text) = 'ARTIST' THEN
    INSERT INTO public.artists (profile_id, slug, portfolio_layout)
    VALUES (
      NEW.id, 
      -- Generate a slug: username (or 'artist') + - + random 6 chars. 
      lower(COALESCE(NEW.username, 'artist')) || '-' || substr(md5(random()::text), 1, 6), 
      'default' 
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
