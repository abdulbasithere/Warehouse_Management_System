import React from 'react';
import { Button } from './ui';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  selectableRows?: boolean;
  selectedRowIds?: string[];
  getRowId?: (row: T) => string;
  onSelectionChange?: (ids: string[]) => void;
  isRowSelectable?: (row: T) => boolean;
  height?: string;
}

export function DataTable<T>({
  columns,
  data,
  page,
  pageSize,
  total,
  loading,
  onPageChange,
  selectableRows,
  selectedRowIds = [],
  getRowId,
  onSelectionChange,
  isRowSelectable,
  height = '70vh'
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleToggleAll = () => {
    if (!getRowId || !onSelectionChange) return;
    const selectableRows = isRowSelectable ? data.filter(isRowSelectable) : data;
    const selectableIds = selectableRows.map(r => getRowId(r));

    if (selectedRowIds.length === selectableIds.length && selectableIds.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(selectableIds);
    }
  };

  const handleToggleRow = (row: T) => {
    if (!getRowId || !onSelectionChange) return;
    const id = getRowId(row);
    if (selectedRowIds.includes(id)) {
      onSelectionChange(selectedRowIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedRowIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative border border-neutral-100 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm flex flex-col overflow-hidden">
        {/* Custom height and enabled scroll with extremely compact rows */}
        <div
          className="overflow-auto relative"
          style={{ height: height }}
        >
          <table className="w-full text-left text-[10px] border-collapse min-w-full">
            <thead className="sticky top-0 z-20 bg-neutral-50 dark:bg-neutral-950 shadow-sm">
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                {selectableRows && (
                  <th className="w-8 px-2 py-1 align-middle">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-neutral-300 text-neutral-400 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:checked:bg-white"
                      checked={data.length > 0 && selectedRowIds.length === data.length}
                      onChange={handleToggleAll}
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th key={col.key} className={`whitespace-nowrap px-2 py-1 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-tight text-[8px] align-middle ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y divide-neutral-50 dark:divide-neutral-800 transition-opacity duration-200 ${loading ? 'opacity-30' : 'opacity-100'}`}>
              {data.length === 0 && !loading ? (
                <tr>
                  <td colSpan={columns.length + (selectableRows ? 1 : 0)} className="px-3 py-10 text-center text-neutral-400 font-medium italic text-xxs">
                    No results.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const id = getRowId ? getRowId(row) : String(idx);
                  const selected = selectedRowIds.includes(id);
                  return (
                    <tr key={id} className={`transition-all hover:bg-neutral-50/20 dark:hover:bg-neutral-950/50 ${selected ? 'bg-neutral-50/50 dark:bg-neutral-950/80' : ''}`}>
                      {selectableRows && (
                        <td className="px-2 py-0.5">
                          <input
                            type="checkbox"
                            className="h-3 w-3 rounded border-neutral-300 text-neutral-400 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:checked:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
                            checked={selected}
                            onChange={() => handleToggleRow(row)}
                            disabled={isRowSelectable ? !isRowSelectable(row) : false}
                          />
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={col.key} className={`whitespace-nowrap px-2 py-0.5 text-neutral-500 dark:text-neutral-400 font-medium ${col.className || ''}`}>
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Compact Dots Loading Overlay (no text) */}
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/5 dark:bg-black/5 backdrop-blur-[1px]">
              <div className="flex items-center gap-1 p-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg shadow-lg">
                <div className="flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-neutral-300 animate-bounce"></div>
                  <div className="h-1 w-1 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1 w-1 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-0.5">
        <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
          {total} Total <span className="mx-1 text-neutral-200">|</span> Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || loading}>
            Prev
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || loading}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}