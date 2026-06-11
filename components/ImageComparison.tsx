import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({ beforeImage, afterImage }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  
  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const newPos = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(newPos);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      handleMove(e.clientX);
    }
  }, [isResizing, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isResizing) {
      handleMove(e.touches[0].clientX);
    }
  }, [isResizing, handleMove]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleTouchMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 select-none group"
      style={{ aspectRatio: '16/9', maxHeight: '70vh' }}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt="Processed"
        className="absolute top-0 left-0 w-full h-full object-contain bg-zinc-900"
      />
      <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
        AFTER
      </div>

      {/* Before Image (Foreground with Clip Path) */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Original"
          className="absolute top-0 left-0 w-full h-full object-contain bg-zinc-900"
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
          BEFORE
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20"
        style={{ left: `${position}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default ImageComparison;
