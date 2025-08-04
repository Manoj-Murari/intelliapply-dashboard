import React, { useMemo, useCallback, useState } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';

const columnTitles = { 'Applied': 'Applied', 'Interviewing': 'Interviewing', 'Offer': 'Offer', 'Rejected': 'Rejected' };
const columnColors = { 'Applied': 'bg-sky-500', 'Interviewing': 'bg-purple-500', 'Offer': 'bg-emerald-500', 'Rejected': 'bg-red-500' };

function JobCard({ job, columnId }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: job.id,
        data: { type: 'Job', job } // Add data for context
    });
    
    const setSelectedJob = useStore(state => state.setSelectedJob);
    const openInterviewPrepModal = useStore(state => state.openInterviewPrepModal);

    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition,
        opacity: isDragging ? 0.5 : 1, // Make the original card semi-transparent while dragging
    };

    const handlePrepClick = (e) => {
        e.stopPropagation();
        setSelectedJob(job);
        openInterviewPrepModal();
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => setSelectedJob(job)}
            className={`bg-white p-3 mb-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-500 cursor-grab transition-all`}>
            <h4 className="font-semibold text-sm text-slate-800">{job.title}</h4>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Building className="w-3 h-3" /> {job.company}</p>
            
            {columnId === 'Interviewing' && (
                <button onClick={handlePrepClick} className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-md py-1.5 transition-colors">
                    <Sparkles className="w-3 h-3" />
                    Prep for Interview
                </button>
            )}
        </div>
    );
}

// --- FIX: Make the entire column a droppable area using useSortable ---
function Column({ columnId, title, jobs }) {
    const { setNodeRef } = useSortable({ id: columnId, data: { type: 'Column' } });

    return (
        <div className="bg-slate-100 rounded-lg w-72 flex-shrink-0 flex flex-col">
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${columnColors[columnId]}`}></div>
                    <h3 className="font-bold text-slate-700">{title}</h3>
                </div>
                <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{jobs.length}</span>
            </div>
            {/* The SortableContext now wraps the droppable area */}
            <SortableContext id={columnId} items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="p-3 pt-0 flex-grow min-h-[100px]">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} columnId={columnId} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

export default function KanbanTracker({ jobs, updateJobStatus }) {
    const [activeJob, setActiveJob] = useState(null);

    const columns = useMemo(() => {
        const newColumns = { 'Applied': [], 'Interviewing': [], 'Offer': [], 'Rejected': [] };
        const trackedJobs = jobs ? jobs.filter(job => job.is_tracked) : [];
        
        trackedJobs.forEach(job => {
            const status = job.status || 'Applied'; 
            if (newColumns[status]) {
                newColumns[status].push(job);
            }
        });
        return newColumns;
    }, [jobs]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const findColumnForJob = useCallback((jobId) => {
        if (!jobId) return null;
        return Object.keys(columns).find(columnId => 
            columns[columnId].some(job => job.id === jobId)
        );
    }, [columns]);

    // --- FIX: Completely new drag-and-drop handlers for robustness ---
    const handleDragStart = (event) => {
        const { active } = event;
        if (active.data.current?.type === 'Job') {
            setActiveJob(active.data.current.job);
        }
    };

    const handleDragEnd = useCallback((event) => {
        setActiveJob(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Don't do anything if dropping on itself
        if (activeId === overId) return;

        const activeColumn = findColumnForJob(activeId);
        
        // Determine the destination column.
        // It could be a column itself or a card within a column.
        const overIsColumn = over.data.current?.type === 'Column';
        const overColumn = overIsColumn ? over.id : findColumnForJob(overId);

        if (!activeColumn || !overColumn || activeColumn === overColumn) {
            return; // No status change needed
        }
        
        // If we are here, the card was dropped in a new column.
        updateJobStatus(activeId, overColumn);

    }, [findColumnForJob, updateJobStatus]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Job Application Tracker</h2>
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCorners} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {/* The columns themselves are now part of a SortableContext */}
                    <SortableContext items={Object.keys(columns)}>
                        {Object.entries(columns).map(([columnId, columnJobs]) => (
                            <Column
                                key={columnId}
                                columnId={columnId}
                                title={columnTitles[columnId]}
                                jobs={columnJobs}
                            />
                        ))}
                    </SortableContext>
                </div>

                {/* This creates a smooth "ghost" card that follows the cursor */}
                <DragOverlay>
                    {activeJob ? <JobCard job={activeJob} columnId={findColumnForJob(activeJob.id)} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
