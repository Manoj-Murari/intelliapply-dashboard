import React, { useState } from 'react';
import { Plus, Edit, Trash2, Link2, BarChartHorizontal, Clock } from 'lucide-react';

function SearchForm({ search, profiles, onSave, onCancel }) {
    const [formData, setFormData] = useState({ 
        ...search, 
        profile_id: search.profile_id || '',
        experience_level: search.experience_level || 'entry_level',
        hours_old: search.hours_old || 24 // Default to 24 hours
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'hours_old' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData, profile_id: formData.profile_id || null };
        onSave(dataToSave);
    };

    const experienceLevels = [
        { value: 'entry_level', label: 'Entry Level' },
        { value: 'mid_level', label: 'Mid Level' },
        { value: 'senior_level', label: 'Senior Level' },
        { value: 'executive', label: 'Executive' },
    ];
    
    const datePostedOptions = [
        { value: 24, label: 'Last 24 hours' },
        { value: 72, label: 'Last 3 days' },
        { value: 168, label: 'Last 7 days' },
        { value: 720, label: 'Last 30 days' },
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-6">{search.id ? 'Edit Search' : 'Create New Search'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="search_name" className="block text-sm font-medium text-slate-700 mb-1">Search Name</label>
                    <input type="text" id="search_name" name="search_name" value={formData.search_name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="e.g., Remote AI Jobs" required />
                </div>
                <div>
                    <label htmlFor="search_term" className="block text-sm font-medium text-slate-700 mb-1">Search Term</label>
                    <input type="text" id="search_term" name="search_term" value={formData.search_term} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="e.g., AI Engineer" required />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="e.g., USA (or leave blank)" />
                </div>
                <div>
                    <label htmlFor="experience_level" className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                    <select id="experience_level" name="experience_level" value={formData.experience_level} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                        {experienceLevels.map(level => ( <option key={level.value} value={level.value}>{level.label}</option> ))}
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="hours_old" className="block text-sm font-medium text-slate-700 mb-1">Date Posted</label>
                <select id="hours_old" name="hours_old" value={formData.hours_old} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                    {datePostedOptions.map(option => ( <option key={option.value} value={option.value}>{option.label}</option> ))}
                </select>
            </div>

            <div className="mb-6">
                <label htmlFor="profile_id" className="block text-sm font-medium text-slate-700 mb-1">Link to Profile (for AI Analysis)</label>
                <select id="profile_id" name="profile_id" value={formData.profile_id} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                    <option value="">-- No Profile Linked --</option>
                    {profiles.map(profile => ( <option key={profile.id} value={profile.id}>{profile.profile_name}</option> ))}
                </select>
            </div>
            
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold">Save Search</button>
            </div>
        </form>
    );
}

export default function Searches({ searches, profiles, onSave, onDeleteRequest }) {
    const [editingSearch, setEditingSearch] = useState(null);

    const profileMap = new Map(profiles.map(p => [p.id, p.profile_name]));
    const experienceLevelLabels = { 'entry_level': 'Entry Level', 'mid_level': 'Mid Level', 'senior_level': 'Senior Level', 'executive': 'Executive' };
    const datePostedLabels = { 24: 'Last 24h', 72: 'Last 3d', 168: 'Last 7d', 720: 'Last 30d' };

    if (editingSearch) {
        return <SearchForm search={editingSearch} profiles={profiles} onSave={(s) => { onSave(s); setEditingSearch(null); }} onCancel={() => setEditingSearch(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Custom Job Searches</h2>
                <button onClick={() => setEditingSearch({ id: null, search_name: '', search_term: '', country: '', profile_id: '', experience_level: 'entry_level', hours_old: 24 })} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-700 transition">
                    <Plus className="w-5 h-5" /> New Search
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {searches.length === 0 && <p className="text-slate-500">You haven't created any searches yet.</p>}
                {searches.map(search => (
                    <div key={search.id} className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{search.search_name}</h3>
                                <p className="text-sm text-slate-600">Term: "{search.search_term}" | Country: {search.country || 'Any'}</p>
                                <div className="flex items-center flex-wrap gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-xs text-sky-700 font-semibold bg-sky-100 px-2 py-1 rounded-full w-fit">
                                        <Link2 className="w-3 h-3" />
                                        <span>Profile: {profileMap.get(search.profile_id) || 'None'}</span>
                                    </div>
                                     <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold bg-purple-100 px-2 py-1 rounded-full w-fit">
                                        <BarChartHorizontal className="w-3 h-3" />
                                        <span>Exp: {experienceLevelLabels[search.experience_level] || 'Any'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-1 rounded-full w-fit">
                                        <Clock className="w-3 h-3" />
                                        <span>Posted: {datePostedLabels[search.hours_old] || 'Any'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingSearch(search)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => onDeleteRequest(search.id)} className="p-2 hover:bg-red-50 rounded-md text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
