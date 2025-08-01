import React from 'react';
import { Search, Loader2, Inbox } from 'lucide-react';

// --- Note: AnimeLoader is no longer imported ---

function JobCard({ job, setSelectedJob }) {
    return (
        <div 
            onClick={() => setSelectedJob(job)}
            className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md hover:border-sky-500 cursor-pointer transition-all animate-fade-in"
        >
            <h3 className="font-bold text-lg text-slate-800 truncate">{job.title}</h3>
            <p className="text-sm text-slate-600">{job.company}</p>
            <div className="mt-4 flex gap-2">
                <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                    Similarity: {job.similarity_score ? (job.similarity_score * 100).toFixed(0) + '%' : 'N/A'}
                </span>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                    AI Rating: {job.gemini_rating ? `${job.gemini_rating}/10` : 'N/A'}
                </span>
            </div>
        </div>
    );
}

// --- NEW: Skeleton Grid Component for loading ---
function SkeletonGrid() {
    // We'll show 6 skeleton cards to fill the space
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="animate-pulse flex flex-col space-y-3">
                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="flex gap-2 pt-2">
                            <div className="h-5 bg-slate-200 rounded-full w-24"></div>
                            <div className="h-5 bg-slate-200 rounded-full w-24"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard({ newJobs, setSelectedJob, onTriggerJobSearch, isSearching }) {
    return (
        <div className="space-y-8">
            {/* Section 1: Find New Jobs */}
            <section>
                <div className="bg-white/50 border border-slate-200 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Find New Jobs</h2>
                            <p className="text-slate-500 mt-1">Run your saved searches to find new job postings.</p>
                        </div>
                        <button
                            onClick={onTriggerJobSearch}
                            disabled={isSearching}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-all disabled:bg-sky-300 disabled:cursor-not-allowed w-40"
                        >
                            {isSearching ? ( <><Loader2 className="w-4 h-4 animate-spin" /><span>Searching...</span></> ) 
                                         : ( <><Search className="w-4 h-4" /><span>Find Jobs Now</span></> )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Section 2: New Jobs Inbox */}
            <section>
                <h2 className="text-2xl font-bold mb-4">New Jobs Found (Inbox)</h2>
                <div className="bg-white/50 border border-slate-200 rounded-lg p-4 min-h-[300px]">
                    {isSearching ? (
                        // --- FIX: Use the SkeletonGrid component here ---
                        <SkeletonGrid />
                    ) : newJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-10">
                            <Inbox className="w-16 h-16 mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold">Your inbox is empty</h3>
                            <p>New jobs from your search will appear here in real-time.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {newJobs.map(job => (
                                <JobCard key={`new-${job.id}`} job={job} setSelectedJob={setSelectedJob} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
