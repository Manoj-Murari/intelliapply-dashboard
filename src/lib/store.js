import { create } from 'zustand';
import { supabase } from './supabaseClient';

export const useStore = create((set, get) => ({
    // --- STATE ---
    view: 'dashboard',
    allJobs: [],
    newJobs: [],
    profiles: [],
    searches: [],
    selectedJob: null,
    loading: true,
    notifications: [],
    modalState: { isOpen: false, onConfirm: null, title: '', message: '' },
    isSearching: false,
    isTailorModalOpen: false,
    isCoverLetterModalOpen: false,
    isInterviewPrepModalOpen: false,
    channel: null,

    // --- ACTIONS ---

    // View Management
    setView: (view) => set({ view }),
    setSelectedJob: (job) => set({ selectedJob: job }),
    openTailorModal: () => set({ isTailorModalOpen: true }),
    closeTailorModal: () => set({ isTailorModalOpen: false }),
    openCoverLetterModal: () => set({ isCoverLetterModalOpen: true }),
    closeCoverLetterModal: () => set({ isCoverLetterModalOpen: false }),
    openInterviewPrepModal: () => set({ isInterviewPrepModalOpen: true }),
    closeInterviewPrepModal: () => set({ isInterviewPrepModalOpen: false }),

    // Notification Management
    addNotification: (message, type = 'success') => {
        const id = Date.now();
        set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    },
    removeNotification: (id) => {
        set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    },

    // Confirmation Modal Management
    openConfirmationModal: (title, message, onConfirm) => {
        set({ modalState: { isOpen: true, title, message, onConfirm } });
    },
    closeConfirmationModal: () => {
        set({ modalState: { isOpen: false, onConfirm: null, title: '', message: '' } });
    },

    // Data Fetching
    fetchAllData: async () => {
        set({ loading: true });
        await Promise.all([
            get().fetchJobs(),
            get().fetchProfiles(),
            get().fetchSearches()
        ]);
        set({ loading: false });
    },
    fetchJobs: async () => {
        const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        set({ allJobs: data || [] });
    },
    fetchProfiles: async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        set({ profiles: data || [] });
    },
    fetchSearches: async () => {
        const { data } = await supabase.from('searches').select('*').order('created_at', { ascending: false });
        set({ searches: data || [] });
    },

    // Realtime Subscription
    subscribeToJobs: () => {
        if (get().channel) return;
        const channel = supabase.channel('public:jobs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
            set(state => ({
                allJobs: [payload.new, ...state.allJobs],
                newJobs: [payload.new, ...state.newJobs],
                isSearching: false
            }));
            get().addNotification(`New job found: ${payload.new.title}`, 'info');
        }).subscribe();
        set({ channel });
    },
    unsubscribeFromJobs: () => {
        const channel = get().channel;
        if (channel) {
            supabase.removeChannel(channel);
            set({ channel: null });
        }
    },

    // On-Demand Search Trigger
    handleTriggerJobSearch: async () => {
        if (get().isSearching) {
            get().addNotification('A job search is already in progress.', 'info');
            return;
        }
        set({ newJobs: [], isSearching: true });
        try {
            const response = await fetch('http://localhost:5001/run-search', { method: 'POST' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to trigger search.');
            get().addNotification(data.message, 'success');
            setTimeout(() => {
                if (get().isSearching) {
                    set({ isSearching: false });
                    get().addNotification("Job search complete. No new jobs found this time.", "info");
                }
            }, 180000);
        } catch (error) {
            get().addNotification(`Error: ${error.message}`, 'error');
            set({ isSearching: false });
        }
    },

    // CRUD Operations
    handleSaveProfile: async (profile) => {
        const profileData = { profile_name: profile.profile_name, resume_context: profile.resume_context };
        if (profile.id) { await supabase.from('profiles').update(profileData).eq('id', profile.id); } 
        else { await supabase.from('profiles').insert([profileData]); }
        get().addNotification(`Profile saved!`);
        get().fetchProfiles();
    },
    handleDeleteProfile: async (id) => {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) { get().addNotification('Error deleting profile.', 'error'); } 
        else { get().addNotification('Profile deleted.'); set(state => ({ profiles: state.profiles.filter(p => p.id !== id) })); }
        get().closeConfirmationModal();
    },
    handleSaveSearch: async (search) => {
        const searchData = { search_name: search.search_name, search_term: search.search_term, country: search.country, profile_id: search.profile_id, experience_level: search.experience_level, hours_old: search.hours_old };
        if (search.id) { await supabase.from('searches').update(searchData).eq('id', search.id); } 
        else { await supabase.from('searches').insert([searchData]); }
        get().addNotification(`Search saved!`);
        get().fetchSearches();
    },
    handleDeleteSearch: async (id) => {
        const { error } = await supabase.from('searches').delete().eq('id', id);
        if (error) { get().addNotification('Error deleting search.', 'error'); } 
        else { get().addNotification('Search deleted.'); set(state => ({ searches: state.searches.filter(s => s.id !== id) })); }
        get().closeConfirmationModal();
    },
    updateJobStatus: async (jobId, newStatus) => {
        await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
        get().addNotification('Job status updated!');
        set(state => ({
            allJobs: state.allJobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job),
            newJobs: state.newJobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job),
        }));
    },
    updateJobDetails: async (jobId, updateData) => {
        const { error } = await supabase.from('jobs').update(updateData).eq('id', jobId);
        if (error) {
            get().addNotification('Error saving details.', 'error');
        } else {
            set(state => ({
                allJobs: state.allJobs.map(job => job.id === jobId ? { ...job, ...updateData } : job),
                newJobs: state.newJobs.map(job => job.id === jobId ? { ...job, ...updateData } : job),
                selectedJob: state.selectedJob?.id === jobId ? { ...state.selectedJob, ...updateData } : state.selectedJob,
            }));
            get().addNotification('Details saved!', 'success');
        }
    },
}));
