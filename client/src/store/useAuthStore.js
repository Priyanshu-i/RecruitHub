// client/src/store/useAuthStore.js
/**
 * ============================================================================
 * AUTHENTICATION STATE STORE (Zustand)
 * ============================================================================
 * Why Zustand for Portfolio / Interview Demonstration?
 * 1. Zero Boilerplate: Compared to Redux Toolkit (which demands slices, action types,
 *    extraReducers, and store providers), Zustand encapsulates state and actions
 *    in a single clean hook with zero wrapper providers.
 * 2. Fine-Grained Selectors: Components only re-render when their explicitly
 *    selected slice of state updates, avoiding the notorious React Context
 *    unnecessary re-render cascades.
 * 3. Native Async Support: Async API calls are written directly inside actions
 *    without complex middleware like redux-thunk or redux-saga.
 * ============================================================================
 */

import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAuthStore = create((set, get) => ({
  // Initialize state from localStorage for persistent session
  token: localStorage.getItem('recruithub_token') || null,
  user: JSON.parse(localStorage.getItem('recruithub_user') || 'null'),
  profile: null,
  isAuthenticated: !!localStorage.getItem('recruithub_token'),
  isLoading: false,
  error: null,

  /**
   * Clears any active error banner
   */
  clearError: () => set({ error: null }),

  /**
   * Logs in a user, stores the custom JWT token in localStorage, and initializes session.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      const { token, user, profile } = response;

      localStorage.setItem('recruithub_token', token);
      localStorage.setItem('recruithub_user', JSON.stringify(user));

      set({
        token,
        user,
        profile,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, user };
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.'
      });
      return { success: false, error: err.message };
    }
  },

  /**
   * Registers a new student or recruiter account and issues an initial JWT.
   */
  register: async (registrationData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient('/auth/register', {
        method: 'POST',
        body: registrationData
      });

      const { token, user } = response;

      localStorage.setItem('recruithub_token', token);
      localStorage.setItem('recruithub_user', JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Fetch newly created profile
      await get().fetchMe();

      return { success: true };
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Registration failed.'
      });
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetches the latest authenticated user information and profile details.
   */
  fetchMe: async () => {
    if (!get().token) return;
    try {
      const response = await apiClient('/auth/me');
      set({
        user: response.user,
        profile: response.profile,
        isAuthenticated: true
      });
    } catch (err) {
      // If token expired or invalid, reset auth state
      get().logout();
    }
  },

  /**
   * Updates student academic metrics (CGPA, Branch, Skills, Resume link).
   */
  updateStudentProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient('/students/profile', {
        method: 'PUT',
        body: profileData
      });

      set(state => ({
        profile: response.profile,
        isLoading: false,
        user: { ...state.user, name: profileData.name || state.user?.name }
      }));

      // Update cached user if name changed
      const updatedUser = { ...get().user, name: profileData.name || get().user?.name };
      localStorage.setItem('recruithub_user', JSON.stringify(updatedUser));

      return { success: true, message: response.message };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Logs out user by clearing persistent storage and resetting Zustand store.
   */
  logout: () => {
    localStorage.removeItem('recruithub_token');
    localStorage.removeItem('recruithub_user');
    set({
      token: null,
      user: null,
      profile: null,
      isAuthenticated: false,
      error: null
    });
  }
}));
