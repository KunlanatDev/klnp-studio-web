import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../core/supabase/client';

export type UserProfile = {
  id: string;
  display_name: string;
  avatar_url: string;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;

  initialize: () => Promise<() => void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      set({
        user: data.session?.user ?? null,
        session: data.session,
        initialized: true,
      });
    } catch {
      set({ initialized: true });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
        initialized: true,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ loading: false, error: message });
      throw err;
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      set({ loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ loading: false, error: message });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, profile: null, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      set({ loading: false, error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
