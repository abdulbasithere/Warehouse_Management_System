import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Button, Select, Input } from '../components/ui';
import { Plus, Search } from 'lucide-react';

interface RefusalRecord {
  id: string;
  department: string;
  purchaseOrder: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  createDate: string;
  status: string;
}

export const RefusalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const departments = ['Apparel', 'Electronics', 'Home & Kitchen', 'Beauty', 'Toys', 'Sports', 'Automotive', 'Grocery'];

  // Mock data for the list
  const [refusals] = useState<RefusalRecord[]>([
    {
      id: 'REF-001',
      department: 'Apparel',
      purchaseOrder: 'PO-2024-001',
      vendorId: 'V0000810',
      vendorName: 'BULAND BROTHERS',
      quantity: 5,
      createDate: '2024-03-20',
      status: 'Pending'
    },
    {
      id: 'REF-002',
      department: 'Electronics',
      purchaseOrder: 'PO-2024-005',
      vendorId: 'V0000922',
      vendorName: 'TECH SOLUTIONS',
      quantity: 12,
      createDate: '2024-03-21',
      status: 'Verified'
    }
  ]);

  const columns: Column<RefusalRecord>[] = [
    {
      key: 'id',
      header: 'Reference',
      render: (r) => <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">{r.id}</span>
    },
    {
      key: 'vendorId',
      header: 'Supplier',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-bold">-</span>
          <span className="text-[9px] text-neutral-400 font-medium truncate max-w-[150px]">{r.vendorName}</span>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (r) => (
        <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20">
          {r.department}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (r) => <span className="text-[11px] font-black text-black dark:text-white tabular-nums">{r.quantity}</span>
    },
    {
      key: 'createDate',
      header: 'Date',
      render: (r) => <span className="text-[10px] font-medium text-neutral-500 tabular-nums">{r.createDate}</span>
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <div className="flex justify-end pr-2">
          <button className="px-2.5 h-6 text-[9px] font-black uppercase border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            Details
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Refusal</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">History & Refusal Tracking</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <div className="w-full sm:w-48">
              <Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="">DEPARTMENT</option>
                {departments.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </Select>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
              <Input
                placeholder="Search Vendor ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button 
              variant="primary" 
              className="w-full sm:w-auto font-bold uppercase tracking-tight whitespace-nowrap"
              onClick={() => navigate('/refusals/new')}
            >
              + NEW REFUSAL
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] rounded-md border border-neutral-100 dark:border-neutral-900 shadow-sm overflow-hidden">
        <CustomTable
          data={refusals}
          columns={columns}
          loading={false}
        />
      </div>
    </div>
  );
};

export default RefusalsPage;
