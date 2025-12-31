-- Create function to handle new artist creation
CREATE OR REPLACE FUNCTION public.handle_new_artist()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new role is ARTIST (handling both case variants just to be safe, though DB enum is usually upper)
  IF NEW.role = 'ARTIST' OR NEW.role = 'artist' THEN
    INSERT INTO public.artists (profile_id, slug, portfolio_layout)
    VALUES (
      NEW.id, 
      -- Generate a slug: username (or 'artist') + - + random 6 chars. 
      -- This ensures uniqueness and non-null slug.
      lower(COALESCE(NEW.username, 'artist')) || '-' || substr(md5(random()::text), 1, 6), 
      'default' -- The default template/layout
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-run
DROP TRIGGER IF EXISTS on_artist_role_change ON public.profiles;

-- Create trigger
CREATE TRIGGER on_artist_role_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_artist();
