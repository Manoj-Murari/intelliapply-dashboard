import React from 'react';
import { Briefcase, LayoutDashboard, User, Search as SearchIcon, BarChart3, Archive, Loader2 } from 'lucide-react';

function NavLink({ view, setView, currentView, viewName, children }) {
    const isActive = currentView === viewName;
    return (
        <button
            onClick={() => setView(viewName)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {children}
        </button>
    );
}

// --- UPDATED: Header now accepts isSearching prop ---
export default function Header({ view, setView, isSearching }) {
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-7 h-7 text-sky-600" />
                            <h1 className="text-xl font-bold text-slate-800">IntelliApply</h1>
                        </div>
                        <nav className="hidden md:flex items-center gap-2">
                            <NavLink view={view} setView={setView} currentView={view} viewName="dashboard"><LayoutDashboard className="w-4 h-4" />Dashboard</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="allJobs"><Archive className="w-4 h-4" />Job Library</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="tracker"><Briefcase className="w-4 h-4" />Tracker</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="analytics"><BarChart3 className="w-4 h-4" />Analytics</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="profiles"><User className="w-4 h-4" />Profiles</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="searches"><SearchIcon className="w-4 h-4" />Searches</NavLink>
                        </nav>
                    </div>

                    {/* --- NEW: Global Searching Indicator --- */}
                    <div className="flex items-center">
                        {isSearching && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 mr-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Searching...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
