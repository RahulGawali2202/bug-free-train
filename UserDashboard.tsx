
import React from 'react';
import type { User, SharedFile } from '../types';
import { PdfIcon, ImageIcon, FolderIcon } from './Icons';

interface UserDashboardProps {
  user: User;
  onOpenFile: (file: SharedFile) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onOpenFile }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name.split(' ')[0]}</h1>
      <p className="text-gray-400 mb-8">You have {user.sharedFiles.length} file(s) shared with you.</p>

      {user.sharedFiles.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-lg">
          <FolderIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h2 className="text-xl text-gray-300">No Files Shared</h2>
          <p className="text-gray-500">The admin hasn't shared any files with you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {user.sharedFiles.map(file => (
            <div
              key={file.id}
              onClick={() => onOpenFile(file)}
              className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-cyan-800/50 transition-all transform hover:-translate-y-1 shadow-lg"
            >
              <div className="w-16 h-16 mb-3 text-cyan-400 group-hover:text-cyan-300">
                {file.type === 'pdf' ? <PdfIcon /> : <ImageIcon />}
              </div>
              <p className="text-sm font-medium text-gray-200 break-all">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
