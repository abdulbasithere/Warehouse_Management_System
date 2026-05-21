import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomTable, Column } from '../components/CustomTable';
import { Button, Input } from '../components/ui';
import { useRoles } from '../api/hooks/useRoles';

export const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: queryData, isLoading: loading } = useRoles();
  const data = queryData?.data || [];

  const filteredData = data.filter((r: any) => 
    (r.roleName || r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<any>[] = [
    {
      key: 'roleName',
      header: 'Role Name',
      render: (r: any) => (
        <span className="font-bold text-neutral-600 dark:text-neutral-300">{r.roleName || r.name}</span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (r: any) => (
        <span className="text-xs text-neutral-500">{r.description || '-'}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r: any) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(`/roles/edit/${r.roleId || r.id}`)}
          >
            Edit Rights
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none">Roles & Permissions</h1>
          <p className="text-[9px] text-neutral-400 font-bold mt-0.5">Manage hierarchical security access</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button 
            variant="primary" 
            onClick={() => navigate('/roles/new')}
            className="w-full sm:w-auto font-bold whitespace-nowrap h-8 px-6"
          >
            + NEW ROLE
          </Button>
        </div>
      </div>

      <CustomTable<any>
        columns={columns}
        data={filteredData}
        page={1}
        pageSize={100}
        total={filteredData.length}
        loading={loading}
        onPageChange={() => { }}
        getRowId={r => (r.roleId || r.id || Math.random()).toString()}
      />
    </div>
  );
};

export default RolesPage;
