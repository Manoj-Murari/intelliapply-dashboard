import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/pages/Auth';

// --- COMPONENT IMPORTS ---
import Header from './components/layout/Header';
import Dashboard from './components/features/Dashboard';
import KanbanTracker from './components/features/KanbanTracker';
import Profiles from './components/features/Profiles';
import Searches from './components/features/Searches';
import JobDetailsPanel from './components/features/JobDetailsPanel';
import ConfirmationModal from './components/ui/ConfirmationModal';
import Toast from './components/ui/Toast';
import AITailoringModal from './components/features/AITailoringModal';

export default function App() {
    const [session, setSession] = useState(null);
    const [view, setView] = useState('dashboard');
    const [jobs, setJobs] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [searches, setSearches] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
    const [isSearching, setIsSearching] = useState(false);
    const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

    useEffect(() => {
        // --- 1. AUTHENTICATION LISTENER ---
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false); 
        });

        const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchAllData(session.user.id);
            } else {
                setJobs([]);
                setProfiles([]);
                setSearches([]);
            }
        });

        // --- 2. REALTIME SUBSCRIPTION FOR NEW JOBS ---
        const jobsChannel = supabase
            .channel('public:jobs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'jobs' },
                (payload) => {
                    console.log('New job received!', payload.new);
                    // --- FIX: Turn off the loader when the first job arrives ---
                    setIsSearching(false);
                    
                    setJobs((currentJobs) => [payload.new, ...currentJobs]);
                    addNotification(`New job found: ${payload.new.title}`, 'info');
                }
            )
            .subscribe();

        // --- 3. CLEANUP ---
        return () => {
            authListener?.unsubscribe();
            supabase.removeChannel(jobsChannel);
        };
    }, []);

    // --- HELPER FUNCTIONS ---
    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
    };
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    const closeModal = () => {
        setModalState({ isOpen: false, onConfirm: null, title: '', message: '' });
    };

    // --- DATA FETCHING ---
    const fetchAllData = async (userId) => {
        if (!userId) return;
        setLoading(true);
        await Promise.all([fetchJobs(userId), fetchProfiles(userId), fetchSearches(userId)]);
        setLoading(false);
    };

    const fetchJobs = async (userId) => {
        const { data, error } = await supabase.from('jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) { setError('Could not fetch jobs.'); console.error(error); } 
        else { setJobs(data || []); }
    };

    const fetchProfiles = async (userId) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) { setError('Could not fetch profiles.'); console.error(error); } 
        else { setProfiles(data || []); }
    };

    const fetchSearches = async (userId) => {
        const { data, error } = await supabase.from('searches').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) { setError('Could not fetch searches.'); console.error(error); } 
        else { setSearches(data || []); }
    };

    // --- ON-DEMAND SEARCH TRIGGER (REMOVED TIMEOUT) ---
    const handleTriggerJobSearch = async () => {
        if (isSearching) return;
        setIsSearching(true);
        try {
            const { data, error } = await supabase.functions.invoke('trigger-job-search');
            if (error) throw error;
            addNotification(data.message, 'success');
        } catch (error) {
            addNotification('Error: Could not trigger the job search.', 'error');
            // Turn off loader if the trigger itself fails
            setIsSearching(false);
        }
        // The 'finally' block with the timeout is now removed.
    };

    // --- CRUD HANDLERS ---
    const handleSaveProfile = async (profile) => {
        const userId = session.user.id;
        const profileData = { profile_name: profile.profile_name, resume_context: profile.resume_context, user_id: userId };
        if (profile.id) {
            const { error } = await supabase.from('profiles').update(profileData).eq('id', profile.id).eq('user_id', userId);
            if (error) addNotification('Error updating profile.', 'error'); else addNotification(`Profile updated successfully!`);
        } else {
            const { error } = await supabase.from('profiles').insert([profileData]);
            if (error) addNotification('Error creating profile.', 'error'); else addNotification(`Profile created successfully!`);
        }
        fetchProfiles(userId);
    };

    const handleDeleteProfileRequest = (id) => {
        const profileToDelete = profiles.find(p => p.id === id);
        if (!profileToDelete) return;
        setModalState({ isOpen: true, onConfirm: () => confirmDeleteProfile(id), title: 'Delete Profile', message: `Are you sure you want to delete the profile "${profileToDelete.profile_name}"?` });
    };

    const confirmDeleteProfile = async (id) => {
        const userId = session.user.id;
        const { error } = await supabase.from('profiles').delete().eq('id', id).eq('user_id', userId);
        if (error) addNotification('Error deleting profile.', 'error'); else addNotification('Profile deleted successfully.');
        fetchProfiles(userId);
        closeModal();
    };

    const handleSaveSearch = async (search) => {
        const userId = session.user.id;
        const searchData = { search_name: search.search_name, search_term: search.search_term, country: search.country, user_id: userId };
        if (search.id) {
            const { error } = await supabase.from('searches').update(searchData).eq('id', search.id).eq('user_id', userId);
            if (error) addNotification('Error updating search.', 'error'); else addNotification(`Search updated successfully!`);
        } else {
            const { error } = await supabase.from('searches').insert([searchData]);
            if (error) addNotification('Error creating search.', 'error'); else addNotification(`Search created successfully!`);
        }
        fetchSearches(userId);
    };

    const handleDeleteSearchRequest = (id) => {
        const searchToDelete = searches.find(s => s.id === id);
        if (!searchToDelete) return;
        setModalState({ isOpen: true, onConfirm: () => confirmDeleteSearch(id), title: 'Delete Search', message: `Are you sure you want to delete the search "${searchToDelete.search_name}"?` });
    };

    const confirmDeleteSearch = async (id) => {
        const userId = session.user.id;
        const { error } = await supabase.from('searches').delete().eq('id', id).eq('user_id', userId);
        if (error) addNotification('Error deleting search.', 'error'); else addNotification('Search deleted successfully.');
        fetchSearches(userId);
        closeModal();
    };

    const updateJobStatus = async (jobId, newStatus) => {
        const userId = session.user.id;
        const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId).eq('user_id', userId);
        if (error) {
            addNotification('Error updating job status.', 'error');
        } else {
            addNotification('Job status updated!');
            setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
        }
    };

    if (loading && !session) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    }

    if (!session) {
        return <Auth />;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header view={view} setView={setView} user={session.user} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {loading ? <div className="text-center p-8">Loading your data...</div> :
                    <>
                        {view === 'dashboard' && <Dashboard jobs={jobs} setSelectedJob={setSelectedJob} loading={loading} error={error} onTriggerJobSearch={handleTriggerJobSearch} isSearching={isSearching} />}
                        {view === 'tracker' && <KanbanTracker jobs={jobs} updateJobStatus={updateJobStatus} setSelectedJob={setSelectedJob} />}
                        {view === 'profiles' && <Profiles profiles={profiles} onSave={handleSaveProfile} onDeleteRequest={handleDeleteProfileRequest} />}
                        {view === 'searches' && <Searches searches={searches} onSave={handleSaveSearch} onDeleteRequest={handleDeleteSearchRequest} />}
                    </>
                }
            </main>

            <JobDetailsPanel 
                job={selectedJob} 
                setSelectedJob={setSelectedJob} 
                activeProfile={profiles.length > 0 ? profiles[0] : null}
                onOpenTailorModal={() => setIsTailorModalOpen(true)}
            />

            <AITailoringModal 
                isOpen={isTailorModalOpen}
                onClose={() => setIsTailorModalOpen(false)}
                job={selectedJob}
                profile={profiles.length > 0 ? profiles[0] : null}
            />
            
            <ConfirmationModal isOpen={modalState.isOpen} onClose={closeModal} onConfirm={modalState.onConfirm} title={modalState.title} message={modalState.message} />
            
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
