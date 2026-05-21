import React from 'react';
import { LayoutDashboard, Package, Truck, Settings } from 'lucide-react';

type NavCategory = 'dashboard' | 'inventory' | 'operations' | 'management';

interface SidebarIconBarProps {
  activeCategory: NavCategory;
  setActiveCategory: (category: NavCategory) => void;
}

export const SidebarIconBar: React.FC<SidebarIconBarProps> = ({ activeCategory, setActiveCategory }) => {
  return (
    <aside className="hidden lg:flex flex-col w-14 border-r border-neutral-100 dark:border-[#2e2e2e] bg-white dark:bg-[#232323] items-center py-4 gap-4 z-50">
      <div className="w-8 h-8 rounded-lg bg-supabase-green flex items-center justify-center mb-4">
        <span className="text-sm font-black text-black">W</span>
      </div>
      
      <button 
        onClick={() => setActiveCategory('dashboard')}
        className={`p-2 rounded-lg transition-colors ${activeCategory === 'dashboard' ? 'bg-neutral-100 dark:bg-[#2e2e2e] text-supabase-green' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}
      >
        <LayoutDashboard size={20} />
      </button>
      
      <button 
        onClick={() => setActiveCategory('inventory')}
        className={`p-2 rounded-lg transition-colors ${activeCategory === 'inventory' ? 'bg-neutral-100 dark:bg-[#2e2e2e] text-supabase-green' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}
      >
        <Package size={20} />
      </button>
      
      <button 
        onClick={() => setActiveCategory('operations')}
        className={`p-2 rounded-lg transition-colors ${activeCategory === 'operations' ? 'bg-neutral-100 dark:bg-[#2e2e2e] text-supabase-green' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}
      >
        <Truck size={20} />
      </button>
      
      <button 
        onClick={() => setActiveCategory('management')}
        className={`p-2 rounded-lg transition-colors ${activeCategory === 'management' ? 'bg-neutral-100 dark:bg-[#2e2e2e] text-supabase-green' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}
      >
        <Settings size={20} />
      </button>

      <div className="mt-auto flex flex-col gap-4 items-center pb-4">
        <div className="w-8 h-8 rounded-lg border border-neutral-100 dark:border-[#2e2e2e] flex items-center justify-center text-[10px] font-bold text-neutral-400">
          CV
        </div>
      </div>
    </aside>
  );
};
