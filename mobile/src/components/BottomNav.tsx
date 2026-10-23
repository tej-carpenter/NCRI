import React from 'react';
import { LayoutDashboard, ShieldAlert, TrendingUp, BarChart2, Activity, Database } from 'lucide-react';
import { NativeService } from '../services/native';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'sectors', label: 'Sectors', icon: BarChart2 },
    { id: 'risk', label: 'NCRI Risk', icon: Activity },
    { id: 'sources', label: 'Sources', icon: Database },
  ];

  const handleTabClick = (tabId: string) => {
    if (activeTab !== tabId) {
      NativeService.hapticFeedback();
      setActiveTab(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom,0px)+0.3rem)] pt-1.5 px-2 shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 dark:bg-blue-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
