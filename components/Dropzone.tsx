import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, FileVideo } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert('Please upload an image or video file.');
      }
    }
  }, [disabled, onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 ease-out
        flex flex-col items-center justify-center p-12 text-center overflow-hidden
        ${isDragging 
          ? 'border-cyan-400 bg-cyan-400/10 scale-[1.02]' 
          : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/50 hover:bg-zinc-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleInputChange}
        accept="image/*,video/*"
        disabled={disabled}
      />
      
      <div className="z-10 flex flex-col items-center gap-4">
        <div className={`
          p-4 rounded-full bg-zinc-900 shadow-xl border border-zinc-700 
          transition-transform duration-300 group-hover:scale-110 group-hover:border-cyan-500/50
        `}>
          <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-cyan-400' : 'text-zinc-400'}`} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-zinc-100">
            Drag & drop your media
          </h3>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            Support for <span className="text-zinc-200">Images</span> and <span className="text-zinc-200">Videos</span> (Preview Frame)
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          <span className="px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-700 text-xs text-zinc-500 flex items-center gap-1">
            <FileImage className="w-3 h-3" /> JPG, PNG, WEBP
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-700 text-xs text-zinc-500 flex items-center gap-1">
            <FileVideo className="w-3 h-3" /> MP4, MOV
          </span>
        </div>
      </div>

      {/* Decorative background blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
    </div>
  );
};

export default Dropzone;
