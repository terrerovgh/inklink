export type * from '../types/database';
import { type Profile, type Studio, type Dossier, type Booking, type StudioMember } from '../types/database';

// Helper to omit generated fields
type DbInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
type DbUpdate<T> = Partial<DbInsert<T>>;

export interface Database {
    public: {
        Tables: {
            profiles: { Row: Profile; Insert: DbInsert<Profile>; Update: DbUpdate<Profile> };
            studios: { Row: Studio; Insert: DbInsert<Studio>; Update: DbUpdate<Studio> };
            studio_members: { Row: StudioMember; Insert: DbInsert<StudioMember>; Update: DbUpdate<StudioMember> };
            dossiers: { Row: Dossier; Insert: DbInsert<Dossier>; Update: DbUpdate<Dossier> };
            bookings: { Row: Booking; Insert: DbInsert<Booking>; Update: DbUpdate<Booking> };
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
