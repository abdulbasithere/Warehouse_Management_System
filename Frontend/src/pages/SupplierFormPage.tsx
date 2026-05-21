import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge, Input, Select } from '../components/ui';
import { useSupplier, useCreateSupplier, useUpdateSupplier } from '../api/hooks/useSuppliers';

interface Supplier {
  id?: string;
  supplierId: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
  status: boolean;
}

export const SupplierFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const { data: supplier, isLoading: loading } = useSupplier(id);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const submitting = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<Supplier>({
    supplierId: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
    status: true
  });

  useEffect(() => {
    if (supplier) {
      const statusVal = supplier.status;
      const isActive = statusVal === true || statusVal === 1 || statusVal === 'true' || statusVal === 'Active';
      
      setForm({
        id: supplier.id,
        supplierId: supplier.supplierId || supplier.SupplierID || '',
        firstName: supplier.firstName || supplier.Name || '',
        lastName: supplier.lastName || '',
        address: supplier.address || '',
        city: supplier.city || supplier.City || '',
        phone: supplier.phone || supplier.Phone || '',
        status: isActive
      });
    }
  }, [supplier]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      updateMutation.mutate({ id: id!, data: form }, {
        onSuccess: () => navigate('/suppliers')
      });
    } else {
      createMutation.mutate(form, {
        onSuccess: () => navigate('/suppliers')
      });
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-supabase-green border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Syncing Supplier...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 pb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-black dark:text-white leading-none uppercase tracking-tight">
              {isEdit ? `${form.firstName} ${form.lastName}` : 'New Supplier'}
            </h1>
            <Badge color={form.status ? 'green' : 'gray'}>
              {form.status ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="font-bold"
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={submitting}
            className="font-bold"
          >
            {submitting ? 'SAVING...' : 'COMMIT CHANGES'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] border border-neutral-200 dark:border-[#3e3e3e] rounded-lg overflow-hidden shadow-sm">
        <form onSubmit={handleSave} className="p-6 space-y-8">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] border-b border-neutral-100 dark:border-[#2e2e2e] pb-2">Identities & Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Supplier ID</label>
                <Input
                  placeholder="e.g. SUP-001"
                  value={form.supplierId}
                  onChange={e => setForm({ ...form, supplierId: e.target.value })}
                  disabled={isEdit}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">First Name</label>
                <Input
                  placeholder="Enter first name"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Last Name</label>
                <Input
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] border-b border-neutral-100 dark:border-[#2e2e2e] pb-2">Contact & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Phone Number</label>
                <Input
                  placeholder="+92..."
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">City</label>
                <Input
                  placeholder="Operating city"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">System Status</label>
                <Select
                  value={form.status ? 'active' : 'inactive'}
                  onChange={e => setForm({ ...form, status: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Full Address</label>
              <Input
                placeholder="Street address, Area..."
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormPage;
