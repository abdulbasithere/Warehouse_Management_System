import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { toast } from 'react-toastify';
import { useRole, useCreateRole, useUpdateRole } from '../api/hooks/useRoles';

// Define the available system permissions
const AVAILABLE_MODULES = [
  {
    module: 'Dashboard',
    permissions: [{ id: 'DASHBOARD_VIEW', label: 'View Dashboard' }]
  },
  {
    module: 'Inventory',
    permissions: [
      { id: 'INVENTORY_VIEW', label: 'View Inventory' },
      { id: 'INVENTORY_CREATE', label: 'Create Product' },
      { id: 'INVENTORY_EDIT', label: 'Edit Product' },
      { id: 'BARCODE_MGR', label: 'Manage Barcodes' }
    ]
  },
  {
    module: 'Inbound & Receiving',
    permissions: [
      { id: 'PO_VIEW', label: 'View Purchase Orders' },
      { id: 'PO_EDIT', label: 'Manage Purchase Orders' },
      { id: 'INBOUND_VIEW', label: 'View Inbound Shipments' },
      { id: 'INBOUND_EDIT', label: 'Manage Inbound Shipments' },
      { id: 'CROSSDOCK_SCAN', label: 'Crossdock Scanning' },
      { id: 'PUTAWAY_SCAN', label: 'Putaway Scanning' }
    ]
  },
  {
    module: 'Outbound & Fulfillment',
    permissions: [
      { id: 'ORDER_VIEW', label: 'View Sales Orders' },
      { id: 'ORDER_EDIT', label: 'Manage Orders' },
      { id: 'PICKING_SCAN', label: 'Picking Scanning' },
      { id: 'PACKING_SCAN', label: 'Packing & Dispatch' }
    ]
  },
  {
    module: 'Administration',
    permissions: [
      { id: 'USER_VIEW', label: 'View Users' },
      { id: 'USER_EDIT', label: 'Manage Users' },
      { id: 'ROLE_VIEW', label: 'View Roles' },
      { id: 'ROLE_EDIT', label: 'Manage Roles & Permissions' },
      { id: 'WAREHOUSE_MGR', label: 'Manage Warehouses & Specs' }
    ]
  }
];

export const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const { data: roleEntity, isLoading: loading } = useRole(id);
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const submitting = createRoleMutation.isPending || updateRoleMutation.isPending;

  const [form, setForm] = useState({
    roleName: '',
    description: '',
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (roleEntity) {
      setForm({
        roleName: roleEntity.roleName || roleEntity.name || '',
        description: roleEntity.description || '',
      });
      // Assuming roleEntity.permissions is an array of permission names/objects
      const perms = roleEntity.permissions || [];
      const permObj: Record<string, boolean> = {};
      perms.forEach((p: any) => {
        const pName = p.permissionName || p.id || p;
        permObj[pName] = true;
      });
      setSelectedPermissions(permObj);
    }
  }, [roleEntity]);

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roleName) {
      toast.error("Role Name is required");
      return;
    }
    
    // Extract array of active permissions
    const permissions = Object.entries(selectedPermissions)
      .filter(([_, isActive]) => isActive)
      .map(([id]) => id);

    const payload = {
      ...form,
      permissions
    };

    if (isEdit) {
      updateRoleMutation.mutate({ id: id!, data: payload }, {
        onSuccess: () => navigate('/roles')
      });
    } else {
      createRoleMutation.mutate(payload, {
        onSuccess: () => navigate('/roles')
      });
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-supabase-green border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Loading Role...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none uppercase tracking-tight">
            {isEdit ? `Edit Role: ${form.roleName}` : 'New Job Function (Role)'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/roles')}
            className="font-bold"
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={submitting}
            className="font-bold bg-supabase-green text-black border-none"
          >
            {submitting ? 'SAVING...' : 'COMMIT ROLE'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#232323] border border-neutral-200 dark:border-[#3e3e3e] rounded-lg shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] border-b border-neutral-100 dark:border-[#2e2e2e] pb-2">
            Role Identification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Job Title</label>
              <Input
                placeholder="e.g. Warehouse Supervisor"
                value={form.roleName}
                onChange={e => setForm({ ...form, roleName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">Description</label>
              <Input
                placeholder="Overview of this role..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-[0.2em] border-b border-neutral-100 dark:border-[#2e2e2e] pb-2">
            Specific Rights (Permissions)
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {AVAILABLE_MODULES.map(module => (
              <div key={module.module} className="bg-neutral-50 dark:bg-[#1c1c1c] p-4 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-3 uppercase tracking-wider">{module.module}</h3>
                <div className="space-y-3">
                  {module.permissions.map(perm => {
                    const isChecked = !!selectedPermissions[perm.id];
                    return (
                      <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-black focus:ring-black dark:text-white dark:focus:ring-white bg-white dark:bg-[#2c2c2c] transition-all cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">{perm.label}</span>
                          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">{perm.id}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleFormPage;
