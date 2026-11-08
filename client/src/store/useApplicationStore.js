// client/src/store/useApplicationStore.js
/**
 * ============================================================================
 * APPLICATION PIPELINE STATE STORE (Zustand)
 * ============================================================================
 * Manages student applications, status progression tracking, and recruiter reviews.
 * ============================================================================
 */

import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useApplicationStore = create((set, get) => ({
  myApplications: [],
  driveApplicants: [],
  currentDriveInfo: null,
  isLoading: false,
  isApplying: false,
  error: null,
  successMessage: null,

  clearNotifications: () => set({ error: null, successMessage: null }),

  /**
   * Fetches applications submitted by the logged-in student.
   */
  fetchMyApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient('/applications/my-applications');
      set({
        myApplications: response.applications || [],
        isLoading: false
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load your applications.'
      });
    }
  },

  /**
   * Submits student application to a recruitment drive.
   */
  applyToDrive: async (driveId) => {
    set({ isApplying: true, error: null, successMessage: null });
    try {
      const response = await apiClient(`/drives/${driveId}/apply`, {
        method: 'POST'
      });

      set({
        isApplying: false,
        successMessage: response.message || 'Application submitted successfully!'
      });

      // Refresh applications list
      await get().fetchMyApplications();

      return { success: true, message: response.message };
    } catch (err) {
      set({
        isApplying: false,
        error: err.message || 'Application failed.'
      });
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetches all applicant submissions for a specific drive (Recruiter/TPO).
   */
  fetchDriveApplicants: async (driveId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient(`/drives/${driveId}/applications`);
      set({
        driveApplicants: response.applications || [],
        currentDriveInfo: {
          title: response.driveTitle,
          company: response.companyName
        },
        isLoading: false
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load drive applicants.'
      });
    }
  },

  /**
   * Transitions applicant status: APPLIED -> SHORTLISTED -> INTERVIEW -> OFFERED / REJECTED
   */
  updateApplicantStatus: async (applicationId, status, recruiterFeedback = '') => {
    try {
      const response = await apiClient(`/applications/${applicationId}/status`, {
        method: 'PUT',
        body: { status, recruiterFeedback }
      });

      // Update state in applicant list immediately
      set(state => ({
        driveApplicants: state.driveApplicants.map(app => 
          app.application_id === applicationId 
            ? { ...app, status, recruiter_feedback: recruiterFeedback, updated_at: new Date().toISOString() }
            : app
        )
      }));

      return { success: true, message: response.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}));
