import React from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Button } from '../components/ui';
import { GetInRow, STATUS_CONFIG } from './GetInTypes';

interface GetInTableProps {
  data: GetInRow[];
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onView: (row: GetInRow) => void;
  onEdit: (row: GetInRow) => void;
  onOpenModal: (row: GetInRow) => void;
}

export const GetInTable: React.FC<GetInTableProps> = ({
  data, page, pageSize, onPageChange, onView, onEdit,onOpenModal,
}) => {
  const columns: Column<GetInRow>[] = [
    {
      key: 'refNo',
      header: 'Ref No',
      render: (r) => (
        <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          {r.refNo}
        </span>
      ),
    },
    {
      key: 'po',
      header: 'PO #',
      render: (r) => (
        <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300">{r.po}</span>
      ),
    },
    {
      key: 'shipment',
      header: 'Shipment',
      render: (r) => (
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{r.shipment}</span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (r) => (
        <span className="text-[10px] text-neutral-600 dark:text-neutral-300 truncate max-w-[160px] block">{r.supplier}</span>
      ),
    },
    {
      key: 'warehouse',
      header: 'WH',
      render: (r) => (
        <span className="text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md">
          {r.warehouse}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (r) => (
        <span className="text-[10px] font-black tabular-nums text-neutral-700 dark:text-neutral-300">
          {r.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const sc = STATUS_CONFIG[r.status];
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide ${sc.bg} ${sc.text}`}>
            <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        );
      },
    },
    {
  key: 'qualityCheck',
  header: 'QC',
  render: (r) => (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold 
      ${r.qualityCheck ? 'text-black dark:text-white' : 'text-black dark:text-white opacity-40'}`}
    >
      <span
        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] font-black
        ${r.qualityCheck ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-300 dark:bg-gray-600 text-transparent'}`}
      >
        {r.qualityCheck ? '✓' : ''}
      </span>
      {r.qualityCheck ? 'Pass' : '—'}
    </span>
  ),
},
    {
      key: 'date',
      header: 'Date',
      render: (r) => (
        <span className="text-[10px] text-neutral-400">
          {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            variant="primary" size="sm"
            onClick={() => onView(r)}
            className="h-6 px-2 text-[8px] font-bold uppercase tracking-wide"
          >
            View
          </Button>
          <Button
            variant="primary" size="sm"
            onClick={() => onEdit(r)}
            className="h-6 px-2 text-[8px] font-bold uppercase tracking-wide"
          >
            Edit
          </Button>
         <Button
        variant="primary"
        size="sm"
        onClick={() => onOpenModal(r)}
        className="h-6 px-2 text-[6px] font-bold uppercase tracking-wide"
      >
        Location
      </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<GetInRow>
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={data.length}
      loading={false}
      onPageChange={onPageChange}
    />
  );
};