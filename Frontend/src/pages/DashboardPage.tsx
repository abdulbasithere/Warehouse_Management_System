import React from 'react';
import { useAppSelector } from '../redux/hooks';

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  const stats = [
    { label: 'Pending Orders', value: '124', change: '+12%', color: 'blue' },
    { label: 'Picking Tasks', value: '42', change: '-3%', color: 'orange' },
    { label: 'Packing Queue', value: '18', change: '+5%', color: 'green' },
    { label: 'Inbound Today', value: '8', change: '0%', color: 'purple' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-black dark:text-white ">Command Center</h1>
          <p className="text-[10px] font-bold text-neutral-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-[#232323] rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-black text-neutral-500 ">System Status: </span>
            <span className="text-[10px] font-black text-green-500 ">Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-neutral-400 ">{stat.label}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-black dark:text-white tabular-nums">{stat.value}</span>
            </div>
            <div className={`h-1 w-full bg-neutral-50 dark:bg-[#2e2e2e] rounded-full overflow-hidden`}>
              <div className={`h-full bg-${stat.color}-500 w-2/3`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black text-black dark:text-white ">Throughput Analysis</h2>
            <select className="text-[9px] font-black bg-transparent border-none focus:ring-0 text-neutral-400">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-neutral-50 dark:bg-[#1c1c1c] rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 ">Chart Visualization Placeholder</span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#232323] border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-[11px] font-black text-black dark:text-white ">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 leading-tight">Order #SO-9234{i} was shipped</p>
                  <p className="text-[9px] text-neutral-400 font-medium">{i}0 mins ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 text-[9px] font-black text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            View All Activity →
          </button>
        </div>
      </div>
    </div>
  );
};
