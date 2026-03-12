import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Badge, Button, Input, Select, Modal } from '../components/ui';
import type { User, UserRole } from '../types';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser
} from '../api/hooks/useUsers';
import { useAppSelector } from '../redux/hooks';
import { Navigate } from 'react-router-dom';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAppSelector(state => state.auth);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  // Local state for debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Create User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('PICKER');

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('PICKER');

  // React Query Hooks
  const { data: queryData, isLoading: loading } = useUsers({ search: debouncedSearch, role: roleFilter === 'ALL' ? undefined : roleFilter });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const data = queryData?.data || [];
  const total = queryData?.total || 0;

  // Simple debounce effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (currentUser?.role !== 'MASTER') {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    await createUserMutation.mutateAsync({ name, email, role, isActive: true });

    setName('');
    setEmail('');
    setRole('PICKER');
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateUserMutation.mutateAsync({
      id: editingUser.id,
      data: { name: editName, email: editEmail, role: editRole }
    });

    setEditingUser(null);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) return;
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (err) {
      alert('Failed.');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (u: User) => (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-600 dark:text-neutral-300">{u.name}</span>
          <span className="text-[8px] text-neutral-400 uppercase tracking-tight">{u.email}</span>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: User) => (
        <Badge color={u.role === 'MASTER' ? 'blue' : u.role === 'PICKER' ? 'orange' : 'green'}>
          {u.role}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u: User) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDelete(u.id)} disabled={u.id === currentUser?.id}>Del</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xs font-black text-neutral-500 dark:text-neutral-300 uppercase tracking-widest">Team Management</h1>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">System Access Control</p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-40 sm:w-48 h-7"
          />
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="w-28 h-7"
          >
            <option value="ALL">All Roles</option>
            <option value="MASTER">Admins</option>
            <option value="PICKER">Pickers</option>
            <option value="PACKER">Packers</option>
          </Select>
        </div>
      </div>

      <div className="p-3 bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-2">
        <h2 className="text-[8px] font-black uppercase text-neutral-400 tracking-widest px-1">New Account</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          <Select value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="PICKER">Picker</option>
            <option value="PACKER">Packer</option>
            <option value="MASTER">Admin</option>
          </Select>
          <Button type="submit" disabled={createUserMutation.isPending}>{createUserMutation.isPending ? '...' : 'Add'}</Button>
        </form>
      </div>

      <DataTable<User>
        columns={columns}
        data={data}
        page={1}
        pageSize={100}
        total={total}
        loading={loading}
        onPageChange={() => { }}
      />

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Update User">
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Name</label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Email</label>
            <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Role</label>
            <Select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)}>
              <option value="PICKER">Picker</option>
              <option value="PACKER">Packer</option>
              <option value="MASTER">Admin</option>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button className="flex-1" type="submit" disabled={updateUserMutation.isPending}>{updateUserMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};