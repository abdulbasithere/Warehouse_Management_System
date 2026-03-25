import React, { useState } from 'react';
import { Button } from '../components/ui';

import { GetInRow, MOCK_DATA }  from './GetInTypes';
import { GetInFilters }         from './GetInFilters';
import { GetInTable }           from './GetInTable';
import { GetInRowModal }        from './GetInRowModal';
import { GetInPageEntry }       from './GetInPageEntry';

const GetInPage: React.FC = () => {
  
  const [view, setView] = useState<'list' | 'entry'>('list'); 
  const [tableData, setTableData] = useState<GetInRow[]>(MOCK_DATA);
  const [search,          setSearch]          = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [statusFilter,    setStatusFilter]    = useState('All');
  const [page,            setPage]            = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [activeRow, setActiveRow] = useState<GetInRow | null>(null);
  const openModal = (row: GetInRow, mode: 'view' | 'edit') => {
    setActiveRow(row);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleSave = (updated: GetInRow) => {
    setTableData(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const handleFilterClear = () => {
    setSearch('');
    setWarehouseFilter('All');
    setStatusFilter('All');
    setPage(1);
  };

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = tableData.filter(row => {
    const q           = search.toLowerCase();
    const matchSearch = !q
      || row.po.toLowerCase().includes(q)
      || row.refNo.toLowerCase().includes(q)
      || row.shipment.toLowerCase().includes(q);
    const matchWH     = warehouseFilter === 'All' || row.warehouse === warehouseFilter;
    const matchStatus = statusFilter    === 'All' || row.status    === statusFilter;
    return matchSearch && matchWH && matchStatus;
  });

  // ── Entry view ────────────────────────────────────────────────────────────
  if (view === 'entry') {
    return (
      <GetInPageEntry
        onDiscard={() => setView('list')}
        onSave={() => setView('list')}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 pb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/40 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
        <div className="space-y-0.5">
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest leading-none">
            Get In
          </h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">
            Inbound shipment management
          </p>
        </div>
        <Button
          variant="primary" size="sm"
          onClick={() => setView('entry')}
          className="h-7 px-3 text-[9px] font-black uppercase tracking-widest"
        >
          + Add New
        </Button>
      </div>

   
      <GetInFilters
        search={search}
        warehouseFilter={warehouseFilter}
        statusFilter={statusFilter}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        onWarehouseChange={v => { setWarehouseFilter(v); setPage(1); }}
        onStatusChange={v => { setStatusFilter(v); setPage(1); }}
        onClear={handleFilterClear}
      />

      <GetInTable
        data={filtered}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onView={row => openModal(row, 'view')}
        onEdit={row => openModal(row, 'edit')}
        onOpenModal={(row) => openModal(row, 'view')}
      />

      {/* View / Edit Modal */}
      <GetInRowModal
        isOpen={modalOpen}
        mode={modalMode}
        data={activeRow}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default GetInPage;