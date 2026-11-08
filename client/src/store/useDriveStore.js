// client/src/store/useDriveStore.js
/**
 * ============================================================================
 * PLACEMENT DRIVES STATE STORE (Zustand)
 * ============================================================================
 * Manages campus recruitment listings, search filtering, and recruiter actions.
 * ============================================================================
 */

import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useDriveStore = create((set, get) => ({
  drives: [],
  recruiterDrives: [],
  selectedDrive: null,
  isLoading: false,
  error: null,
  
  // Client-side search & filtering state
  searchQuery: '',
  statusFilter: 'ALL',
  eligibleOnly: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setEligibleOnly: (val) => set({ eligibleOnly: val }),
  setSelectedDrive: (drive) => set({ selectedDrive: drive }),

  /**
   * Fetches active placement drives with optional query parameters.
   */
  fetchDrives: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'ALL') queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minCgpa) queryParams.append('minCgpa', filters.minCgpa);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await apiClient(`/drives${qs}`);

      set({
        drives: response.drives || [],
        isLoading: false
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load placement drives.'
      });
    }
  },

  /**
   * Fetches drives posted by the logged-in recruiter.
   */
  fetchRecruiterDrives: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient('/drives/recruiter/my-drives');
      set({
        recruiterDrives: response.drives || [],
        isLoading: false
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  /**
   * Creates a new recruitment drive listing.
   */
  createDrive: async (driveData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient('/drives', {
        method: 'POST',
        body: driveData
      });

      // Update local state by prepending new drive
      set(state => ({
        drives: [response.drive, ...state.drives],
        recruiterDrives: [response.drive, ...state.recruiterDrives],
        isLoading: false
      }));

      return { success: true, drive: response.drive };
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Updates an existing drive listing.
   */
  updateDrive: async (id, updateData) => {
    try {
      const response = await apiClient(`/drives/${id}`, {
        method: 'PUT',
        body: updateData
      });

      set(state => ({
        drives: state.drives.map(d => d.id === id ? response.drive : d),
        recruiterDrives: state.recruiterDrives.map(d => d.id === id ? response.drive : d),
        selectedDrive: state.selectedDrive?.id === id ? response.drive : state.selectedDrive
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Deletes a drive listing.
   */
  deleteDrive: async (id) => {
    try {
      await apiClient(`/drives/${id}`, { method: 'DELETE' });

      set(state => ({
        drives: state.drives.filter(d => d.id !== id),
        recruiterDrives: state.recruiterDrives.filter(d => d.id !== id),
        selectedDrive: state.selectedDrive?.id === id ? null : state.selectedDrive
      }));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}));
