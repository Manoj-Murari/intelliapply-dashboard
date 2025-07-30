import React from 'react';

const KANBAN_COLUMNS = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

function KanbanCard({ job, onDragStart, onClick }) {
    return (
        <div draggable onDragStart={(e) => onDragStart(e, job.id)} onClick={onClick} className="bg-white p-3 rounded-md border border-slate-200 shadow-sm hover:shadow-md cursor-grab">
            <h3 className="font-semibold text-sm text-slate-800">{job.title}</h3>
            <p className="text-xs text-slate-500">{job.company}</p>
        </div>
    );
}

export default function KanbanTracker({ jobs, updateJobStatus, setSelectedJob }) {
    const handleDragStart = (e, jobId) => e.dataTransfer.setData("jobId", jobId);
    const handleDrop = (e, newStatus) => {
        const jobId = e.dataTransfer.getData("jobId");
        updateJobStatus(parseInt(jobId), newStatus);
    };
    const jobsByStatus = KANBAN_COLUMNS.reduce((acc, status) => {
        acc[status] = jobs.filter(job => job.status === status || (status === 'Saved' && job.status === null));
        return acc;
    }, {});

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {KANBAN_COLUMNS.map(status => (
                <div key={status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, status)} className="bg-slate-100 rounded-lg p-3">
                    <h2 className="font-semibold text-slate-700 mb-4 px-1">{status} ({jobsByStatus[status].length})</h2>
                    <div className="space-y-3 kanban-column">
                        {jobsByStatus[status].map(job => (
                            <KanbanCard key={job.id} job={job} onDragStart={handleDragStart} onClick={() => setSelectedJob(job)} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
