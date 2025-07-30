import React from 'react';
import { Briefcase, LayoutDashboard, User, Search as SearchIcon, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

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

export default function Header({ view, setView, user }) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

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
                            <NavLink view={view} setView={setView} currentView={view} viewName="tracker"><Briefcase className="w-4 h-4" />Tracker</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="profiles"><User className="w-4 h-4" />Profiles</NavLink>
                            <NavLink view={view} setView={setView} currentView={view} viewName="searches"><SearchIcon className="w-4 h-4" />Searches</NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-sm text-right">
                            <p className="font-medium text-slate-700">Signed in as</p>
                            <p className="text-slate-500 truncate">{user.email}</p>
                        </div>
                        <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
