import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

function ProfileForm({ profile, onSave, onCancel }) {
    const [formData, setFormData] = useState(profile);
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">{profile.id ? 'Edit Profile' : 'Create New Profile'}</h2>
            <div className="mb-4">
                <label htmlFor="profile_name" className="block text-sm font-medium text-slate-700 mb-1">Profile Name</label>
                <input type="text" id="profile_name" name="profile_name" value={formData.profile_name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 transition" placeholder="e.g., Senior Frontend Developer" required />
            </div>
            <div className="mb-6">
                <label htmlFor="resume_context" className="block text-sm font-medium text-slate-700 mb-1">Resume Context</label>
                <textarea id="resume_context" name="resume_context" value={formData.resume_context} onChange={handleChange} rows="15" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500 transition" placeholder="Paste your detailed resume, including skills, experience, and projects..." required></textarea>
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold hover:bg-slate-300 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition">Save Profile</button>
            </div>
        </form>
    );
}

export default function Profiles({ profiles, onSave, onDeleteRequest }) {
    const [editingProfile, setEditingProfile] = useState(null);
    if (editingProfile) return <ProfileForm profile={editingProfile} onSave={(p) => { onSave(p); setEditingProfile(null); }} onCancel={() => setEditingProfile(null)} />;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Your Resume Profiles</h2>
                <button onClick={() => setEditingProfile({ id: null, profile_name: '', resume_context: '' })} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-700 transition">
                    <Plus className="w-5 h-5" /> New Profile
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {profiles.length === 0 && (
                    <div className="text-center py-12 bg-white border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-medium text-slate-800">No Profiles Found</h3>
                        <p className="text-slate-500 mt-1">Get started by creating your first resume profile.</p>
                    </div>
                )}
                {profiles.map(profile => (
                    <div key={profile.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm transition hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-slate-800">{profile.profile_name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingProfile(profile)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition">
                                    <Edit className="w-4 h-4" />
                                </button>
                                {/* This now calls onDeleteRequest to trigger the modal */}
                                <button onClick={() => onDeleteRequest(profile.id)} className="p-2 hover:bg-red-50 rounded-md text-red-600 transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{profile.resume_context}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
