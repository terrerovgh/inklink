import { atom } from 'nanostores';
import type { User, Session } from '@supabase/supabase-js';

export const $user = atom<User | null>(null);
export const $session = atom<Session | null>(null);

// Helper to check if user is loading (initial state)
export const $authLoading = atom<boolean>(true);
