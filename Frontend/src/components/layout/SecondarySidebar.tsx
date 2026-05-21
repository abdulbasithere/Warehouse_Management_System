import React, { useState } from 'react';
import { SidebarLink } from '../ui';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Layers, 
  QrCode, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardList,
  ChevronDown,
  Hand,
  Box,
  ArrowDownToLine,
  Truck,
  FileText,
  XCircle,
  ShoppingCart,
  RotateCcw,
  Users,
  User,
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  Activity
} from 'lucide-react';

type NavCategory = 'dashboard' | 'inventory' | 'operations' | 'management';

interface SecondarySidebarProps {
  activeCategory: NavCategory;
  isHovered: boolean;
}

export const SecondarySidebar: React.FC<SecondarySidebarProps> = ({ activeCategory, isHovered }) => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const renderSecondaryNav = () => {
    switch (activeCategory) {
      case 'inventory':
        return (
          <>
            <div className="mb-6 px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Inventory</div>
            
            <div className="space-y-2">
              <div className="space-y-0.5">
                <button 
                  onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                  className="w-full px-3 mb-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center justify-between group transition-colors hover:text-black dark:hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-supabase-green" />
                    Catalog
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${isCatalogOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isCatalogOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-0.5 border-l border-neutral-100 dark:border-[#2e2e2e] ml-[1.125rem] pl-2"
                    >
                      <SidebarLink to="/products">
                        <Package size={14} /> Products
                      </SidebarLink>
                      <SidebarLink to="/variants">
                        <Layers size={14} /> Variants
                      </SidebarLink>
                      <SidebarLink to="/barcodes">
                        <QrCode size={14} /> Barcodes
                      </SidebarLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1">
                <SidebarLink to="/shelf-locations">
                  <Warehouse size={14} /> Shelves
                </SidebarLink>
                <SidebarLink to="/product-mapping">
                  <ArrowLeftRight size={14} /> Mapping
                </SidebarLink>
                <SidebarLink to="/inventory-adjustments">
                  <ClipboardList size={14} /> Adjustments
                </SidebarLink>
              </div>
            </div>
          </>
        );
      case 'operations':
        return (
          <>
            <div className="mb-4 px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Operations</div>
            <div className="space-y-1">
              <SidebarLink to="/picking"><Hand size={14} /> Picking</SidebarLink>
              <SidebarLink to="/packing"><Box size={14} /> Packing</SidebarLink>
              <SidebarLink to="/putaway"><ArrowDownToLine size={14} /> Putaway</SidebarLink>
              <SidebarLink to="/inbound-shipments"><Truck size={14} /> Inbound</SidebarLink>
              <SidebarLink to="/Purchase-Order"><FileText size={14} /> Purchase Order</SidebarLink>
              <SidebarLink to="/transfer-orders"><ArrowLeftRight size={14} /> Transfer Order</SidebarLink>
              <SidebarLink to="/refusals"><XCircle size={14} /> Refusal</SidebarLink>
            </div>
          </>
        );
      case 'management':
        return (
          <>
            <div className="mb-4 px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Management</div>
            <div className="space-y-1">
              <SidebarLink to="/orders"><ShoppingCart size={14} /> Orders</SidebarLink>
              <SidebarLink to="/returns"><RotateCcw size={14} /> Returns</SidebarLink>
              <SidebarLink to="/warehouses"><Warehouse size={14} /> Warehouse</SidebarLink>
              <SidebarLink to="/suppliers"><Users size={14} /> Suppliers</SidebarLink>
              <SidebarLink to="/users"><User size={14} /> Users</SidebarLink>
              <SidebarLink to="/roles"><ShieldCheck size={14} /> Roles & Permissions</SidebarLink>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="mb-4 px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Dashboard</div>
            <div className="space-y-1">
              <SidebarLink to="/"><LayoutDashboard size={14} /> Overview</SidebarLink>
              <SidebarLink to="/po-tracker"><Activity size={14} /> PO Tracker</SidebarLink>
              <SidebarLink to="/analytics"><BarChart3 size={14} /> Analytics</SidebarLink>
            </div>
          </>
        );
    }
  };

  return (
    <aside 
      className={`hidden lg:flex flex-col border-r border-neutral-100 dark:border-[#2e2e2e] bg-white dark:bg-[#232323] transition-all duration-300 ease-in-out ${isHovered ? 'w-56' : 'w-0 opacity-0 overflow-hidden'}`}
    >
      <div className="flex h-12 items-center px-4 border-b border-neutral-100 dark:border-[#2e2e2e] overflow-hidden whitespace-nowrap">
        <span className="text-xs font-bold tracking-tight text-black dark:text-white uppercase">ChaseValue</span>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto no-scrollbar">
        {renderSecondaryNav()}
      </nav>
    </aside>
  );
};
