'use client';

import ConfirmModal from '@/components/ConfirmModal';
import ContentList from '@/components/ContentList';
import GenerationModal from '@/components/GenerationModal';
import { contentService, GenerationJob, SavedContent } from '@/services/contentService';
import { wsService } from '@/services/websocketService';
import { useAuthStore } from '@/store/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Plus, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [library, setLibrary] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<GenerationJob | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  
  // Edit state
  const [editBody, setEditBody] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Match jobs with saved library content from MongoDB
  const getContentIdForJob = (jobId: string): string | null => {
    const job = jobs.find(j => j.jobId === jobId);
    if (!job || !job.generatedContent) return null;
    
    // Find matching content in library by comparing generated content
    const matchedContent = library.find(content => {
      // Match by exact content body or similar title
      return content.body === job.generatedContent || 
             (content.title && job.prompt && content.title.includes(job.prompt.substring(0, 50)));
    });
    
    return matchedContent?._id || null;
  };

  // Merge library content into jobs to show latest edited versions
  const getMergedJobs = (jobsArray: GenerationJob[], libraryArray: SavedContent[]): GenerationJob[] => {
    return jobsArray.map(job => {
      const contentId = getContentIdForJob(job.jobId);
      if (contentId) {
        // Find the library content for this job
        const libraryContent = libraryArray.find(content => content._id === contentId);
        if (libraryContent) {
          // Merge library data into job to show latest edited version
          return {
            ...job,
            prompt: libraryContent.title,
            generatedContent: libraryContent.body,
            contentType: libraryContent.type as GenerationJob['contentType']
          };
        }
      }
      // Return original job if not saved to library
      return job;
    });
  };

  // Fetch data from MongoDB
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch both jobs and library from MongoDB
        const [jobsData, libraryData] = await Promise.all([
          contentService.getJobs(),
          contentService.getLibrary()
        ]);
        
        setJobs(jobsData);
        setLibrary(libraryData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Connect WebSocket
    const token = useAuthStore.getState().token;
    if (token) {
      wsService.connect(token);

      // Listen for job completions
      wsService.onAnyJobComplete((data) => {
        console.log('Job completed via WebSocket:', data);
        
        // Update the job in the list
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.jobId === data.jobId 
              ? { ...job, status: data.status, generatedContent: data.generatedContent, error: data.error, completedAt: data.completedAt }
              : job
          )
        );

        // Show notification
        if (data.status === 'completed') {
          console.log('Content generated successfully');
        } else if (data.status === 'failed') {
          console.error('Generation failed:', data.error);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, [isAuthenticated, router]);

  // Auto-refresh when page becomes visible (user navigates back from library)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, libraryData] = await Promise.all([
          contentService.getJobs(),
          contentService.getLibrary()
        ]);
        setJobs(jobsData);
        setLibrary(libraryData);
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    const handleFocus = () => {
      fetchData();
    };

    // Listen for page visibility changes and window focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleGenerate = async (prompt: string, contentType: string) => {
    try {
      const result = await contentService.createJob(prompt, contentType);
      setIsGenerateOpen(false);
      console.log('Content generation started');
      // Re-fetch both jobs and library from MongoDB
      const [jobsData, libraryData] = await Promise.all([
        contentService.getJobs(),
        contentService.getLibrary()
      ]);
      setJobs(jobsData);
      setLibrary(libraryData);
    } catch (error) {
      console.error('Failed to start generation:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    const contentId = getContentIdForJob(jobId);
    
    if (contentId) {
      // Content is saved to library - delete from database
      setConfirmModal({
        isOpen: true,
        title: 'Delete Saved Content',
        message: 'This content is saved in your library. Delete it permanently from both dashboard and library?',
        onConfirm: async () => {
          try {
            // Delete from database
            await contentService.deleteContent(contentId);
            
            // Remove from local job list
            setJobs(prev => prev.filter(j => j.jobId !== jobId));
            
            // Refresh library to reflect deletion
            const libraryData = await contentService.getLibrary();
            setLibrary(libraryData);
            
            console.log('Content deleted from database and library');
          } catch (error) {
            console.error('Failed to delete content:', error);
          } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
          }
        }
      });
    } else {
      // Not saved to library - just remove from local dashboard
      setConfirmModal({
        isOpen: true,
        title: 'Remove from Dashboard',
        message: 'Remove this generation from your dashboard? (Not saved to library)',
        onConfirm: () => {
          setJobs(prev => prev.filter(j => j.jobId !== jobId));
          console.log('Job removed from dashboard');
          setConfirmModal({ ...confirmModal, isOpen: false });
        }
      });
    }
  };

  const handleOpenView = (job: GenerationJob) => {
    setSelectedJob(job);
    setViewMode('view');
    setEditBody(job.generatedContent || '');
    setEditTitle(job.prompt || 'Untitled');
  };

  const handleOpenEdit = (job: GenerationJob) => {
    setSelectedJob(job);
    setViewMode('edit');
    setEditBody(job.generatedContent || '');
    setEditTitle(job.prompt || 'Untitled');
  };

  const handleSaveToLibrary = async () => {
    if (!selectedJob) return;
    setIsSaving(true);
    
    try {
      const existingContentId = getContentIdForJob(selectedJob.jobId);
      
      if (existingContentId) {
        // Update existing content in MongoDB using PUT
        await contentService.updateContent(existingContentId, {
          title: editTitle,
          body: editBody,
          type: selectedJob.contentType
        });
        console.log('Content updated successfully');
      } else {
        // Save new content to MongoDB using POST
        await contentService.saveContent(selectedJob.jobId, editTitle);
        console.log('Saved successfully');
      }
      
      // Re-fetch both jobs and library to get updated data from MongoDB
      // The getMergedJobs function will ensure edited content is displayed
      const [jobsData, libraryData] = await Promise.all([
        contentService.getJobs(),
        contentService.getLibrary()
      ]);
      setJobs(jobsData);
      setLibrary(libraryData);
      
      setSelectedJob(null);
    } catch (error: any) {
        console.error(error);
        const errorMsg = error.response?.data?.message || 'Failed to save';
        console.error(errorMsg);
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveAllCompleted = async () => {
    const completedJobs = jobs.filter(job => 
      job.status === 'completed' && 
      job.generatedContent && 
      !getContentIdForJob(job.jobId)
    );
    
    if (completedJobs.length === 0) {
      console.log('No unsaved completed jobs to save');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Save All Completed',
      message: `Save ${completedJobs.length} completed job(s) to your library?`,
      onConfirm: async () => {
        let successCount = 0;
        for (const job of completedJobs) {
          try {
            await contentService.saveContent(job.jobId);
            successCount++;
          } catch (error) {
            console.error(`Failed to save job ${job.jobId}:`, error);
          }
        }
        console.log(`Saved ${successCount}/${completedJobs.length} items to library`);
        
        // Re-fetch library from MongoDB after batch save
        const libraryData = await contentService.getLibrary();
        setLibrary(libraryData);
      }
    });
  };

  const handleSaveSingle = async (job: GenerationJob) => {
    try {
      await contentService.saveContent(job.jobId);
      console.log('Saved successfully');
      
      // Re-fetch library from MongoDB
      const libraryData = await contentService.getLibrary();
      setLibrary(libraryData);
    } catch (error: any) {
      console.error('Failed to save:', error.response?.data?.message || error.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editBody);
    console.log('Copied to clipboard');
  };

  return (
    <main className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-8 relative z-10">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Generate and manage your AI-powered content efficiently.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveAllCompleted}
              disabled={jobs.filter(j => j.status === 'completed' && !getContentIdForJob(j.jobId)).length === 0}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-primary text-primary hover:bg-primary/10 h-11 px-6"
            >
              <Save className="mr-2 h-4 w-4" />
              Save All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGenerateOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-lg shadow-primary/25"
            >
              <Plus className="mr-2 h-5 w-5" />
              Generate New Content
            </motion.button>
          </div>
        </motion.div>

        {/* Content Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Your Generated Content</h2>
          </div>
          
          <ContentList
            jobs={getMergedJobs(jobs, library)}
            loading={loading}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onSave={handleSaveSingle}
            onGenerate={() => setIsGenerateOpen(true)}
            savedJobIds={new Set(jobs.filter(j => getContentIdForJob(j.jobId)).map(j => j.jobId))}
          />
        </motion.div>

      <GenerationModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSubmit={handleGenerate}
      />

      {/* View/Edit Modal (Inline for simplicity) */}
      <AnimatePresence>
      {selectedJob && (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl border border-border" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                 <h3 className="text-xl font-bold">{viewMode === 'edit' ? 'Edit Content' : 'View Content'}</h3>
                 <p className="text-sm text-muted-foreground">{selectedJob.contentType} • {new Date(selectedJob.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent/50">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                 <div className="p-3 bg-muted/30 rounded-md text-sm border border-border/50">
                    {selectedJob.prompt}
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                    Generated Content
                    <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-primary hover:underline">
                        <Copy className="h-3 w-3" /> Copy
                    </button>
                 </label>
                 {viewMode === 'view' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-card/50 whitespace-pre-wrap font-mono text-sm">
                       {selectedJob.generatedContent || <span className="text-muted-foreground italic">Processing or no content yet...</span>}
                    </div>
                 ) : (
                    <textarea 
                       value={editBody}
                       onChange={e => setEditBody(e.target.value)}
                       className="w-full h-64 p-4 rounded-md border bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                 )}
              </div>
            </div>

            <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-3 rounded-b-xl">
               {viewMode === 'edit' ? (
                   <>
                     <button onClick={() => setViewMode('view')} className="px-4 py-2 text-sm font-medium hover:underline">Cancel Edit</button>
                     <button 
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                     >
                       {isSaving ? (getContentIdForJob(selectedJob.jobId) ? 'Updating...' : 'Saving...') : <><Save className="h-4 w-4" /> {getContentIdForJob(selectedJob.jobId) ? 'Update' : 'Save'}</>}
                     </button>
                   </>
               ) : (
                   <>
                    <button onClick={() => setSelectedJob(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Close</button>
                    {selectedJob.status === 'completed' && (
                        <button 
                            onClick={() => setViewMode('edit')}
                            className="inline-flex items-center gap-2 border border-input bg-background px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                             Edit
                        </button>
                    )}
                   </>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        variant="danger"
      />
    </main>
  );
}
