'use client';

import { BookmarkPlus, Edit2, Eye, FileText, Trash2 } from 'lucide-react';
import { GenerationJob } from '../services/contentService';
import StatusBadge from './StatusBadge';

interface ContentListProps {
  jobs: GenerationJob[];
  loading: boolean;
  onView: (job: GenerationJob) => void;
  onEdit: (job: GenerationJob) => void;
  onDelete: (jobId: string) => void;
  onGenerate: () => void;
  onSave?: (job: GenerationJob) => void;
  savedJobIds?: Set<string>;
}

export default function ContentList({ jobs, loading, onView, onEdit, onDelete, onGenerate, onSave, savedJobIds = new Set() }: ContentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse bg-card">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg border-muted-foreground/25 bg-card/50">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
            <FileText className="text-primary h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No content generated yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
          Start creating high-quality content with AI. Your generated history will appear here.
        </p>
        <button
          onClick={onGenerate}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          Generate Content
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
       {/* Mobile View: Cards */}
       <div className="grid gap-4 md:hidden">
        {jobs.map((job) => (
          <div key={job.jobId} className="bg-card text-card-foreground border rounded-lg p-4 shadow-sm space-y-3">
             <div className="flex justify-between items-start">
               <div>
                  <h4 className="font-medium line-clamp-1" title={job.prompt}>
                    {job.prompt}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{job.contentType}</p>
               </div>
               <StatusBadge status={job.status} />
             </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                <span>{formatDate(job.createdAt)}</span>
                <div className="flex gap-2">
                  <button onClick={() => onView(job)} className="text-primary hover:underline flex items-center gap-1"><Eye className="w-3 h-3" /> View</button>
                  {job.status === 'completed' && !savedJobIds.has(job.jobId) && onSave && (
                     <button onClick={() => onSave(job)} className="text-green-600 hover:underline flex items-center gap-1"><BookmarkPlus className="w-3 h-3" /> Save</button>
                  )}
                  {job.status === 'completed' && (
                     <button onClick={() => onEdit(job)} className="text-blue-500 hover:underline flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                  )}
                  <button onClick={() => onDelete(job.jobId)} className="text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
          </div>
        ))}
       </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-md border bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Content</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.jobId} className="border-b transition-colors hover:bg-muted/10 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    <div className="max-w-[200px] truncate font-medium" title={job.prompt}>
                      {job.prompt}
                    </div>
                    {savedJobIds.has(job.jobId) && (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400" title="Saved to library">
                        ✓ Saved
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 align-middle text-muted-foreground">{job.contentType}</td>
                <td className="p-4 align-middle">
                  <StatusBadge status={job.status} />
                </td>
                <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                   {formatDate(job.createdAt)}
                </td>
                 <td className="p-4 align-middle text-right">
                   <div className="flex items-center justify-end gap-2">
                     <button 
                       onClick={() => onView(job)}
                       className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                     >
                       <Eye className="h-4 w-4 mr-2" /> View
                     </button>
                     {job.status === 'completed' && !savedJobIds.has(job.jobId) && onSave && (
                        <button
                          onClick={() => onSave(job)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 shadow-sm hover:bg-green-100 dark:hover:bg-green-900/30 h-8 px-3"
                        >
                          <BookmarkPlus className="h-4 w-4 mr-2" /> Save
                        </button>
                     )}
                     {job.status === 'completed' && (
                        <button
                          onClick={() => onEdit(job)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </button>
                     )}
                     <button
                         onClick={() => onDelete(job.jobId)}
                         className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-red-100 hover:text-red-900 dark:hover:bg-red-900/40 dark:hover:text-red-100 border border-transparent h-8 w-8 p-0"
                          title="Delete"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
