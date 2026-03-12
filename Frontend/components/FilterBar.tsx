
import React from 'react';
import { Button } from './ui';

interface FilterBarProps {
  onApply: () => void;
  onReset: () => void;
  children: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onApply, onReset, children }) => {
  return (
    <div className="flex flex-col gap-5 p-5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-900 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-900 pt-4">
        <Button variant="ghost" size="sm" className="font-bold" onClick={onReset}>Clear Filters</Button>
        <Button size="md" className="px-6" onClick={onApply}>Apply Results</Button>
      </div>
    </div>
  );
};
