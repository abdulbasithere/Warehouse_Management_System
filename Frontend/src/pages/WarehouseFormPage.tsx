import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge, Input, Select } from '../components/ui';
import { useWarehouse, useCreateWarehouse, useUpdateWarehouse } from '../api/hooks/useWarehouses';

interface Warehouse {
  id?: number;
  name: string;
  phone: string;
  zip: string;
  longitude: string;
  latitude: string;
  address: string;
  city?: string;
  isActive?: boolean;
}

export const WarehouseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const { data: warehouse, isLoading: loading } = useWarehouse(id);
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();

  const submitting = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<Warehouse>({
    name: '', phone: '', zip: '', longitude: '', latitude: '', address: '', city: '', isActive: true
  });

  useEffect(() => {
    if (warehouse) {
      const statusStr = String(warehouse.status || '').toLowerCase();
      setForm({
        id: warehouse.id,
        name: warehouse.name || '',
        phone: warehouse.phone || '',
        zip: warehouse.zip || '',
        longitude: warehouse.longitude || '',
        latitude: warehouse.latitude || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        isActive: warehouse.isActive === true || warehouse.isActive === 1 || warehouse.status === true || warehouse.status === 1 || statusStr === 'active' || (warehouse.isActive === undefined && warehouse.status === undefined),
      });
    }
  }, [warehouse]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      status: form.isActive
    };
    if (isEdit) {
      updateMutation.mutate({ id: id!, data: payload }, {
        onSuccess: () => navigate('/warehouses')
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/warehouses')
      });
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-supabase-green border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Syncing Warehouse...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 pb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-black dark:text-white leading-none uppercase tracking-tight">
              {isEdit ? `${form.name}` : 'New Warehouse'}
            </h1>
            <Badge color={form.isActive ? 'green' : 'gray'}>
              {form.isActive ? 'ACTIVE' : 'INACTIVE'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Internal Name</label>
                <Input
                  placeholder="e.g. Primary Node"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">System Status</label>
                <Select
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={e => setForm({ ...form, isActive: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] border-b border-neutral-100 dark:border-[#2e2e2e] pb-2">Network & Logistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Contact Line</label>
                <Input
                  placeholder="+92 3XX..."
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Local Postcode</label>
                <Input
                  placeholder="XXXXX"
                  value={form.zip}
                  onChange={e => setForm({ ...form, zip: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">City</label>
                <Input
                  placeholder="City name..."
                  value={form.city || ''}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Full Physical Location</label>
              <Input
                placeholder="Street address, Area..."
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Geo-Lat</label>
                <Input
                  placeholder="0.0000"
                  value={form.latitude}
                  onChange={e => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Geo-Long</label>
                <Input
                  placeholder="0.0000"
                  value={form.longitude}
                  onChange={e => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseFormPage;
