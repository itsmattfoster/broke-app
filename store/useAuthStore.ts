import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Check if email confirmation is needed (user exists but no session)
      const needsEmailConfirmation = data.user && !data.session;

      if (data.user && data.session) {
        // User is automatically signed in (email confirmation disabled)
        set({
          user: data.user,
          session: data.session,
        });
      } else if (data.user) {
        // User created but needs email confirmation
        set({
          user: data.user,
          session: null,
        });
      }

      return { error: null, needsEmailConfirmation };
    } catch (error: any) {
      return { error };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user && data.session) {
        set({
          user: data.user,
          session: data.session,
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        loading: false,
        initialized: true,
      });
    }
  },

  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
}));

