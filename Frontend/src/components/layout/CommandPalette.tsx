import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  FileText, 
  Package, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardList, 
  ShoppingBag, 
  Truck, 
  Undo2, 
  Factory, 
  Users,
  Activity
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  setSearch: (search: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, search, setSearch }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const sections = [
    {
      title: 'DASHBOARD',
      items: [
        { label: 'Overview', to: '/', icon: <LayoutDashboard size={16} /> },
        { label: 'PO Tracker', to: '/po-tracker', icon: <Activity size={16} /> },
        { label: 'Analytics', to: '/analytics', icon: <FileText size={16} /> },
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { label: 'Catalog', to: '/products', icon: <Package size={16} /> },
        { label: 'Shelves', to: '/shelf-locations', icon: <Warehouse size={16} /> },
        { label: 'Mapping', to: '/product-mapping', icon: <ArrowLeftRight size={16} /> },
        { label: 'Adjustments', to: '/inventory-adjustments', icon: <ClipboardList size={16} /> },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Picking', to: '/picking', icon: <ShoppingBag size={16} /> },
        { label: 'Packing', to: '/packing', icon: <Package size={16} /> },
        { label: 'Putaway', to: '/putaway', icon: <ArrowLeftRight size={16} /> },
        { label: 'Inbound', to: '/inbound-shipments', icon: <Truck size={16} /> },
        { label: 'Purchase Order', to: '/Purchase-Order', icon: <FileText size={16} /> },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Orders', to: '/orders', icon: <ShoppingBag size={16} /> },
        { label: 'Returns', to: '/returns', icon: <Undo2 size={16} /> },
        { label: 'Warehouse', to: '/warehouses', icon: <Factory size={16} /> },
        { label: 'Suppliers', to: '/suppliers', icon: <Users size={16} /> },
        { label: 'Users', to: '/users', icon: <Users size={16} /> },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1c1c1c] rounded-xl border border-neutral-200 dark:border-[#2e2e2e] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200">
        <div className="flex items-center px-4 h-14 border-b border-neutral-100 dark:border-[#2e2e2e]">
          <Search className="text-neutral-400 mr-3" size={18} />
          <input
            autoFocus
            placeholder="Run a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="text-[10px] font-bold text-neutral-400 px-2 py-1 rounded border border-neutral-100 dark:border-[#2e2e2e] hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4 custom-scrollbar">
          {sections.map(section => {
            const filteredItems = section.items.filter(i => 
              i.label.toLowerCase().includes(search.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  {section.title}
                </div>
                {filteredItems.map(item => (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      onClose();
                      setSearch('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] hover:text-black dark:hover:text-white transition-all text-left group"
                  >
                    <div className="text-neutral-400 group-hover:text-supabase-green transition-colors">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
