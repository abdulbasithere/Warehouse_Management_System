import React from 'react';
import { SidebarLink } from '../ui';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  Layers, 
  QrCode, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardList, 
  Truck, 
  FileText, 
  ChevronDown,
  Hand,
  Box,
  ArrowDownToLine,
  XCircle,
  ShoppingCart,
  RotateCcw,
  Users,
  User,
  ShieldCheck,
  BarChart3,
  Activity
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const [isCatalogExpanded, setIsCatalogExpanded] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden flex-col justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex flex-col w-full max-h-[85vh] bg-white dark:bg-[#1c1c1c] shadow-2xl rounded-t-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-[#2e2e2e]">
              <span className="text-sm font-bold tracking-tight text-black dark:text-white uppercase">ChaseValue</span>
              <button onClick={onClose} className="p-1 text-neutral-500 hover:text-black dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2 px-1">
                  DASHBOARD
                </div>
                <SidebarLink to="/" onClick={onClose}>
                  <LayoutDashboard size={14} /> Overview
                </SidebarLink>
                <SidebarLink to="/po-tracker" onClick={onClose}>
                  <Activity size={14} /> PO Tracker
                </SidebarLink>
                <SidebarLink to="/analytics" onClick={onClose}>
                  <BarChart3 size={14} /> Analytics
                </SidebarLink>
                
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 mt-4 flex items-center gap-2 px-1">
                  INVENTORY
                </div>
                <div className="space-y-1">
                  <div 
                    className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center justify-between mb-1 text-left px-3 cursor-pointer py-2 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] rounded-lg transition-colors"
                    onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-supabase-green" />
                      Catalog
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isCatalogExpanded ? 'rotate-180' : ''}`} />
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {isCatalogExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden border-l border-neutral-100 dark:border-[#2e2e2e] ml-[1.125rem] pl-2 space-y-1"
                      >
                        <SidebarLink to="/products" onClick={onClose}>
                          <Package size={14} /> Products
                        </SidebarLink>
                        <SidebarLink to="/variants" onClick={onClose}>
                          <Layers size={14} /> Variants
                        </SidebarLink>
                        <SidebarLink to="/barcodes" onClick={onClose}>
                          <QrCode size={14} /> Barcodes
                        </SidebarLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            <div className="mt-2 space-y-1">
              <SidebarLink to="/shelf-locations" onClick={onClose}>
                <Warehouse size={14} /> Shelves
              </SidebarLink>
              <SidebarLink to="/product-mapping" onClick={onClose}>
                <ArrowLeftRight size={14} /> Mapping
              </SidebarLink>
              <SidebarLink to="/inventory-adjustments" onClick={onClose}>
                <ClipboardList size={14} /> Adjustments
              </SidebarLink>
            </div>

            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 mt-4 flex items-center gap-2 px-1">
              OPERATIONS
            </div>
            <SidebarLink to="/picking" onClick={onClose}>
              <Hand size={14} /> Picking
            </SidebarLink>
            <SidebarLink to="/packing" onClick={onClose}>
              <Box size={14} /> Packing
            </SidebarLink>
            <SidebarLink to="/putaway" onClick={onClose}>
              <ArrowDownToLine size={14} /> Putaway
            </SidebarLink>
            <SidebarLink to="/inbound-shipments" onClick={onClose}>
              <Truck size={14} /> Inbound
            </SidebarLink>
            <SidebarLink to="/Purchase-Order" onClick={onClose}>
              <FileText size={14} /> Purchase Order
            </SidebarLink>
            <SidebarLink to="/transfer-orders" onClick={onClose}>
              <ArrowLeftRight size={14} /> Transfer Order
            </SidebarLink>
            <SidebarLink to="/refusals" onClick={onClose}>
              <XCircle size={14} /> Refusal
            </SidebarLink>

            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 mt-4 flex items-center gap-2 px-1">
              MANAGEMENT
            </div>
            <SidebarLink to="/orders" onClick={onClose}>
              <ShoppingCart size={14} /> Orders
            </SidebarLink>
            <SidebarLink to="/returns" onClick={onClose}>
              <RotateCcw size={14} /> Returns
            </SidebarLink>
            <SidebarLink to="/warehouses" onClick={onClose}>
              <Warehouse size={14} /> Warehouse
            </SidebarLink>
            <SidebarLink to="/suppliers" onClick={onClose}>
              <Users size={14} /> Suppliers
            </SidebarLink>
            <SidebarLink to="/users" onClick={onClose}>
              <User size={14} /> Users
            </SidebarLink>
            <SidebarLink to="/roles" onClick={onClose}>
              <ShieldCheck size={14} /> Roles & Permissions
            </SidebarLink>
          </div>
        </div>
        <div className="p-4 border-t border-neutral-100 dark:border-[#2e2e2e]">
          <p className="text-[10px] text-neutral-400 text-center uppercase font-bold tracking-widest">ChaseValue v1.0</p>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
);
};
