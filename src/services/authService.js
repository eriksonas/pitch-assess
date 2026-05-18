import { pb } from '../lib/pb';

/**
 * Authentication service for user account management.
 * Backed by PocketBase. Returns { data, error } for backward compatibility
 * with the previous Supabase-based shape.
 */
export const authService = {
  async signUp(email, password, fullName) {
    try {
      const record = await pb?.collection('users')?.create({
        email,
        password,
        passwordConfirm: password,
        full_name: fullName,
        role: 'user',
      });

      // Best-effort verification email; ignore failures (e.g. SMTP not configured).
      try {
        await pb?.collection('users')?.requestVerification(email);
      } catch (_) {
        /* ignore */
      }

      return { data: { user: record }, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: err?.message || 'Failed to create account.' },
      };
    }
  },

  async signIn(email, password) {
    try {
      const result = await pb?.collection('users')?.authWithPassword(email, password);
      return { data: { user: result?.record, session: { token: result?.token } }, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: err?.message || 'Failed to sign in.' },
      };
    }
  },

  async signOut() {
    try {
      pb?.authStore?.clear();
      return { error: null };
    } catch (err) {
      return { error: { message: err?.message || 'Failed to sign out.' } };
    }
  },

  async getSession() {
    const token = pb?.authStore?.token;
    const record = pb?.authStore?.record;
    return {
      data: {
        session: token ? { token, user: record } : null,
      },
      error: null,
    };
  },
};

export default authService;
