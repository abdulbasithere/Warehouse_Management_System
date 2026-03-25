// ─── Types ────────────────────────────────────────────────────────────────────
export type StatusKey = 'received' | 'pending' | 'in_transit' | 'draft';
export type SaveMode  = 'save' | 'draft';
export type ModalMode = 'view' | 'edit';

export interface GetInRow {
  id: number;
  refNo: string;
  po: string;
  shipment: string;
  supplier: string;
  warehouse: string;
  quantity: number;
  status: StatusKey;
  date: string;
  qualityCheck?: boolean;
}

export interface PoItem {
  id: number;
  packageType: string;
  packageQty: string;
  location: string;
}

export interface AttachmentFile {
  name: string;
  size: number;
  file: File;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const WAREHOUSES       = ['WH-A', 'WH-B', 'WH-C'];
export const PO_NUMBERS       = ['PO-1042', 'PO-1043', 'PO-1044', 'PO-1045', 'PO-1046'];
export const PACKAGE_TYPES    = ['Bora', 'Carton', 'Shopper'];
export const LOCATION_OPTIONS = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01', 'C-02'];
export const STATUS_OPTIONS: StatusKey[] = ['received', 'pending', 'in_transit', 'draft'];

export const STATUS_CONFIG: Record<StatusKey, {
  label: string; bg: string; text: string; dot: string;
}> = {
  received:   { 
    label: 'Received',   
    bg: 'bg-black/10 dark:bg-white/10', 
    text: 'text-black dark:text-white', 
    dot: 'bg-black dark:bg-white' 
  },
  pending:    { 
    label: 'Pending',    
    bg: 'bg-black/10 dark:bg-white/10',   
    text: 'text-black dark:text-white',   
    dot: 'bg-black dark:bg-white'   
  },
  in_transit: { 
    label: 'In Transit', 
    bg: 'bg-black/10 dark:bg-white/10',    
    text: 'text-black dark:text-white',    
    dot: 'bg-black dark:bg-white'    
  },
  draft:      { 
    label: 'Draft',      
    bg: 'bg-black/10 dark:bg-white/10', 
    text: 'text-black dark:text-white', 
    dot: 'bg-black dark:bg-white' 
  },
};

export const STATUS_CONFIG_MODAL: Record<StatusKey, {
  label: string; bg: string; text: string; dot: string;
}> = {
  received:   { label: 'Received',   bg: 'rgba(16,185,129,0.1)',  text: '#10b981', dot: '#10b981' },
  pending:    { label: 'Pending',    bg: 'rgba(245,158,11,0.1)',  text: '#f59e0b', dot: '#f59e0b' },
  in_transit: { label: 'In Transit', bg: 'rgba(59,130,246,0.1)',  text: '#3b82f6', dot: '#3b82f6' },
  draft:      { label: 'Draft',      bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', dot: '#9ca3af' },
};

export const MOCK_DATA: GetInRow[] = [
  { id: 1, refNo: 'GI-2025-001', po: 'PO-1042', shipment: 'SH-8801', supplier: 'Al-Fatah Traders',   warehouse: 'WH-A', quantity: 240, status: 'received',   date: '2025-03-10', qualityCheck: true  },
  { id: 2, refNo: 'GI-2025-002', po: 'PO-1043', shipment: 'SH-8802', supplier: 'Raza Brothers',       warehouse: 'WH-B', quantity: 120, status: 'pending',    date: '2025-03-11', qualityCheck: false },
  { id: 3, refNo: 'GI-2025-003', po: 'PO-1044', shipment: 'SH-8803', supplier: 'Metro Supply Co.',    warehouse: 'WH-A', quantity: 580, status: 'in_transit', date: '2025-03-12', qualityCheck: false },
  { id: 4, refNo: 'GI-2025-004', po: 'PO-1045', shipment: 'SH-8804', supplier: 'Karachi Imports',     warehouse: 'WH-C', quantity: 90,  status: 'draft',      date: '2025-03-13', qualityCheck: false },
  { id: 5, refNo: 'GI-2025-005', po: 'PO-1046', shipment: 'SH-8805', supplier: 'Crown Distributors', warehouse: 'WH-B', quantity: 310, status: 'received',   date: '2025-03-14', qualityCheck: true  },
  { id: 6, refNo: 'GI-2025-006', po: 'PO-1047', shipment: 'SH-8806', supplier: 'Al-Fatah Traders',   warehouse: 'WH-A', quantity: 75,  status: 'pending',    date: '2025-03-14', qualityCheck: false },
  { id: 7, refNo: 'GI-2025-007', po: 'PO-1048', shipment: 'SH-8807', supplier: 'Pak Logistics',      warehouse: 'WH-C', quantity: 430, status: 'received',   date: '2025-03-15', qualityCheck: true  },
];