
import React, { useRef, useEffect } from 'react';

interface VisionPreviewProps {
  stream: MediaStream | null;
  isActive: boolean;
}

const VisionPreview: React.FC<VisionPreviewProps> = ({ stream, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!isActive) return null;

  return (
    <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-slate-700 bg-black shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <span className="text-[8px] font-black text-white uppercase tracking-widest">Vision Link Active</span>
        </div>
        
        {/* Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-20 w-full animate-scan"></div>
        
        {/* Corner Brackets */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-blue-500/50"></div>
        <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-blue-500/50"></div>
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-blue-500/50"></div>
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-blue-500/50"></div>
      </div>
      
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
    </div>
  );
};

export default VisionPreview;
