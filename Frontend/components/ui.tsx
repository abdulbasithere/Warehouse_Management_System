import React from 'react';
import { NavLink } from 'react-router-dom';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' }
> = ({ className = '', variant = 'primary', size = 'md', children, ...rest }) => {
  const base =
    'inline-flex items-center justify-center rounded-lg transition-all active:scale-[0.98] font-semibold disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';
  
  const variants = {
    primary: 'bg-neutral-600 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 border border-transparent',
    secondary: 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800 dark:hover:bg-neutral-800 shadow-sm',
    ghost: 'bg-transparent text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-white',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-transparent'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] h-6',
    md: 'px-3 py-1 text-xxs h-7',
    lg: 'px-4 py-1.5 text-xs h-9'
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...rest
}) => (
  <input
    className={`block w-full rounded-lg border border-neutral-200 bg-white px-2 h-7 text-xxs text-neutral-600 placeholder-neutral-300 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:ring-white dark:focus:border-white ${className}`}
    {...rest}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <select
    className={`block w-full rounded-lg border border-neutral-200 bg-white px-2 h-7 text-xxs text-neutral-600 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:focus:ring-white dark:focus:border-white ${className}`}
    {...rest}
  >
    {children}
  </select>
);

export const Badge: React.FC<{ color?: 'gray' | 'green' | 'blue' | 'red' | 'orange'; children: React.ReactNode }> =
  ({ color = 'gray', children }) => {
    const colors = {
      gray: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider rounded ${colors[color]}`}>
        {children}
      </span>
    );
  };

export const ProgressBar: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className = "" }) => {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
        <div
          className="h-full bg-neutral-400 dark:bg-neutral-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] font-bold text-neutral-400 tabular-nums">{pct}%</span>
    </div>
  );
};

export const SidebarLink: React.FC<{
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-1.5 text-xxs font-semibold transition-all rounded-lg ${
        isActive 
          ? 'bg-neutral-100 text-neutral-800 dark:bg-white dark:text-neutral-950 shadow-sm' 
          : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:text-neutral-500 dark:hover:text-white dark:hover:bg-neutral-900'
      }`
    }
  >
    {children}
  </NavLink>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-800 pb-2">
          <h3 className="text-xxs font-black uppercase tracking-widest text-neutral-400 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-neutral-300 hover:text-neutral-500 dark:hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};