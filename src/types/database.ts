export type AppRole = 'admin' | 'editor' | 'artist' | 'studio_owner' | 'user';
export type BookingStatus = 'pending' | 'approved' | 'deposit_paid' | 'scheduled' | 'completed' | 'cancelled';
export type DossierStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'archived';

export interface Json {
  [key: string]: string | number | boolean | null | Json | Json[];
}

export interface Profile {
  id: string; // UUID
  email: string;
  role: AppRole;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Json; // e.g., { "realism": 0.8 }
  location: any; // PostGIS point definition dependent on client lib (usually GeoJSON)
  created_at: string;
  updated_at: string;
}

export interface Studio {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  location: any; // GeoJSON Point
  address: string | null;
  city: string | null;
  country: string | null;
  is_premium: boolean;
  created_at: string;
}

export interface StudioMember {
  studio_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
}

export interface Dossier {
  id: string;
  user_id: string;
  title: string;
  description: string;
  body_zone: string | null;
  size_cm: string | null;
  budget_min: number | null;
  budget_max: number | null;
  concept_images: string[];
  status: DossierStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  dossier_id: string | null;
  client_id: string;
  artist_id: string | null;
  studio_id: string | null;
  status: BookingStatus;
  date: string | null;
  deposit_amount: number;
  total_price: number | null;
  stripe_payment_intent: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  published: boolean;
  tags: string[];
  created_at: string;
}

export interface FlashTattoo {
  id: string;
  artist_id: string;
  title: string;
  description: string | null;
  image_url: string;
  price: number | null;
  is_available: boolean;
  created_at: string;
}

export interface MarketListing {
  id: string;
  dossier_id: string;
  status: 'active' | 'assigned' | 'closed';
  location_filter: any;
  radius_km: number;
  created_at: string;
}

// New Tables

export interface Service {
  id: string;
  studio_id: string | null;
  artist_id: string | null;
  name: string;
  description: string | null;
  duration_min: number;
  price: number | null;
  created_at: string;
}

export interface ArtistAvailability {
  id: string;
  artist_id: string;
  day_of_week: number | null; // 0-6
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  is_recurring: boolean;
  specific_date: string | null; // YYYY-MM-DD
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  type: string | null;
  created_at: string;
}

export interface Style {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProfileStyle {
  profile_id: string;
  style_id: string;
}

export interface DossierStyle {
  dossier_id: string;
  style_id: string;
}
