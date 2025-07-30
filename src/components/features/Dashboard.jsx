import React from 'react';
import { Search, Loader2, Inbox } from 'lucide-react';
import AnimeLoader from '../ui/AnimeLoader'; // Import our new loader

function JobCard({ job, setSelectedJob }) {
    // A simple card to display job info
    return (
        <div 
            onClick={() => setSelectedJob(job)}
            className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md hover:border-sky-500 cursor-pointer transition-all"
        >
            <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
            <p className="text-sm text-slate-600">{job.company}</p>
            <div className="mt-4 flex gap-2">
                <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                    Similarity: {(job.similarity_score * 100).toFixed(0)}%
                </span>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                    AI Rating: {job.gemini_rating}/10
                </span>
            </div>
        </div>
    );
}

export default function Dashboard({ jobs, setSelectedJob, loading, error, onTriggerJobSearch, isSearching }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Job Dashboard</h2>
                <button
                    onClick={onTriggerJobSearch}
                    disabled={isSearching}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-all disabled:bg-sky-300 disabled:cursor-not-allowed"
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Searching...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            <span>Find New Jobs</span>
                        </>
                    )}
                </button>
            </div>

            {/* --- Main Content Area --- */}
            <div className="bg-white/50 border border-slate-200 rounded-lg p-4 min-h-[400px]">
                {isSearching ? (
                    // Show the cool anime loader when searching
                    <AnimeLoader />
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : jobs.length === 0 ? (
                    // Show an empty state message if no jobs are found
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <Inbox className="w-16 h-16 mb-4 text-slate-400" />
                        <h3 className="text-lg font-semibold">No Jobs Found</h3>
                        <p>Click "Find New Jobs" to start your search.</p>
                    </div>
                ) : (
                    // Display the grid of jobs
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {jobs.map(job => (
                            <JobCard key={job.id} job={job} setSelectedJob={setSelectedJob} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
