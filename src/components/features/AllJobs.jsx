import React, { useState, useMemo } from 'react';
import { Archive, Filter, Calendar } from 'lucide-react';

// A single job card component (reusable)
function JobCard({ job, setSelectedJob }) {
    return (
        <div 
            onClick={() => setSelectedJob(job)}
            className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md hover:border-sky-500 cursor-pointer transition-all"
        >
            <h3 className="font-bold text-lg text-slate-800 truncate">{job.title}</h3>
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

export default function AllJobs({ jobs, setSelectedJob }) {
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '7', '30'

    const dateFilterOptions = [
        { value: 'all', label: 'All Time' },
        { value: '7', label: 'Last 7 Days' },
        { value: '30', label: 'Last 30 Days' },
    ];

    // This logic filters the jobs based on the selected date range
    const filteredJobs = useMemo(() => {
        if (dateFilter === 'all') {
            return jobs;
        }
        const filterDays = parseInt(dateFilter, 10);
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - filterDays);

        return jobs.filter(job => new Date(job.created_at) >= filterDate);
    }, [jobs, dateFilter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Archive className="w-7 h-7" /> Job Library</h2>
                {/* --- NEW: Date Filter Dropdown --- */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium"
                    >
                        {dateFilterOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white/50 border border-slate-200 rounded-lg p-4 min-h-[400px]">
                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredJobs.map(job => (
                            <JobCard key={job.id} job={job} setSelectedJob={setSelectedJob} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-10">
                        <Calendar className="w-16 h-16 mb-4 text-slate-400" />
                        <h3 className="text-lg font-semibold">No jobs found for this period</h3>
                        <p>Try selecting a different date range or find new jobs from the dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
