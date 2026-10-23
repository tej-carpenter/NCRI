import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-amber-300 text-xs">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Operating Offline • Serving cached cybersecurity intelligence</span>
      </div>
      <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">HMAD Local Cache</span>
    </div>
  );
};
