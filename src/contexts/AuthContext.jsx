import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb } from '../lib/pb';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(pb?.authStore?.record ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // authStore is already populated from localStorage by the SDK before
    // this effect runs. We just need to mark loading complete and listen
    // for future auth changes (sign in/out from any tab).
    setLoading(false);

    const unsubscribe = pb?.authStore?.onChange((_token, record) => {
      setUser(record ?? null);
    });

    return () => unsubscribe?.();
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await pb?.collection('users')?.authWithPassword(email, password);
      return { data: { user: result?.record }, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: err?.message || 'Failed to sign in. Please try again.' },
      };
    }
  };

  const signOut = async () => {
    try {
      pb?.authStore?.clear();
      return { error: null };
    } catch (err) {
      return { error: { message: err?.message || 'Failed to sign out.' } };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } };

    try {
      const updated = await pb?.collection('users')?.update(user?.id, updates);
      // Refresh the auth store so subscribers (this context) see the new record.
      pb?.authStore?.save(pb?.authStore?.token, updated);
      return { data: updated, error: null };
    } catch (err) {
      return { error: { message: err?.message || 'Failed to update profile.' } };
    }
  };

  const value = {
    user,
    // userProfile is preserved for backward compatibility — in PocketBase the
    // profile fields live on the user record itself, so these reference the
    // same object.
    userProfile: user,
    loading,
    profileLoading: false,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
