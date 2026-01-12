'use client';

import ConfirmModal from '@/components/ConfirmModal';
import { contentService, SavedContent } from '@/services/contentService';
import { motion } from 'framer-motion';
import { BookOpen, Edit2, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LibraryPage() {
  const [library, setLibrary] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async (search?: string) => {
    try {
      const data = await contentService.getLibrary(search);
      setLibrary(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch library:', error);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchLibrary(searchQuery);
  };

  const handleView = (content: SavedContent) => {
    setSelectedContent(content);
    setEditTitle(content.title);
    setEditBody(content.body);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedContent) return;
    setIsSaving(true);
    
    try {
      const updated = await contentService.updateContent(selectedContent._id, {
        title: editTitle,
        body: editBody,
      });
      
      // Update in list
      setLibrary(prev => prev.map(item => 
        item._id === updated._id ? updated : item
      ));
      
      setSelectedContent(updated);
      setIsEditing(false);
      console.log('Content updated successfully');
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await contentService.deleteContent(deleteConfirm.id);
      setLibrary(prev => prev.filter(item => item._id !== deleteConfirm.id));
      if (selectedContent?._id === deleteConfirm.id) {
        setSelectedContent(null);
      }
      console.log('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setDeleteConfirm({ isOpen: false, id: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Content Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your saved AI-generated content
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, type, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchLibrary();
              }}
              className="px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
            >
              Clear
            </button>
          )}
        </motion.div>

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 border rounded-lg animate-pulse bg-card">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : library.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No saved content yet</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No results found. Try a different search term.' : 'Generate and save content to see it here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {library.map((content) => (
                <motion.div
                  key={content._id}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 border rounded-lg bg-card hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleView(content)}
                >
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {content.type} • {new Date(content.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {content.body.substring(0, 150)}...
                  </p>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(content);
                      }}
                      className="flex-1 text-xs py-2 px-3 border rounded hover:bg-accent transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(content._id);
                      }}
                      className="text-xs py-2 px-3 border border-red-200 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* View/Edit Modal */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl border"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold w-full bg-transparent border-b border-primary focus:outline-none"
                  />
                ) : (
                  <h3 className="text-xl font-bold">{selectedContent.title}</h3>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedContent.type} • {new Date(selectedContent.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="p-2 rounded-full hover:bg-accent"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full h-full min-h-[400px] p-4 rounded-md border bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {selectedContent.body}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-muted/10 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-input bg-background rounded-md hover:bg-accent flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '' })}
        variant="danger"
      />
    </div>
  );
}
