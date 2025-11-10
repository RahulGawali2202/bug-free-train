
export interface SharedFile {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  url: string;
  fileObject: File;
}

export interface User {
  id: string;
  name: string;
  status: 'online' | 'offline';
  sharedFiles: SharedFile[];
}
