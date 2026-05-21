import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge, Input, Select, Modal } from '../components/ui';
import { useUser, useCreateUser, useUpdateUser } from '../api/hooks/useUsers';
import { useRoles } from '../api/hooks/useRoles';
import { useWarehouses } from '../api/hooks/useWarehouses';
import type { User } from '../types';
import { 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Settings, 
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  ChevronRight,
  Plus,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { toast } from 'react-toastify';

export const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const { data: user, isLoading: loading } = useUser(id);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: warehousesData } = useWarehouses({});
  
  const rolesList = rolesData?.data || [];
  const warehousesList = warehousesData?.data || [];

  const [form, setForm] = useState<any>({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    isActive: true
  });

  // State for user roles (with warehouse mapping)
  const [assignedRoles, setAssignedRoles] = useState<any[]>([]);
  const [selectedAssignedRoleId, setSelectedAssignedRoleId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id || user.userId,
        userId: user.userId || user.id || '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        isActive: user.isActive !== false,
      });

      // Mocking assigned roles based on junction table logic
      if (user.roles) {
        setAssignedRoles(user.roles.map((r: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          roleId: r.roleId || r.id,
          roleName: r.roleName || r.name,
          warehouseId: r.warehouseId || null,
          warehouseName: r.warehouseName || (r.warehouseId ? 'Specific Warehouse' : 'Global (All)')
        })));
      }
    }
  }, [user]);

  const handleSave = async () => {
    const payload = {
      ...form,
      roles: assignedRoles, // Send the rich roles object back
      password: isEdit && !form.password ? undefined : form.password
    };

    if (isEdit) {
      updateUserMutation.mutate({ id: id!, data: payload }, {
        onSuccess: () => navigate('/users')
      });
    } else {
      createUserMutation.mutate(payload, {
        onSuccess: () => navigate('/users')
      });
    }
  };

  const handleAssignRole = (role: any) => {
    if (assignedRoles.find(r => r.roleId === role.roleId)) {
      toast.warn('Role already assigned');
      return;
    }
    setAssignedRoles([...assignedRoles, {
      id: Math.random().toString(36).substr(2, 9),
      roleId: role.roleId || role.id,
      roleName: role.roleName || role.name,
      warehouseId: null,
      warehouseName: 'Global (All)'
    }]);
    setShowAssignModal(false);
  };

  const removeRole = () => {
    if (selectedAssignedRoleId) {
      setAssignedRoles(assignedRoles.filter(r => r.id !== selectedAssignedRoleId));
      setSelectedAssignedRoleId(null);
    }
  };

  const updateRoleWarehouse = (warehouseId: string | null) => {
    if (selectedAssignedRoleId) {
      const warehouse = warehousesList.find((w: any) => (w.id || w.warehouseId).toString() === warehouseId);
      setAssignedRoles(assignedRoles.map(r => r.id === selectedAssignedRoleId ? {
        ...r,
        warehouseId,
        warehouseName: warehouse ? (warehouse.warehouseName || warehouse.name) : 'Global (All)'
      } : r));
      setShowSecurityModal(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Loading Profiles...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-[#1c1c1c]/50 p-2 rounded-md border border-neutral-100 dark:border-neutral-900">
        <div className="text-left">
          <h1 className="text-sm font-black text-black dark:text-white leading-none uppercase tracking-widest">
            {isEdit ? 'Update User' : 'Add New User'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => navigate(-1)} 
            className="uppercase font-bold whitespace-nowrap h-6 px-6 text-[10px]"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            loading={updateUserMutation.isPending || createUserMutation.isPending} 
            className="uppercase font-bold whitespace-nowrap h-6 px-6 text-[10px] shadow-sm"
          >
            Commit Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Identity & Details Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#232323] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm p-4 space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <ShieldCheck size={14} className="text-green-500" />
              <h2 className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Identities & Access</h2>
            </div>

            <div className="space-y-2.5 flex-1">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-1.5 ml-1 opacity-70">
                  <UserIcon size={10} /> User ID *
                </label>
                <Input 
                  value={form.userId}
                  onChange={e => setForm({...form, userId: e.target.value})}
                  placeholder="Enter User ID"
                  className="h-8 text-[11px] font-bold"
                  readOnly={isEdit}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-1.5 ml-1 opacity-70">
                  <UserIcon size={10} /> Full Name *
                </label>
                <Input 
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  placeholder="Enter full name"
                  className="h-8 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-1.5 ml-1 opacity-70">
                  <Mail size={10} /> Email *
                </label>
                <Input 
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="name@chasevalue.pk"
                  className="h-8 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-1.5 ml-1 opacity-70">
                  <Phone size={10} /> Phone
                </label>
                <Input 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+92 3XX XXXXXXX"
                  className="h-8 text-[11px] font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-1.5 ml-1 opacity-70">
                  <MapPin size={10} /> Address
                </label>
                <Input 
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Residential or Office street"
                  className="h-8 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] flex items-center gap-1.5 ml-1 opacity-70">
                  <Lock size={10} /> Password {isEdit && '(Change)'}
                </label>
                <Input 
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="h-8 text-[11px] font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 opacity-80">Status</span>
                <div 
                  onClick={() => setForm({...form, isActive: !form.isActive})}
                  className={`w-9 h-4.5 rounded-full transition-all cursor-pointer p-0.5 ${form.isActive ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm ${form.isActive ? 'translate-x-4.5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#232323] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
             {/* Toolbar */}
             <div className="bg-neutral-50 dark:bg-[#1a1a1a] border-b border-neutral-100 dark:border-neutral-800 p-1.5 flex flex-wrap items-center gap-1">
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 px-3 h-7 text-[9px] font-black uppercase text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-all"
                >
                  <UserPlus size={12} className="text-blue-500" /> Assign Roles
                </button>
                <button 
                  disabled={!selectedAssignedRoleId}
                  onClick={removeRole}
                  className="flex items-center gap-2 px-3 h-7 text-[9px] font-black uppercase text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={12} /> Remove
                </button>
                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
                <button 
                  disabled={!selectedAssignedRoleId}
                  onClick={() => setShowSecurityModal(true)}
                  className="flex items-center gap-2 px-3 h-7 text-[9px] font-black uppercase text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ShieldAlert size={12} className="text-orange-500" /> Data Level Security
                </button>
             </div>

             <div className="flex-1 overflow-auto bg-white/50 dark:bg-[#232323]/50">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight size={13} className="text-neutral-400 rotate-90" />
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded">
                       <UserIcon size={11} className="text-neutral-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">User's Roles</span>
                  </div>

                  <div className="ml-5 space-y-1">
                    {assignedRoles.length === 0 ? (
                      <div className="py-24 flex flex-col items-center justify-center opacity-30 text-neutral-400">
                         <ShieldAlert size={28} className="mb-2" />
                         <p className="text-[9px] font-black uppercase tracking-[0.2em]">No roles assigned to this identity</p>
                      </div>
                    ) : (
                      assignedRoles.map((r) => (
                        <div 
                          key={r.id}
                          onClick={() => setSelectedAssignedRoleId(selectedAssignedRoleId === r.id ? null : r.id)}
                          className={`group flex items-center justify-between p-2 rounded cursor-pointer border-l-2 transition-all ${
                            selectedAssignedRoleId === r.id 
                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500' 
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded ${selectedAssignedRoleId === r.id ? 'bg-blue-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                              <ShieldCheck size={12} />
                            </div>
                            <div>
                                <span className={`text-[11px] font-black uppercase tracking-tight ${selectedAssignedRoleId === r.id ? 'text-blue-600' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                  {r.roleName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                   <Building2 size={8} className="text-neutral-400" />
                                   <span className="text-[8px] font-bold uppercase text-neutral-400 tracking-widest">{r.warehouseName}</span>
                                </div>
                            </div>
                          </div>
                          
                          {r.warehouseId && (
                            <Badge color="orange" variant="secondary" className="scale-75 origin-right">Warehouse Scoped</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Assign Role Modal */}
      <Modal 
        isOpen={showAssignModal} 
        onClose={() => setShowAssignModal(false)}
        title="Assign New Roles"
      >
        <div className="space-y-3">
          <Input placeholder="Search roles..." className="mb-4" />
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {rolesList.map(r => (
              <button 
                key={r.id || r.roleId} 
                onClick={() => handleAssignRole(r)}
                className="w-full flex items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:text-blue-500 transition-colors">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{r.roleName || r.name}</span>
                </div>
                <Plus size={14} className="text-neutral-300 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Data Security Modal */}
      <Modal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        title="Data Level Security"
      >
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900 rounded-lg flex gap-3">
             <ShieldAlert className="text-orange-500 shrink-0" size={16} />
             <p className="text-[10px] text-orange-700 dark:text-orange-300 leading-normal">
               Scoping a role to a specific warehouse limits the user's data access in this role to only resources within that chosen warehouse. Leave <strong>"Global (All)"</strong> for organization-wide access.
             </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">Select Warehouse Scope</label>
            <Select 
              value={assignedRoles.find(r => r.id === selectedAssignedRoleId)?.warehouseId || ''}
              onChange={(e) => updateRoleWarehouse(e.target.value || null)}
            >
              <option value="">Global (All Warehouses)</option>
              {warehousesList.map((w: any) => (
                <option key={w.id || w.warehouseId} value={w.id || w.warehouseId}>
                  {w.warehouseName || w.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="pt-2">
             <Button onClick={() => setShowSecurityModal(false)} className="w-full h-8 uppercase tracking-widest font-black">Close & Return</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserFormPage;
