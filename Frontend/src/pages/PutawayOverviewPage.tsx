import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, Select } from '../components/ui';
import type { Putaway } from '../types';
import { usePutaways, useBulkCreatePutaway, useAssignPickerToPutaway } from '../api/hooks/usePutaway';
import { usePickers } from '../api/hooks/useUsers';
import { useAppSelector } from '../redux/hooks';
import * as XLSX from 'xlsx';

export const PutawayOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedPickerId, setSelectedPickerId] = useState<string>('');
  const [searchProductId, setSearchProductId] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector(state => state.auth.user);
  const isMaster = typeof user?.role === 'string' ? user.role === 'MASTER' : (user?.role as any)?.name === 'MASTER';

  // React Query Hooks
  const { data: queryData, isLoading: loading } = usePutaways({
    page,
    productId: searchProductId,
    status: searchStatus
  });
  const { data: pickersData } = usePickers();
  const bulkCreateMutation = useBulkCreatePutaway();
  const assignPickerMutation = useAssignPickerToPutaway();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const items = jsonData.map(row => ({
          productId: row.productId || row.ProductId || row['Product ID'],
          totalUnits: row.totalUnits || row.TotalUnits || row['Total Units'] || row.quantity || row.Quantity
        })).filter(item => item.productId && item.totalUnits);

        if (items.length === 0) {
          alert('No valid items found in Excel. Ensure columns are "productId" and "totalUnits".');
          return;
        }

        await bulkCreateMutation.mutateAsync({ items });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Failed to parse Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAssignPicker = async () => {
    if (!selectedPickerId) {
      alert('Please select a picker');
      return;
    }
    if (selectedRowIds.length === 0) {
      alert('Please select at least one putaway task');
      return;
    }

    try {
      await assignPickerMutation.mutateAsync({
        putawayIds: selectedRowIds.map(id => parseInt(id)),
        userId: parseInt(selectedPickerId)
      });
      setSelectedRowIds([]);
    } catch (error) {
      console.error('Assignment error:', error);
    }
  };

  const columns = [
    { key: 'num', header: 'Putaway #', render: (r: Putaway) => <span className="font-bold text-black dark:text-white">{r.putawayNumber}</span> },
    { key: 'prod', header: 'Product', render: (r: any) => <div><div className="text-xs font-bold">{r.productName}</div><div className="text-[10px] text-neutral-400">{r.productId}</div></div> },
    { key: 'recv', header: 'Qty', render: (r: Putaway) => <span className="tabular-nums">{r.putawayQuantity} / {r.totalQuantity}</span> },
    { key: 'status', header: 'Status', render: (r: Putaway) => <Badge color={r.status === 'COMPLETED' ? 'green' : 'orange'}>{r.status}</Badge> },
    {
      key: 'ptadate',
      header: 'Date',
      className: 'hidden sm:table-cell',
      render: (r: Putaway) => <span className="text-neutral-400">{r.createDate.slice(0, 10)}</span>
    },
    { key: 'act', header: '', render: (r: Putaway) => <Button variant="secondary" size="sm" onClick={() => navigate(`/putaway/${r.id}`)}>Open</Button> }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchProductId(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-3 pb-8 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Putaway</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Relocation movement & history</p>
        </div>

        {isMaster && (
          <div className="flex items-center gap-1.5 p-1 bg-white/50 dark:bg-[#232323]/50 rounded-md border border-neutral-100 dark:border-neutral-900">
            <select
              className="h-6.5 px-2 text-[9px] font-black rounded bg-transparent focus:outline-none min-w-[100px]"
              value={selectedPickerId}
              onChange={(e) => setSelectedPickerId(e.target.value)}
            >
              <option value="">Picker</option>
              {pickersData?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="secondary"
              className="h-6.5 px-3 text-[8px] font-black "
              onClick={handleAssignPicker}
              disabled={assignPickerMutation.isPending || selectedRowIds.length === 0}
            >
              {assignPickerMutation.isPending ? '…' : 'Assign'}
            </Button>
            <div className="w-px h-3.5 bg-neutral-200 dark:bg-[#2e2e2e] mx-0.5" />
            <Button
              size="sm"
              variant="ghost"
              className="h-6.5 px-2 text-[8px] font-black "
              onClick={() => fileInputRef.current?.click()}
              disabled={bulkCreateMutation.isPending}
            >
              Import
            </Button>
            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 px-0.5">
        <Input
          placeholder="Search items..."
          className="h-8 text-[10px] min-w-[200px]"
          value={searchProductId}
          onChange={handleSearchChange}
        />
        <select
          className="h-8 px-2 text-[9px] font-black rounded-md bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-900 text-neutral-500 dark:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
          value={searchStatus}
          onChange={handleStatusChange}
        >
          <option value="">Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <CustomTable<Putaway>
        columns={columns}
        data={data}
        page={page}
        pageSize={10}
        total={total}
        loading={loading}
        onPageChange={setPage}
        selectableRows
        selectedRowIds={selectedRowIds}
        getRowId={(r) => r.id.toString()}
        onSelectionChange={setSelectedRowIds}
        isRowSelectable={(r) => r.status !== 'COMPLETED'}
      />
    </div>
  );
};
