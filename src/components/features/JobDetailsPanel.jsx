import React from 'react';
import { X, Briefcase, Building, Sparkles, ExternalLink } from 'lucide-react';

export default function JobDetailsPanel({ job, setSelectedJob, activeProfile, onOpenTailorModal }) {
    if (!job) return null;

    return (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedJob(null)}>
            <div 
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Panel Header */}
                <div className="flex items-start justify-between p-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
                        <p className="text-sm text-slate-500">
                            <Building className="w-4 h-4 inline-block mr-1" /> {job.company}
                        </p>
                    </div>
                    <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-slate-100">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Panel Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="prose prose-slate max-w-none">
                        <h3>Job Description</h3>
                        <p>{job.description}</p>
                    </div>
                </div>

                {/* Panel Footer with AI and Apply Buttons */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4">
                    <div className="text-sm">
                        <p className="font-semibold">AI Analysis</p>
                        <div className="flex gap-2 mt-1">
                            <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                                Similarity: {(job.similarity_score * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                AI Rating: {job.gemini_rating}/10
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onOpenTailorModal}
                            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-all"
                        >
                            <Sparkles className="w-5 h-5" />
                            Tailor with AI
                        </button>
                        
                        {/* --- NEW: APPLY NOW BUTTON --- */}
                        <a
                            href={job.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 transition-all"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Apply Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
