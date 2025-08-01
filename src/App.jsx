import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

// --- COMPONENT IMPORTS ---
import Header from './components/layout/Header';
import Dashboard from './components/features/Dashboard';
import AllJobs from './components/features/AllJobs';
import KanbanTracker from './components/features/KanbanTracker';
import Profiles from './components/features/Profiles';
import Searches from './components/features/Searches';
import JobDetailsPanel from './components/features/JobDetailsPanel';
import ConfirmationModal from './components/ui/ConfirmationModal';
import Toast from './components/ui/Toast';
import AITailoringModal from './components/features/AITailoringModal';
import Analytics from './components/features/Analytics';

export default function App() {
    const [view, setView] = useState('dashboard');
    const [allJobs, setAllJobs] = useState([]);
    const [newJobs, setNewJobs] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [searches, setSearches] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
    const [isSearching, setIsSearching] = useState(false);
    const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
    const channelRef = useRef(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (channelRef.current) return;
        const channel = supabase.channel('public:jobs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
            setAllJobs((current) => [payload.new, ...current]);
            setNewJobs((current) => [payload.new, ...current]);
            addNotification(`New job found: ${payload.new.title}`, 'info');
        }).subscribe();
        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); channelRef.current = null; };
    }, []);

    const addNotification = (message, type = 'success') => { const id = Date.now(); setNotifications(prev => [...prev, { id, message, type }]); };
    const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
    const closeModal = () => setModalState({ isOpen: false, onConfirm: null, title: '', message: '' });

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([fetchJobs(), fetchProfiles(), fetchSearches()]);
        setLoading(false);
    };

    const fetchJobs = async () => { const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }); setAllJobs(data || []); };
    const fetchProfiles = async () => { const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); setProfiles(data || []); };
    const fetchSearches = async () => { const { data } = await supabase.from('searches').select('*').order('created_at', { ascending: false }); setSearches(data || []); };

    const handleTriggerJobSearch = async () => {
        if (isSearching) { addNotification('A job search is already in progress.', 'info'); return; }
        setNewJobs([]);
        setIsSearching(true);
        try {
            const response = await fetch('http://localhost:5001/run-search', { method: 'POST' });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || 'Failed to trigger search.'); }
            addNotification(data.message, 'success');
            setTimeout(() => { 
                if (newJobs.length === 0) {
                    setIsSearching(false);
                    addNotification("Job search complete. No new jobs found this time.", "info");
                }
            }, 180000);
        } catch (error) {
            addNotification(`Error: ${error.message}`, 'error');
            setIsSearching(false);
        }
    };

    // --- FIX: FULLY IMPLEMENTED CRUD HANDLERS ---
    const handleSaveProfile = async (profile) => {
        const profileData = { profile_name: profile.profile_name, resume_context: profile.resume_context };
        if (profile.id) {
            await supabase.from('profiles').update(profileData).eq('id', profile.id);
        } else {
            await supabase.from('profiles').insert([profileData]);
        }
        addNotification(`Profile saved!`);
        fetchProfiles();
    };

    const confirmDeleteProfile = async (id) => {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) { addNotification('Error deleting profile.', 'error'); } 
        else { addNotification('Profile deleted.'); setProfiles(currentProfiles => currentProfiles.filter(p => p.id !== id)); }
        closeModal();
    };

    const handleSaveSearch = async (search) => {
        const searchData = { 
            search_name: search.search_name, 
            search_term: search.search_term, 
            country: search.country,
            profile_id: search.profile_id,
            experience_level: search.experience_level,
            hours_old: search.hours_old
        };
        if (search.id) {
            await supabase.from('searches').update(searchData).eq('id', search.id);
        } else {
            await supabase.from('searches').insert([searchData]);
        }
        addNotification(`Search saved!`);
        fetchSearches();
    };

    const confirmDeleteSearch = async (id) => {
        const { error } = await supabase.from('searches').delete().eq('id', id);
        if (error) { addNotification('Error deleting search.', 'error'); } 
        else { addNotification('Search deleted.'); setSearches(currentSearches => currentSearches.filter(s => s.id !== id)); }
        closeModal();
    };
    
    const handleDeleteProfileRequest = (id) => {
        const profileToDelete = profiles.find(p => p.id === id);
        setModalState({ isOpen: true, onConfirm: () => confirmDeleteProfile(id), title: 'Delete Profile', message: `Delete "${profileToDelete.profile_name}"?` });
    };

    const handleDeleteSearchRequest = (id) => {
        const searchToDelete = searches.find(s => s.id === id);
        setModalState({ isOpen: true, onConfirm: () => confirmDeleteSearch(id), title: 'Delete Search', message: `Delete "${searchToDelete.search_name}"?` });
    };

    const updateJobStatus = async (jobId, newStatus) => { 
        await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId); 
        addNotification('Job status updated!'); 
        setAllJobs(allJobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
        setNewJobs(newJobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header view={view} setView={setView} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                 {view === 'dashboard' && <Dashboard newJobs={newJobs} setSelectedJob={setSelectedJob} onTriggerJobSearch={handleTriggerJobSearch} isSearching={isSearching} />}
                 {view === 'allJobs' && <AllJobs jobs={allJobs} setSelectedJob={setSelectedJob} />}
                 {view === 'tracker' && <KanbanTracker jobs={allJobs} updateJobStatus={updateJobStatus} setSelectedJob={setSelectedJob} />}
                 {view === 'analytics' && <Analytics jobs={allJobs} />}
                 {view === 'profiles' && <Profiles profiles={profiles} onSave={handleSaveProfile} onDeleteRequest={handleDeleteProfileRequest} />}
                 {view === 'searches' && <Searches searches={searches} profiles={profiles} onSave={handleSaveSearch} onDeleteRequest={handleDeleteSearchRequest} />}
            </main>
            <JobDetailsPanel job={selectedJob} setSelectedJob={setSelectedJob} activeProfile={profiles.length > 0 ? profiles[0] : null} onOpenTailorModal={() => setIsTailorModalOpen(true)} />
            <AITailoringModal isOpen={isTailorModalOpen} onClose={() => setIsTailorModalOpen(false)} job={selectedJob} profile={profiles.length > 0 ? profiles[0] : null} />
            <ConfirmationModal isOpen={modalState.isOpen} onClose={closeModal} onConfirm={modalState.onConfirm} title={modalState.title} message={modalState.message} />
            <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm-items-end">
                <div className="w-full flex flex-col items-center space-y-4 sm-items-end">
                    {notifications.map(notification => ( <Toast key={notification.id} notification={notification} onDismiss={removeNotification} /> ))}
                </div>
            </div>
        </div>
    );
}
