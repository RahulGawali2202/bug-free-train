import React, { useState, useMemo } from 'react';
import type { User, SharedFile } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import FileViewerModal from './components/FileViewerModal';
// Fix: Added missing AdminIcon, UserIcon, and NetworkIcon to imports.
import { AdminIcon, UserIcon, NetworkIcon } from './components/Icons';

// MOCK DATA
const initialUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice (Desktop-A)',
    status: 'online',
    sharedFiles: [],
  },
  {
    id: 'user-2',
    name: 'Bob (Laptop-B)',
    status: 'online',
    sharedFiles: [],
  },
  {
    id: 'user-3',
    name: 'Charlie (Tablet-C)',
    status: 'offline',
    sharedFiles: [],
  },
];

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('admin');
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [fileToView, setFileToView] = useState<SharedFile | null>(null);

  const onlineUsers = useMemo(() => users.filter(u => u.status === 'online'), [users]);

  const handleShareFiles = (userIds: string[], files: File[]) => {
    const newFiles: SharedFile[] = files.map(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      if (fileType !== 'image' && file.type !== 'application/pdf') {
        return null;
      }

      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: fileType,
        url: URL.createObjectURL(file),
        fileObject: file,
      };
    }).filter((file): file is SharedFile => file !== null);

    if (newFiles.length !== files.length) {
        alert('Some files were of an unsupported type and were not shared. Please select only images or PDFs.');
    }
    
    if(newFiles.length === 0) return;

    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (userIds.includes(user.id)) {
          // Filter out files that are already shared with this user to avoid duplicates
          const filesToAdd = newFiles.filter(newFile => 
            !user.sharedFiles.some(existingFile => existingFile.name === newFile.name)
          );

          return {
            ...user,
            sharedFiles: [...user.sharedFiles, ...filesToAdd],
          };
        }
        return user;
      })
    );
  };

  const handleRemoveFile = (userId: string, fileId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            sharedFiles: user.sharedFiles.filter(file => file.id !== fileId),
          };
        }
        return user;
      })
    );
  };

  const handleRemoveFileFromAll = (fileId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user => ({
        ...user,
        sharedFiles: user.sharedFiles.filter(file => file.id !== fileId),
      }))
    );
  };

  const handleOpenFile = (file: SharedFile) => {
    setFileToView(file);
  };

  const handleCloseModal = () => {
    // Revoke the object URL to free up memory
    if (fileToView) {
      URL.revokeObjectURL(fileToView.url);
    }
    setFileToView(null);
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setViewMode('user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-gray-800 p-4 border-b md:border-b-0 md:border-r border-gray-700 flex-shrink-0">
        <div className="flex items-center mb-6">
          <NetworkIcon className="w-8 h-8 mr-3 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">LocalShare</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">VIEW AS</h2>
          <button
            onClick={() => setViewMode('admin')}
            className={`w-full flex items-center p-2 rounded-md transition-colors ${
              viewMode === 'admin' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'
            }`}
          >
            <AdminIcon className="w-5 h-5 mr-3" />
            Admin Console
          </button>
        </div>
        
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-2">SWITCH TO USER</h2>
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                disabled={user.status === 'offline'}
                className={`w-full flex items-center p-2 rounded-md transition-colors text-left ${
                  viewMode === 'user' && currentUser.id === user.id
                    ? 'bg-cyan-600 text-white'
                    : 'hover:bg-gray-700'
                } ${user.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                </div>
                <span className="truncate flex-grow">{user.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full ml-2 flex-shrink-0 ${user.status === 'online' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {viewMode === 'admin' ? (
          <AdminDashboard 
            users={users} 
            onShareFiles={handleShareFiles} 
            onRemoveFile={handleRemoveFile}
            onRemoveFileFromAll={handleRemoveFileFromAll}
          />
        ) : (
          <UserDashboard user={currentUser} onOpenFile={handleOpenFile} />
        )}
      </main>

      {fileToView && (
        <FileViewerModal file={fileToView} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;