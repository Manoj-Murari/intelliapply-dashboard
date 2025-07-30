import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

function SearchForm({ search, onSave, onCancel }) {
    const [formData, setFormData] = useState(search);
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">{search.id ? 'Edit Search' : 'Create New Search'}</h2>
            <div className="mb-4"><label htmlFor="search_name" className="block text-sm font-medium text-slate-700 mb-1">Search Name</label><input type="text" id="search_name" name="search_name" value={formData.search_name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="e.g., Remote AI Jobs" required /></div>
            <div className="mb-4"><label htmlFor="search_term" className="block text-sm font-medium text-slate-700 mb-1">Search Term</label><input type="text" id="search_term" name="search_term" value={formData.search_term} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="e.g., AI Engineer" required /></div>
            <div className="mb-6"><label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">Country</label><input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="e.g., USA (or leave blank)" /></div>
            <div className="flex justify-end gap-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold">Cancel</button><button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold">Save Search</button></div>
        </form>
    );
}

export default function Searches({ searches, onSave, onDeleteRequest }) {
    const [editingSearch, setEditingSearch] = useState(null);
    if (editingSearch) return <SearchForm search={editingSearch} onSave={(s) => { onSave(s); setEditingSearch(null); }} onCancel={() => setEditingSearch(null)} />;
    return (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Your Custom Job Searches</h2><button onClick={() => setEditingSearch({ id: null, search_name: '', search_term: '', country: '' })} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-700 transition"><Plus className="w-5 h-5" /> New Search</button></div>
            <div className="grid grid-cols-1 gap-4">
                {searches.length === 0 && <p className="text-slate-500">You haven't created any searches yet.</p>}
                {searches.map(search => (
                    <div key={search.id} className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div><h3 className="font-bold text-lg">{search.search_name}</h3><p className="text-sm text-slate-600">Term: "{search.search_term}" | Country: {search.country || 'Any'}</p></div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingSearch(search)} className="p-2 hover:bg-slate-100 rounded-md text-slate-600"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => onDeleteRequest(search.id, 'search')} className="p-2 hover:bg-red-50 rounded-md text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}