import React from 'react';
import { FileText, Star } from 'lucide-react';

function JobCard({ job, onClick }) {
    const ScoreBadge = ({ score, max, color, icon, label }) => (
        <div className={`flex items-center gap-2 text-sm font-semibold text-${color}-700`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${color}-100`}>{icon}</div>
            <div><span className="font-bold">{score}</span><span className="text-xs text-slate-500">/{max}</span><p className="text-xs font-medium text-slate-500">{label}</p></div>
        </div>
    );
    return (
        <div onClick={onClick} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-grow"><h2 className="font-bold text-lg text-slate-900">{job.title}</h2><p className="text-md text-slate-600">{job.company}</p><p className="text-xs text-slate-400 mt-2">Found: {new Date(job.created_at).toLocaleDateString()}</p></div>
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <ScoreBadge score={(job.similarity_score * 100).toFixed(0)} max={100} color="sky" icon={<FileText className="w-4 h-4 text-sky-600" />} label="Similarity" />
                    <ScoreBadge score={job.gemini_rating} max={10} color="amber" icon={<Star className="w-4 h-4 text-amber-600" />} label="Gemini Fit" />
                </div>
            </div>
            <p className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-md"><span className="font-semibold">AI Reason:</span> {job.ai_reason}</p>
        </div>
    );
}

export default function Dashboard({ jobs, setSelectedJob, loading, error }) {
    if (loading) return <div className="text-center p-12">Loading...</div>;
    if (error) return <div className="text-center p-12 text-red-600">{error}</div>;
    if (jobs.length === 0) return <div className="text-center p-12 text-slate-500">No jobs found.</div>;
    return <div className="grid grid-cols-1 gap-4">{jobs.map(job => <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />)}</div>;
}
