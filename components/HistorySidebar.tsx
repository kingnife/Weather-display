import React from 'react';
import { History, Clock, Trash2, MapPin } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (location: string) => void;
  onClear: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-72 glass-panel border-r border-white/10 z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <History className="w-5 h-5" />
            <h2 className="font-bold tracking-wide">History</h2>
          </div>
          {history.length > 0 && (
            <button 
              onClick={onClear}
              className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-red-400 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-white/40 mt-10 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent searches</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.location);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-white group-hover:text-blue-200 transition-colors truncate pr-2">{item.location}</span>
                  <span className="text-xs text-white/40 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                   <span className="text-white/70">{item.condition}</span>
                   <span className="font-bold text-yellow-300">{item.temp}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;