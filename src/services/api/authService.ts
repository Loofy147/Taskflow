import { supabase } from '@/lib/supabase';
import { SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

export const authService = {
  async signUp(credentials: SignUpWithPasswordCredentials) {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) {
      throw error;
    }
    return data;
  },

  async signIn(credentials: SignInWithPasswordCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      throw error;
    }
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw error;
    }
  },

  async onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }
};
