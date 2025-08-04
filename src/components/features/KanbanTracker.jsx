import React, { useMemo } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';

const columnTitles = { 'Applied': 'Applied', 'Interviewing': 'Interviewing', 'Offer': 'Offer', 'Rejected': 'Rejected' };
const columnColors = { 'Applied': 'bg-sky-500', 'Interviewing': 'bg-purple-500', 'Offer': 'bg-emerald-500', 'Rejected': 'bg-red-500' };

function JobCard({ job, columnId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });
  const { setSelectedJob, openInterviewPrepModal } = useStore(state => ({
    setSelectedJob: state.setSelectedJob,
    openInterviewPrepModal: state.openInterviewPrepModal,
  }));

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 'auto' };

  const handlePrepClick = (e) => {
    e.stopPropagation();
    setSelectedJob(job);
    openInterviewPrepModal();
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => setSelectedJob(job)}
      className={`bg-white p-3 mb-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-500 cursor-grab transition-all ${ isDragging ? 'shadow-lg ring-2 ring-sky-500' : '' }`}>
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

function Column({ columnId, title, jobs }) {
  return (
    <div className="bg-slate-100 rounded-lg w-72 flex-shrink-0 flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${columnColors[columnId]}`}></div>
          <h3 className="font-bold text-slate-700">{title}</h3>
        </div>
        <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{jobs.length}</span>
      </div>
      <div className="p-3 pt-0 flex-grow min-h-[100px]">
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} columnId={columnId} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanTracker({ jobs, updateJobStatus }) {
  const columns = useMemo(() => {
    const newColumns = { 'Applied': [], 'Interviewing': [], 'Offer': [], 'Rejected': [] };
    if (jobs && jobs.length > 0) {
        jobs.forEach(job => {
            const status = job.status || 'Applied'; // Default to 'Applied'
            if (newColumns[status]) {
                newColumns[status].push(job);
            }
        });
    }
    return newColumns;
  }, [jobs]);

  const findColumn = (jobId) => {
    if (!jobId) return null;
    return Object.keys(columns).find(columnId => columns[columnId].find(job => job.id === jobId));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumn(activeId);
    let overColumn = findColumn(overId);
    
    if (Object.keys(columns).includes(overId)) {
      overColumn = overId;
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;
    
    updateJobStatus(activeId, overColumn);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Job Application Tracker</h2>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnId, columnJobs]) => (
            <Column
              key={columnId}
              columnId={columnId}
              title={columnTitles[columnId]}
              jobs={columnJobs}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
