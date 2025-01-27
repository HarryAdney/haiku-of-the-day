import React, { useState } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function AuthButton() {
  const { user, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    const email = prompt('Email:');
    if (!email) return;

    const password = prompt('Password:');
    if (!password) return;

    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
          // If login fails, offer to sign up
          if (confirm('Account not found. Would you like to create one?')) {
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: window.location.origin
              }
            });

            if (signUpError) {
              throw signUpError;
            }
            toast.success('Account created! You can now sign in.');
          }
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully signed in!');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="text-sm">{user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isAuthenticating}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isAuthenticating}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
    >
      {isAuthenticating ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      Sign In
    </button>
  );
}