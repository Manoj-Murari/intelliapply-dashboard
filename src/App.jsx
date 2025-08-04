import React, { useEffect } from 'react';
import { useStore } from './lib/store';

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
import Analytics from './components/features/Analytics.jsx'; // Ensure .jsx extension
import AICoverLetterModal from './components/features/AICoverLetterModal';
import AIInterviewPrepModal from './components/features/AIInterviewPrepModal';
import ApplicationHelperModal from './components/features/ApplicationHelperModal.jsx'; // Ensure .jsx extension


export default function App() {
    const {
        view, setView,
        allJobs, newJobs, profiles, searches,
        selectedJob, setSelectedJob,
        fetchAllData, subscribeToJobs, unsubscribeFromJobs,
        updateJobStatus,
        handleSaveProfile, handleDeleteProfile,
        handleSaveSearch, handleDeleteSearch,
        handleTriggerJobSearch,
        isSearching,
        isTailorModalOpen, openTailorModal, closeTailorModal,
        isCoverLetterModalOpen, openCoverLetterModal, closeCoverLetterModal,
        isInterviewPrepModalOpen, openInterviewPrepModal, closeInterviewPrepModal,
        isApplicationHelperOpen, openApplicationHelper, closeApplicationHelper,
        modalState, openConfirmationModal, closeConfirmationModal,
        notifications, removeNotification
    } = useStore();

    useEffect(() => {
        fetchAllData();
        subscribeToJobs();
        return () => {
            unsubscribeFromJobs();
        };
    }, [fetchAllData, subscribeToJobs, unsubscribeFromJobs]);

    const getActiveProfile = () => {
        if (!selectedJob || !searches.length || !profiles.length) {
            return profiles.length > 0 ? profiles[0] : null;
        }
        const searchForJob = searches.find(s => s.id === selectedJob.search_id);
        if (!searchForJob) return profiles.length > 0 ? profiles[0] : null;
        
        const profileForJob = profiles.find(p => p.id === searchForJob.profile_id);
        return profileForJob || (profiles.length > 0 ? profiles[0] : null);
    };

    const activeProfile = getActiveProfile();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header view={view} setView={setView} isSearching={isSearching} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                 {view === 'dashboard' && <Dashboard newJobs={newJobs} setSelectedJob={setSelectedJob} onTriggerJobSearch={handleTriggerJobSearch} isSearching={isSearching} />}
                 {view === 'allJobs' && <AllJobs jobs={allJobs} setSelectedJob={setSelectedJob} />}
                 {view === 'tracker' && <KanbanTracker jobs={allJobs} updateJobStatus={updateJobStatus} setSelectedJob={setSelectedJob} />}
                 
                 {/* --- FIX: Pass all required props to the Analytics component --- */}
                 {view === 'analytics' && <Analytics jobs={allJobs} profiles={profiles} searches={searches} />}
                 
                 {view === 'profiles' && <Profiles profiles={profiles} onSave={handleSaveProfile} onDeleteRequest={(id) => openConfirmationModal('Delete Profile', `This will also delete any jobs found using this profile's searches. Are you sure?`, () => handleDeleteProfile(id))} />}
                 {view === 'searches' && <Searches searches={searches} profiles={profiles} onSave={handleSaveSearch} onDeleteRequest={(id) => openConfirmationModal('Delete Search', `This will also delete any jobs found with this search. Are you sure?`, () => handleDeleteSearch(id))} />}
            </main>
            <JobDetailsPanel 
                job={selectedJob} 
                setSelectedJob={setSelectedJob} 
                onOpenTailorModal={openTailorModal}
                onOpenCoverLetterModal={openCoverLetterModal}
                onOpenApplicationHelper={openApplicationHelper}
            />
            <AITailoringModal isOpen={isTailorModalOpen} onClose={closeTailorModal} job={selectedJob} profile={activeProfile} />
            <AICoverLetterModal isOpen={isCoverLetterModalOpen} onClose={closeCoverLetterModal} job={selectedJob} profile={activeProfile} />
            <AIInterviewPrepModal isOpen={isInterviewPrepModalOpen} onClose={closeInterviewPrepModal} job={selectedJob} profile={activeProfile} />
            
            <ApplicationHelperModal 
                isOpen={isApplicationHelperOpen} 
                onClose={closeApplicationHelper} 
                profile={activeProfile}
                jobUrl={selectedJob?.job_url}
            />

            <ConfirmationModal isOpen={modalState.isOpen} onClose={closeConfirmationModal} onConfirm={modalState.onConfirm} title={modalState.title} message={modalState.message} />
            <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm-items-end">
                <div className="w-full flex flex-col items-center space-y-4 sm-items-end">
                    {notifications.map(notification => ( <Toast key={notification.id} notification={notification} onDismiss={removeNotification} /> ))}
                </div>
            </div>
        </div>
    );
}
