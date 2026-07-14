import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, User, Plus, Loader2 } from 'lucide-react';
import { CreateEntryDialog } from '@/components/CreateEntryDialog';
import { EditEntryDialog } from '@/components/EditEntryDialog';
import { EntryCard } from '@/components/EntryCard';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Toaster, toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/entries`);
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to load entries');
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEntryCreated = (newEntry) => {
    setEntries([newEntry, ...entries]);
  };

  const handleEntryUpdated = (updatedEntry) => {
    setEntries(entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (entry) => {
    setSelectedEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/entries/${selectedEntry.id}`);
      setEntries(entries.filter(entry => entry.id !== selectedEntry.id));
      toast.success('Entry deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      toast.error('Failed to delete entry');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Digital Diary</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
                {user?.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Diary</h2>
            <p className="text-gray-600 mt-1">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            data-testid="create-entry-button"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </Button>
        </div>

        {/* Entries List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600 mb-6">Start writing your first diary entry!</p>
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="empty-state-create-button">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="entries-list">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateEntryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onEntryCreated={handleEntryCreated}
      />
      
      <EditEntryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entry={selectedEntry}
        onEntryUpdated={handleEntryUpdated}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};
