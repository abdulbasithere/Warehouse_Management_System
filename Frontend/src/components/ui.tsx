import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, ChevronDown, Check } from 'lucide-react';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean }
> = ({ className = '', variant = 'primary', size = 'md', children, loading, ...rest }) => {
  const base =
    'inline-flex items-center justify-center rounded-md transition-all active:scale-[0.98] font-medium disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap border transition-colors';

  const variants = {
    primary: 'bg-[#175c36] text-white border-[#24b47e] hover:bg-[#1e7545] dark:bg-[#175c36] dark:text-white dark:border-[#24b47e] dark:hover:bg-[#1e7545]',
    secondary: 'bg-white text-black border-neutral-200 hover:bg-neutral-50 dark:bg-[#232323] dark:text-neutral-100 dark:border-[#3e3e3e] dark:hover:bg-[#2e2e2e] shadow-sm',
    ghost: 'bg-transparent text-neutral-500 border-transparent hover:text-black dark:text-neutral-400 dark:hover:text-white',
    danger: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-red-900/30'
  };

  const sizes = {
    sm: 'px-2 h-5 text-[8px]',
    md: 'px-2.5 h-6 text-[10px] font-black',
    lg: 'px-4 h-8 text-xs font-black'
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </div>
      ) : children}
    </button>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...rest }, ref) => (
    <input
      ref={ref}
      className={`block w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 h-6 text-[10px] font-medium text-black placeholder-neutral-400 focus:ring-1 focus:ring-supabase-green focus:border-supabase-green focus:outline-none dark:border-[#2e2e2e] dark:bg-[#1c1c1c] dark:text-white dark:focus:ring-supabase-green dark:focus:border-supabase-green transition-all ${className}`}
      {...rest}
    />
  )
);
Input.displayName = 'Input';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <div className="relative">
    <select
      className={`block w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 pr-8 h-6 text-[10px] font-medium text-black focus:ring-1 focus:ring-[#24b47e] focus:border-[#24b47e] focus:outline-none dark:border-[#3e3e3e] dark:bg-[#232323] dark:text-white dark:focus:ring-[#24b47e] dark:focus:border-[#24b47e] appearance-none transition-all cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500 dark:text-neutral-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

export const Badge: React.FC<{ color?: 'gray' | 'green' | 'blue' | 'red' | 'orange' | 'purple'; children: React.ReactNode; variant?: 'primary' | 'secondary'; className?: string }> =
  ({ color = 'gray', variant = 'primary', className = '', children }) => {
    const colors = {
      gray: 'bg-neutral-100 text-neutral-600 dark:bg-[#2e2e2e] dark:text-neutral-400',
      green: 'bg-supabase-green/10 text-supabase-green border border-supabase-green/20',
      blue: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20',
      red: 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20',
      orange: 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20',
      purple: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/20'
    };

    // Variant "secondary" uses the component's variant-based styling if class provided
    const baseStyle = variant === 'secondary' ? '' : colors[color];

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${baseStyle} ${className}`}>
        {children}
      </span>
    );
  };

export const ProgressBar: React.FC<{ value: number; max: number; className?: string; displayType?: 'percentage' | 'ratio' | 'both' }> = ({ value, max, className = "", displayType = 'percentage' }) => {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const renderText = () => {
    if (displayType === 'ratio') {
      return `${value} / ${max}`;
    }
    if (displayType === 'both') {
      return `${value} / ${max} (${pct}%)`;
    }
    return `${pct}%`;
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-[#2e2e2e]">
        <div
          className="h-full bg-supabase-green transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 tabular-nums shrink-0">{renderText()}</span>
    </div>
  );
};

export const SidebarLink: React.FC<{
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ to, children, onClick, className = '' }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-md tracking-tight ${isActive
        ? 'bg-neutral-100 text-black dark:bg-[#2e2e2e] dark:text-supabase-green'
        : 'text-neutral-500 hover:text-black hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-[#1c1c1c]'
      } ${className}`
    }
  >
    {children}
  </NavLink>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]'
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-[#232323] w-full ${sizes[size]} rounded-xl border border-neutral-200 dark:border-[#3e3e3e] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-[#2e2e2e]">
          <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] rounded-full transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#232323] rounded-xl border border-neutral-200 dark:border-[#3e3e3e] shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Dropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  fullWidth?: boolean;
}> = ({ trigger, children, className = '', align = 'left', fullWidth = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer h-full">
        {trigger}
      </div>
      {isOpen && (
        <div 
          className={`absolute z-50 bg-white dark:bg-[#232323] border border-neutral-200 dark:border-[#3e3e3e] rounded-lg shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100 ${
            fullWidth ? 'w-full' : 'min-w-[180px]'
          } ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, selected, disabled, className = '' }) => (
  <button
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] disabled:opacity-30 disabled:cursor-not-allowed ${
      selected ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
    } ${className}`}
  >
    <div className={`w-1.5 h-1.5 rounded-full transition-all ${selected ? 'bg-neutral-600 dark:bg-white scale-100' : 'bg-transparent scale-0'}`} />
    {children}
  </button>
);

export const SearchableDropdown: React.FC<{
  options: string[];
  value: string;
  onChange: (val: string) => void;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  menuTitle?: string;
}> = ({ options, value, onChange, onSearchChange, placeholder = "Select...", className = "", triggerClassName = "", disabled, menuTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(o => 
    (o || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(search);
    }
  }, [search, onSearchChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-md border px-3 h-6 text-[10px] font-medium transition-all disabled:opacity-50 ${
          triggerClassName || 'border-neutral-200 bg-neutral-50 text-black dark:border-[#2e2e2e] dark:bg-[#1c1c1c] dark:text-white'
        } ${isOpen ? 'ring-1 ring-supabase-green border-supabase-green' : ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[70] mt-1 w-full bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-[#3e3e3e] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {menuTitle && (
            <div className="px-3 py-2 text-[8px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest border-b border-neutral-100 dark:border-[#2e2e2e]">
              {menuTitle}
            </div>
          )}
          <div className="p-2 border-b border-neutral-100 dark:border-[#2e2e2e]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" size={12} />
              <input
                autoFocus
                className="w-full bg-neutral-50 dark:bg-[#111] border border-neutral-100 dark:border-[#2e2e2e] rounded px-7 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-supabase-green text-black dark:text-white"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[140px] overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <button
                  key={`${opt}-${index}`}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors text-left"
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${value === opt ? 'bg-[#24b47e] dark:bg-supabase-green scale-100' : 'bg-transparent scale-0'}`} />
                  <span className="truncate">{opt}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-[10px] text-neutral-400 uppercase font-black">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Checkbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}> = ({ checked, onChange, disabled = false, id, className = "" }) => {
  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={`relative w-4 h-4 rounded-[4px] border-2 transition-all flex items-center justify-center select-none outline-none focus:ring-1 focus:ring-supabase-green/50 shrink-0 ${
        checked
          ? 'bg-[#3ecf8e] border-black text-[#1c1c1c] dark:border-white'
          : 'bg-white border-neutral-300 dark:bg-[#232323] dark:border-neutral-700'
      } ${disabled ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {checked && <Check size={11} strokeWidth={4} className="text-neutral-900" />}
    </button>
  );
};

