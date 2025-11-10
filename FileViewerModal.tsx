
import React, { useState, useEffect } from 'react';
import type { SharedFile } from '../types';
import { CloseIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

interface FileViewerModalProps {
  file: SharedFile;
  onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Reset zoom when file changes
    setZoom(1);
    
    // Handle Escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, onClose]);

  const handleZoomIn = () => {
    if (file.type === 'image') setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    if (file.type === 'image') setZoom(prev => Math.max(prev - 0.2, 0.2));
  };
  
  const isImage = file.type === 'image';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white truncate pr-4">{file.name}</h3>
          <div className="flex items-center space-x-2">
            {isImage && (
              <>
                <button onClick={handleZoomOut} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-300 disabled:opacity-50" disabled={zoom <= 0.2}>
                  <ZoomOutIcon className="w-6 h-6" />
                </button>
                <span className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-300 disabled:opacity-50" disabled={zoom >= 3}>
                  <ZoomInIcon className="w-6 h-6" />
                </button>
              </>
            )}
             <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/80 transition-colors text-gray-300 hover:text-white">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-700/50">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          ) : (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-full border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
