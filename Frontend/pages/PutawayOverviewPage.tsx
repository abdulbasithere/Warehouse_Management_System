import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
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
  const isMaster = user?.role === 'MASTER';

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
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-black dark:text-white uppercase tracking-wider">Inventory Putaway</h1>
        </div>

        <div className="flex flex-col gap-2">
          {/* Main Filters: Product Search and Status */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-1 items-center gap-2 bg-neutral-50 dark:bg-neutral-900/50 p-1 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <div className="flex-1">
                <Input
                  placeholder="Search Product ID..."
                  className="!h-6 py-0 text-[10px] border-none bg-transparent focus:ring-0 shadow-none"
                  value={searchProductId}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="w-px h-3 bg-neutral-200 dark:bg-neutral-800" />
              <Select
                className="w-24 !h-6 py-0 text-[10px] border-none bg-transparent focus:ring-0 shadow-none font-bold"
                value={searchStatus}
                onChange={handleStatusChange}
              >
                <option value="">Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </div>

            {/* Admin Actions: Picker Assignment and Import */}
            {isMaster && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900/50 p-1 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm">
                  <Select
                    className="flex-1 sm:w-28 !h-6 py-0 text-[10px] border-none bg-transparent focus:ring-0 shadow-none"
                    value={selectedPickerId}
                    onChange={(e) => setSelectedPickerId(e.target.value)}
                  >
                    <option value="">Picker</option>
                    {pickersData?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    variant="primary"
                    className="!h-6 px-3 rounded-md shadow-sm"
                    onClick={handleAssignPicker}
                    disabled={assignPickerMutation.isPending || selectedRowIds.length === 0}
                  >
                    {assignPickerMutation.isPending ? '...' : 'Assign'}
                  </Button>
                </div>

                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full sm:w-auto !h-6 px-3 rounded-lg shadow-sm border-neutral-200 dark:border-neutral-800"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={bulkCreateMutation.isPending}
                  >
                    {bulkCreateMutation.isPending ? '...' : 'Import Excel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DataTable<Putaway>
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
