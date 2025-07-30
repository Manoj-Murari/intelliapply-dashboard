import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import KanbanTracker from './components/KanbanTracker';
import Profiles from './components/Profiles';
import Searches from './components/Searches';
import JobDetailsPanel from './components/JobDetailsPanel';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';

// --- SUPABASE SETUP ---
const SUPABASE_URL = 'https://clrmyzkwdkxqawxqnsnx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscm15emt3ZGt4cWF3eHFuc254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTUxMTksImV4cCI6MjA2OTM5MTExOX0.2b7pOp4N54TDA4L-KRx9vb0V-3FxoNNe0HmLetFrceo';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
    const [view, setView] = useState('dashboard');
    const [jobs, setJobs] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [searches, setSearches] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- NEW: State for Notifications and Modals ---
    const [notifications, setNotifications] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchJobs(), fetchProfiles(), fetchSearches()]);
            setLoading(false);
        };
        fetchAllData();
    }, []);

    // --- NOTIFICATION HELPERS ---
    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // --- MODAL HELPERS ---
    const closeModal = () => setModalState({ isOpen: false, onConfirm: null, title: '', message: '' });

    // --- DATA FETCHING ---
    const fetchJobs = async () => {
        const { data, error } = await supabaseClient.from('jobs').select('*').order('created_at', { ascending: false });
        if (error) { setError('Could not fetch jobs.'); console.error("Job fetch error:", error); }
        else { setJobs(data || []); }
    };

    const fetchProfiles = async () => {
        const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) { setError('Could not fetch profiles.'); console.error("Profile fetch error:", error); }
        else { setProfiles(data || []); }
    };
    
    const fetchSearches = async () => {
        const { data, error } = await supabaseClient.from('searches').select('*').order('created_at', { ascending: false });
        if (error) { setError('Could not fetch searches.'); console.error("Search fetch error:", error); }
        else { setSearches(data || []); }
    };

    // --- PROFILE HANDLERS ---
    const handleSaveProfile = async (profile) => {
        if (profile.id) {
            await supabaseClient.from('profiles').update({ profile_name: profile.profile_name, resume_context: profile.resume_context }).eq('id', profile.id);
        } else {
            await supabaseClient.from('profiles').insert([{ profile_name: profile.profile_name, resume_context: profile.resume_context }]);
        }
        addNotification(`Profile "${profile.profile_name}" saved successfully!`);
        fetchProfiles();
    };

    const handleDeleteProfileRequest = (id) => {
        const profileToDelete = profiles.find(p => p.id === id);
        if (!profileToDelete) return;
        setModalState({
            isOpen: true,
            onConfirm: () => confirmDeleteProfile(id),
            title: 'Delete Profile',
            message: `Are you sure you want to delete the profile "${profileToDelete.profile_name}"? This action cannot be undone.`
        });
    };

    const confirmDeleteProfile = async (id) => {
        await supabaseClient.from('profiles').delete().eq('id', id);
        addNotification('Profile deleted successfully.');
        fetchProfiles();
        closeModal();
    };

    // --- SEARCH HANDLERS ---
    const handleSaveSearch = async (search) => {
        if (search.id) {
            await supabaseClient.from('searches').update({ search_name: search.search_name, search_term: search.search_term, country: search.country }).eq('id', search.id);
        } else {
            await supabaseClient.from('searches').insert([{ search_name: search.search_name, search_term: search.search_term, country: search.country }]);
        }
        addNotification(`Search "${search.search_name}" saved successfully!`);
        fetchSearches();
    };

    const handleDeleteSearchRequest = (id) => {
        const searchToDelete = searches.find(s => s.id === id);
        if (!searchToDelete) return;
        setModalState({
            isOpen: true,
            onConfirm: () => confirmDeleteSearch(id),
            title: 'Delete Search',
            message: `Are you sure you want to delete the search "${searchToDelete.search_name}"? This action cannot be undone.`
        });
    };
    
    const confirmDeleteSearch = async (id) => {
        await supabaseClient.from('searches').delete().eq('id', id);
        addNotification('Search deleted successfully.');
        fetchSearches();
        closeModal();
    };

    // --- JOB HANDLERS ---
    const updateJobStatus = async (jobId, newStatus) => {
        setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
        const { error } = await supabaseClient.from('jobs').update({ status: newStatus }).eq('id', jobId);
        if (error) { 
            console.error("Error updating job status:", error); 
            addNotification('Error updating job status.', 'error');
            fetchJobs(); // Re-fetch to revert optimistic update
        } else {
            addNotification('Job status updated!');
        }
    };

    const getActiveProfile = () => profiles.length > 0 ? profiles[0] : null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header view={view} setView={setView} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {view === 'dashboard' && <Dashboard jobs={jobs} setSelectedJob={setSelectedJob} loading={loading} error={error} />}
                {view === 'tracker' && <KanbanTracker jobs={jobs} updateJobStatus={updateJobStatus} setSelectedJob={setSelectedJob} />}
                {view === 'profiles' && <Profiles profiles={profiles} onSave={handleSaveProfile} onDeleteRequest={handleDeleteProfileRequest} />}
                {view === 'searches' && <Searches searches={searches} onSave={handleSaveSearch} onDeleteRequest={handleDeleteSearchRequest} />}
            </main>
            <JobDetailsPanel job={selectedJob} setSelectedJob={setSelectedJob} activeProfile={getActiveProfile()} />
            
            {/* --- RENDER MODAL AND TOASTS --- */}
            <ConfirmationModal 
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />

            {/* Toast Container */}
            <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
                <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    {notifications.map(notification => (
                        <Toast key={notification.id} notification={notification} onDismiss={removeNotification} />
                    ))}
                </div>
            </div>
        </div>
    );
}
