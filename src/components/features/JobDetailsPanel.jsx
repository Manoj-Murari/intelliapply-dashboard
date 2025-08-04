import React, { useState, useEffect, useCallback } from 'react';
import { X, Building, Sparkles, ExternalLink, FileText, Users, Plus, Trash2, Briefcase, CheckSquare } from 'lucide-react';
import { useStore } from '../../lib/store';
import { debounce } from 'lodash';

const useDebounce = (callback, delay) => {
    const debouncedFn = useCallback(debounce((...args) => callback(...args), delay), [delay]);
    
    useEffect(() => {
        return () => {
            debouncedFn.cancel();
        };
    }, [debouncedFn]);

    return debouncedFn;
};

// Error Boundary to prevent crashes
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("Error Boundary caught:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center">
                    <p className="text-red-500 font-semibold">Something went wrong in this panel.</p>
                    <button onClick={() => this.setState({ hasError: false })} className="mt-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-md">
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function JobDetailsPanelContent({ job, setSelectedJob, onOpenTailorModal, onOpenCoverLetterModal, onOpenApplicationHelper }) {
    const [activeTab, setActiveTab] = useState('description');
    const [notes, setNotes] = useState('');
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({ name: '', title: '', contact_info: '' });

    const updateJobDetails = useStore(state => state.updateJobDetails);
    const addNotification = useStore(state => state.addNotification);

    const debouncedSaveNotes = useDebounce((jobId, newNotes) => {
        if (jobId) updateJobDetails(jobId, { notes: newNotes });
    }, 1000);

    useEffect(() => {
        if (job) {
            setNotes(job.notes || '');
            setContacts(job.contacts || []);
            setActiveTab('description');
        }
    }, [job?.id]);

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        if (job?.id) debouncedSaveNotes(job.id, e.target.value);
    };

    const handleAddContact = () => {
        if (!newContact.name || !newContact.contact_info || !job?.id) return;
        const newContacts = [...(contacts || []), newContact];
        setContacts(newContacts);
        updateJobDetails(job.id, { contacts: newContacts });
        setNewContact({ name: '', title: '', contact_info: '' });
    };

    const handleDeleteContact = (index) => {
        if (!job?.id) return;
        const newContacts = contacts.filter((_, i) => i !== index);
        setContacts(newContacts);
        updateJobDetails(job.id, { contacts: newContacts });
    };
    
    const handleAddToTracker = () => {
        if (!job?.id) return;
        updateJobDetails(job.id, { is_tracked: true, status: 'Applied' });
        addNotification(`'${job.title}' added to your tracker!`, 'success');
    };

    if (!job) return null;

    const TabButton = ({ tabName, icon, label }) => {
        const Icon = icon;
        return (
            <button onClick={() => setActiveTab(tabName)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tabName ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedJob(null)}>
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between p-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5"><Building className="w-4 h-4" /> {job.company}</p>
                    </div>
                    <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
                </div>
                <div className="p-2 border-b border-slate-200 flex items-center gap-2">
                    <TabButton tabName="description" icon={Briefcase} label="Description" />
                    <TabButton tabName="notes" icon={FileText} label="Notes" />
                    <TabButton tabName="contacts" icon={Users} label="Contacts" />
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {activeTab === 'description' && ( <div className="prose prose-slate max-w-none"><p>{job.description}</p></div> )}
                    {activeTab === 'notes' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">My Notes</h3>
                            <textarea value={notes} onChange={handleNotesChange} placeholder="Add your notes here... (auto-saves)"
                                className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500" />
                        </div>
                    )}
                    {activeTab === 'contacts' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Key Contacts</h3>
                            <div className="space-y-3 mb-6">
                                {contacts && contacts.length > 0 ? contacts.map((contact, index) => (
                                    <div key={index} className="bg-slate-50 p-3 rounded-md border flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{contact.name}</p>
                                            <p className="text-sm text-slate-600">{contact.title}</p>
                                            <p className="text-xs text-slate-500">{contact.contact_info}</p>
                                        </div>
                                        <button onClick={() => handleDeleteContact(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )) : <p className="text-slate-500 text-center py-4">No contacts added yet.</p>}
                            </div>
                            <div className="bg-slate-100 p-4 rounded-lg border">
                                <h4 className="font-semibold mb-2">Add New Contact</h4>
                                <div className="space-y-2">
                                    <input type="text" placeholder="Name (e.g., Priya Kumar)" value={newContact.name} onChange={(e) => setNewContact({...newContact, name: e.target.value})} className="w-full p-2 border rounded-md" />
                                    <input type="text" placeholder="Title (e.g., Recruiter)" value={newContact.title} onChange={(e) => setNewContact({...newContact, title: e.target.value})} className="w-full p-2 border rounded-md" />
                                    <input type="text" placeholder="Email or LinkedIn" value={newContact.contact_info} onChange={(e) => setNewContact({...newContact, contact_info: e.target.value})} className="w-full p-2 border rounded-md" />
                                    <button onClick={handleAddContact} className="w-full bg-slate-800 text-white p-2 rounded-md font-semibold hover:bg-slate-700">Add Contact</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4">
                       <div className="flex items-center gap-2">
                            {job.is_tracked ? (
                                 <span className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-emerald-700 bg-emerald-100 rounded-md">
                                     <CheckSquare className="w-5 h-5" /> Tracked
                                </span>
                            ) : (
                                <button onClick={handleAddToTracker} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-all">
                                    <Plus className="w-5 h-5" /> Add to Tracker
                                </button>
                            )}
                            <button onClick={onOpenTailorModal} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-all"><Sparkles className="w-5 h-5" />Tailor Resume</button>
                            <button onClick={onOpenCoverLetterModal} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-all"><FileText className="w-5 h-5" />Generate Cover Letter</button>
                        </div>
                    {/* --- This is the critical change --- */}
                    <button 
                        onClick={onOpenApplicationHelper} 
                        className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 transition-all"
                    >
                        <ExternalLink className="w-5 h-5" />Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main component wrapped in an Error Boundary
export default function JobDetailsPanel(props) {
    return (
        <ErrorBoundary>
            <JobDetailsPanelContent {...props} />
        </ErrorBoundary>
    )
}
