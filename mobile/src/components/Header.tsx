import React from 'react';
import { Shield, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { NativeService } from '../services/native';

interface HeaderProps {
  countryScope: string;
  setCountryScope: (scope: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isOnline: boolean;
  lastSyncTime: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  countryScope,
  setCountryScope,
  onRefresh,
  isRefreshing,
  isOnline,
  lastSyncTime,
}) => {
  const handleScopeChange = (newScope: string) => {
    NativeService.hapticFeedback();
    setCountryScope(newScope);
  };

  const handleRefreshClick = () => {
    NativeService.hapticFeedback();
    onRefresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 px-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base tracking-tight text-white">NCRI Mobile</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hybrid
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              {isOnline ? (
                <span className="flex items-center text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Live Sync
                </span>
              ) : (
                <span className="flex items-center text-amber-400">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline Cache
                </span>
              )}
              {lastSyncTime && (
                <span className="text-slate-500">
                  • {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Scope Segment Control */}
      <div className="mt-3 flex rounded-lg bg-slate-950/80 p-0.5 border border-slate-800/80">
        <button
          onClick={() => handleScopeChange('All')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            countryScope === 'All'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Landscape
        </button>
        <button
          onClick={() => handleScopeChange('India')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            countryScope === 'India'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🇮🇳 India Track
        </button>
      </div>
    </header>
  );
};
