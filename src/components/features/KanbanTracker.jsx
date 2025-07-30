import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building } from 'lucide-react';

const columnTitles = {
  'Applied': 'Applied',
  'Interviewing': 'Interviewing',
  'Offer': 'Offer',
  'Rejected': 'Rejected',
};

const columnColors = {
  'Applied': 'bg-sky-500',
  'Interviewing': 'bg-purple-500',
  'Offer': 'bg-emerald-500',
  'Rejected': 'bg-red-500',
};

// A single draggable job card component
function JobCard({ job, setSelectedJob }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedJob(job)}
      className={`bg-white p-3 mb-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-500 cursor-grab transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-sky-500' : ''
      }`}
    >
      <h4 className="font-semibold text-sm text-slate-800">{job.title}</h4>
      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
        <Building className="w-3 h-3" /> {job.company}
      </p>
    </div>
  );
}

// A single column component
function Column({ columnId, title, jobs, setSelectedJob }) {
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
            <JobCard key={job.id} job={job} setSelectedJob={setSelectedJob} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanTracker({ jobs, updateJobStatus, setSelectedJob }) {
  const [columns, setColumns] = useState({
    'Applied': [],
    'Interviewing': [],
    'Offer': [],
    'Rejected': [],
  });

  useEffect(() => {
    const newColumns = { 'Applied': [], 'Interviewing': [], 'Offer': [], 'Rejected': [] };
    jobs.forEach(job => {
      const status = job.status || 'Applied';
      if (newColumns[status]) {
        newColumns[status].push(job);
      }
    });
    setColumns(newColumns);
  }, [jobs]);

  const findColumn = (jobId) => {
    if (!jobId) return null;
    return Object.keys(columns).find(columnId => columns[columnId].find(job => job.id === jobId));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require mouse to move 8px before drag starts
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumn(activeId);
    let overColumn = findColumn(overId);
    
    // If we're dropping over a column container instead of another card
    if (Object.keys(columns).includes(overId)) {
      overColumn = overId;
    }

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }
    
    // Call the function from App.jsx to update the status in the database
    updateJobStatus(activeId, overColumn);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Job Application Tracker</h2>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnId, jobs]) => (
            <Column
              key={columnId}
              columnId={columnId}
              title={columnTitles[columnId]}
              jobs={jobs}
              setSelectedJob={setSelectedJob}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
