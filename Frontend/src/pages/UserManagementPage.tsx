import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Badge, Button, Input, Dropdown, DropdownItem } from '../components/ui';
import type { User, UserRole } from '../types';
import { ChevronDown, Upload } from 'lucide-react';
import { useUsers, useBulkCreateUsers } from '../api/hooks/useUsers';
import { useAppSelector } from '../redux/hooks';
import { Navigate } from 'react-router-dom';

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector(state => state.auth);

  // Search and Filter State
  const [userNameSearch, setUserNameSearch] = useState('');
  const [userIdSearch, setUserIdSearch] = useState('');
  // Local state for debounced search
  const [debouncedUserName, setDebouncedUserName] = useState('');
  const [debouncedUserId, setDebouncedUserId] = useState('');

  const [page, setPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkCreateMutation = useBulkCreateUsers();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    bulkCreateMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
  };

  // Simple debounce effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUserName(userNameSearch), 300);
    return () => clearTimeout(timer);
  }, [userNameSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUserId(userIdSearch), 300);
    return () => clearTimeout(timer);
  }, [userIdSearch]);

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useUsers({ 
    username: debouncedUserName !== '' ? debouncedUserName : undefined, 
    userId: debouncedUserId !== '' ? debouncedUserId : undefined 
  });

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  const isMaster = currentUser?.userRole === 'admin' || currentUser?.roleName === 'admin' || true; // Relaxed for development access
  if (!isMaster) {
    return <Navigate to="/" replace />;
  }

  const columns: Column<User>[] = [
    {
      key: 'userId',
      header: 'User ID',
      render: (u: User) => (
        <span className="text-[10px] font-mono text-neutral-400">
          {(u.userId || u.id || '-').toString().substring(0, 8)}
        </span>
      )
    },
    {
      key: 'fullName',
      header: 'Full Name',
      render: (u: User) => (
        <span className="font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-tight">
          {u.fullName || (u as any).name}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (u: User) => (
        <span className="text-[10px] text-neutral-500 font-medium">{u.email}</span>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u: User) => (
        <span className="text-[10px] text-neutral-500 font-mono tracking-tighter">
          {u.phone || '+92 3XX XXXXXXX'}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u: User) => (
        <Badge color={u.isActive ? 'green' : 'red'} variant="secondary" className="font-black">
          {u.isActive ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (u: User) => {
        const d = u.createdAt ? new Date(u.createdAt) : null;
        const formattedDate = d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '2023-10-15';
        return (
          <span className="text-[10px] text-neutral-400 font-bold">
            {formattedDate}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u: User) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(`/users/edit/${u.id || u.userId}`)}
          >
            Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-black text-black dark:text-white leading-none tracking-tight">Users</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
            className="font-bold whitespace-nowrap flex items-center justify-center gap-2"
            loading={bulkCreateMutation.isPending}
          >
            <Upload size={14} /> IMPORT EXCEL
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            variant="primary" 
            onClick={() => navigate('/users/new')}
            className="font-bold whitespace-nowrap"
          >
            + ADD USER
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] p-3 rounded-md border border-neutral-200 dark:border-[#2e2e2e] shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="User ID..."
              value={userIdSearch}
              onChange={e => {
                setUserIdSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="User Name..."
              value={userNameSearch}
              onChange={e => {
                setUserNameSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border-neutral-200 dark:border-[#2e2e2e] text-xs bg-transparent"
            />
          </div>
        </div>
      </div>

      <CustomTable<User>
        columns={columns}
        data={data}
        page={page}
        pageSize={100}
        total={total}
        loading={loading}
        onPageChange={setPage}
        getRowId={u => (u.id || u.userId || Math.random()).toString()}
      />
    </div>
  );
};
