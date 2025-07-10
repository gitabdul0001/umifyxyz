import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: mapSupabaseUser(session.user),
          isAuthenticated: true,
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          setAuthState({
            user: mapSupabaseUser(session.user),
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
          });
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email || '',
    createdAt: supabaseUser.created_at,
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Add 2 second delay for login as requested
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return { success: false, message: error.message };
      }
      
      if (data.user) {
        console.log('Login successful:', data.user.id);
        return { success: true };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Add 2 second delay for signup as requested
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // First, try to sign up normally
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: undefined, // Disable email confirmation
        },
      });
      
      if (error) {
        console.error('Signup error:', error.message);
        
        // Handle rate limit error specifically
        if (error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
          return { 
            success: false, 
            message: 'Too many signup attempts. Please wait a few minutes before trying again, or try logging in if you already have an account.' 
          };
        }
        
        // Handle other common errors
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          return { 
            success: false, 
            message: 'An account with this email already exists. Please try logging in instead.' 
          };
        }
        
        return { success: false, message: error.message };
      }
      
      if (data.user) {
        console.log('Signup successful:', data.user.id);
        // Force set the auth state immediately for signup
        setAuthState({
          user: mapSupabaseUser(data.user),
          isAuthenticated: true,
        });
        return { success: true };
      }
      
      return { success: false, message: 'Signup failed' };
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle network or other errors
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        return { 
          success: false, 
          message: 'Too many signup attempts. Please wait a few minutes before trying again, or try logging in if you already have an account.' 
        };
      }
      
      return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    ...authState,
    loading,
    login,
    signup,
    logout,
  };
};