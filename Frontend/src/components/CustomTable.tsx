import React from 'react';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page?: number;
  pageSize?: number;
  total?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  selectableRows?: boolean;
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string | undefined;
  isRowSelectable?: (row: T) => boolean;
  rowClassName?: (row: T) => string;
  height?: string | number;
}

export function CustomTable<T>({
  columns,
  data,
  page = 1,
  pageSize = 10,
  total = 0,
  loading = false,
  onPageChange,
  selectableRows = false,
  selectedRowIds = [],
  onSelectionChange,
  getRowId = (r: any) => r.id || r.sku || r.saleOrderNumber || r.pickingListNumber || r.putawayNumber || String(Math.random()),
  isRowSelectable = () => true,
  rowClassName = () => '',
  height = 'auto',
}: CustomTableProps<T>) {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const selectableIds = data.filter(isRowSelectable).map(getRowId);
      onSelectionChange(selectableIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedRowIds.includes(id)) {
      onSelectionChange(selectedRowIds.filter(x => x !== id));
    } else {
      onSelectionChange([...selectedRowIds, id]);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="w-full flex-1 flex flex-col border border-neutral-200 dark:border-[#2e2e2e] rounded-lg overflow-hidden bg-white dark:bg-[#232323] shadow-sm min-h-0">
      <div className="flex-1 overflow-auto" style={{ maxHeight: height !== 'auto' ? height : undefined }}>
        <table className="w-full text-left border-collapse min-w-full">
          <thead className="bg-white dark:bg-[#232323] border-b border-neutral-200 dark:border-[#2e2e2e] sticky top-0 z-10">
            <tr>
              {selectableRows && (
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    className="accent-supabase-green"
                    onChange={handleSelectAll}
                    checked={data.length > 0 && data.filter(isRowSelectable).every(r => selectedRowIds.includes(getRowId(r)))}
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key} className={`px-3 py-2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-tight whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-[#2e2e2e]">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectableRows ? 1 : 0)} className="px-3 py-8 text-center text-xs font-medium text-neutral-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-supabase-green border-t-transparent rounded-full animate-spin"></div>
                    Syncing Data...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectableRows ? 1 : 0)} className="px-3 py-8 text-center text-xs font-medium text-neutral-400">
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const id = getRowId(row);
                const isSelected = selectedRowIds.includes(id);
                const isSelectable = isRowSelectable(row);
                
                const rowKey = (id && id !== 'undefined') ? id : `row-${idx}`;
                const customClass = rowClassName(row);
                
                return (
                  <tr key={rowKey} className={`hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors ${isSelected ? 'bg-neutral-50 dark:bg-[#2e2e2e]' : ''} ${customClass}`}>
                    {selectableRows && (
                      <td className="px-3 py-2">
                        <input 
                          type="checkbox" 
                          className="accent-supabase-green disabled:opacity-20"
                          checked={isSelected}
                          disabled={!isSelectable}
                          onChange={() => handleSelectRow(id)}
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className={`px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap ${col.className || ''}`}>
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#232323] border-t border-neutral-200 dark:border-[#2e2e2e]">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 dark:border-[#2e2e2e] disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 dark:border-[#2e2e2e] disabled:opacity-30 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
