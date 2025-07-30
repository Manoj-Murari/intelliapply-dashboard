import React from 'react';
import { Zap, Briefcase, Kanban, User, Search } from 'lucide-react';

export default function Header({ view, setView }) {
    const NavButton = ({ targetView, icon, children }) => (
        <button onClick={() => setView(targetView)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${ view === targetView ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100' }`}>
            {icon} {children}
        </button>
    );
    return (
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2"><Zap className="w-7 h-7 text-sky-600" /><h1 className="text-xl font-bold text-slate-800">Intelli-Apply</h1></div>
                    <nav className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-lg">
                        <NavButton targetView="dashboard" icon={<Briefcase className="w-4 h-4" />}>Dashboard</NavButton>
                        <NavButton targetView="tracker" icon={<Kanban className="w-4 h-4" />}>Tracker</NavButton>
                        <NavButton targetView="profiles" icon={<User className="w-4 h-4" />}>Profiles</NavButton>
                        <NavButton targetView="searches" icon={<Search className="w-4 h-4" />}>Searches</NavButton>
                    </nav>
                </div>
            </div>
        </header>
    );
}