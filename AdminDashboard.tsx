import React, { useState, useRef, useMemo } from 'react';
import type { User, SharedFile } from '../types';
// Fix: Changed FolderOpenIcon to FolderIcon to match export from Icons.tsx
import { UploadIcon, UserGroupIcon, ShareIcon, FolderIcon, PdfIcon, ImageIcon, TrashIcon } from './Icons';

interface AdminDashboardProps {
  users: User[];
  onShareFiles: (userIds: string[], files: File[]) => void;
  onRemoveFile: (userId: string, fileId: string) => void;
  onRemoveFileFromAll: (fileId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onShareFiles, onRemoveFile, onRemoveFileFromAll }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onlineUsers = users.filter(u => u.status === 'online');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };
  
  const handleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const handleSelectAll = () => {
    if(selectedUserIds.length === onlineUsers.length) {
        setSelectedUserIds([]);
    } else {
        setSelectedUserIds(onlineUsers.map(u => u.id));
    }
  };

  const handleShare = () => {
    if (selectedFiles.length === 0 || selectedUserIds.length === 0) {
      setFeedbackMessage('Please select one or more files and at least one user.');
      setTimeout(() => setFeedbackMessage(''), 3000);
      return;
    }
    onShareFiles(selectedUserIds, selectedFiles);
    setFeedbackMessage(`Shared ${selectedFiles.length} file(s) with ${selectedUserIds.length} user(s).`);
    setSelectedFiles([]);
    setSelectedUserIds([]);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setTimeout(() => setFeedbackMessage(''), 3000);
  };
  
  const sharedFilesMap = useMemo(() => {
    const map = new Map<string, { file: SharedFile, users: User[] }>();
    users.forEach(user => {
      user.sharedFiles.forEach(file => {
        if (map.has(file.id)) {
          map.get(file.id)!.users.push(user);
        } else {
          map.set(file.id, { file: file, users: [user] });
        }
      });
    });
    return map;
  }, [users]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Console</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* File Upload Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><UploadIcon className="w-6 h-6 mr-2 text-cyan-400" /> Upload & Share</h2>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
              multiple
            />
            <UploadIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
            {selectedFiles.length > 0 ? (
                <div className="text-left max-h-24 overflow-y-auto text-sm">
                    <p className="text-gray-300 mb-1 font-semibold">{selectedFiles.length} file(s) selected:</p>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                        {selectedFiles.map(file => <li key={file.name} className="truncate">{file.name}</li>)}
                    </ul>
                </div>
            ) : (
                <>
                    <p className="text-gray-400">
                        Click to browse or drag & drop files
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF or Image files only</p>
                </>
            )}
          </div>
        </div>

        {/* User Selection Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><UserGroupIcon className="w-6 h-6 mr-2 text-cyan-400" /> Select Users</h2>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {onlineUsers.map(user => (
              <label key={user.id} className="flex items-center p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => handleUserSelection(user.id)}
                  className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                />
                <span className="ml-3 text-white truncate">{user.name}</span>
                <div className="ml-auto w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </label>
            ))}
          </div>
           <div className="mt-4">
               <label className="flex items-center text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlineUsers.length > 0 && selectedUserIds.length === onlineUsers.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                  />
                  <span className="ml-2">Select All Online</span>
               </label>
           </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handleShare}
          disabled={selectedFiles.length === 0 || selectedUserIds.length === 0}
          className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center mx-auto"
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          Share File(s)
        </button>
        {feedbackMessage && <p className="mt-4 text-green-400">{feedbackMessage}</p>}
      </div>

      {/* Manage Shared Files Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            {/* Fix: Changed FolderOpenIcon to FolderIcon */}
            <FolderIcon className="w-7 h-7 mr-3 text-cyan-400" />
            Manage Shared Files
        </h2>
        {sharedFilesMap.size === 0 ? (
            <div className="text-center py-10 bg-gray-800 rounded-lg">
                <p className="text-gray-500">No files have been shared yet.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {Array.from(sharedFilesMap.values()).map(({ file, users: fileUsers }) => (
                    <div key={file.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0">
                            {file.type === 'pdf' ? <PdfIcon className="w-6 h-6 mr-3 text-cyan-400 flex-shrink-0" /> : <ImageIcon className="w-6 h-6 mr-3 text-cyan-400 flex-shrink-0" />}
                            <span className="font-semibold text-white truncate">{file.name}</span>
                          </div>
                           <button 
                              onClick={() => onRemoveFileFromAll(file.id)}
                              className="p-1.5 rounded-full hover:bg-red-500/80 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-4"
                              aria-label={`Remove ${file.name} from all users`}
                           >
                              <TrashIcon className="w-5 h-5" />
                           </button>
                        </div>
                        <div className="mt-3 pl-9">
                            <h4 className="text-sm text-gray-400 mb-2">Shared with:</h4>
                            <ul className="space-y-2">
                                {fileUsers.map(user => (
                                    <li key={`${file.id}-${user.id}`} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                                        <span className="text-sm text-gray-200">{user.name}</span>
                                        <button 
                                            onClick={() => onRemoveFile(user.id, file.id)}
                                            className="p-1 rounded-full hover:bg-red-500/80 text-gray-400 hover:text-white transition-colors"
                                            aria-label={`Remove ${file.name} from ${user.name}`}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;