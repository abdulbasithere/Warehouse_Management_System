import React from 'react';
import { Modal, Input, Button } from '../ui';
import { Eye, EyeOff } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwords: { current: string; new: string };
  setPasswords: (passwords: { current: string; new: string }) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (show: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (show: boolean) => void;
  onReset: () => void;
  isResetting: boolean;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  passwords,
  setPasswords,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  onReset,
  isResetting
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Change your password"
    >
      <div className="space-y-6">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Welcome back! Choose a new strong password and save it to proceed
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Current password</label>
            <div className="relative">
              <Input 
                type={showCurrentPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pr-10"
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
              />
              <button 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Input 
                type={showNewPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="pr-10"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
              <button 
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-100 dark:border-[#2e2e2e]">
          <Button 
            variant="primary" 
            className="w-full bg-[#1e4631] hover:bg-[#265a3f] border-[#2d6a4f] text-white font-bold"
            onClick={onReset}
            loading={isResetting}
          >
            Save new password
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: { firstName: string; lastName: string; email: string; username: string };
  setProfileData: (data: { firstName: string; lastName: string; email: string; username: string }) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profileData,
  setProfileData,
  onSave,
  isSaving
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Profile information"
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-neutral-50 dark:bg-[#1c1c1c] rounded-xl border border-neutral-100 dark:border-[#2e2e2e] overflow-hidden divide-y divide-neutral-100 dark:divide-[#2e2e2e]">
          <div className="flex items-center p-4 gap-4">
            <label className="w-32 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">First name</label>
            <Input 
              value={profileData.firstName} 
              onChange={e => setProfileData({...profileData, firstName: e.target.value})}
              placeholder="First name"
              className="flex-1"
            />
          </div>
          <div className="flex items-center p-4 gap-4">
            <label className="w-32 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Last name</label>
            <Input 
              value={profileData.lastName} 
              onChange={e => setProfileData({...profileData, lastName: e.target.value})}
              placeholder="Last name"
              className="flex-1"
            />
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-4">
              <label className="w-32 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Primary email</label>
              <div className="flex-1 relative">
                <Input 
                  value={profileData.email} 
                  readOnly
                  className="bg-neutral-100 dark:bg-[#2e2e2e] cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <p className="ml-36 text-[9px] text-neutral-400 font-medium tracking-tight">Used for account notifications</p>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-4">
              <label className="w-32 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Username</label>
              <Input 
                value={profileData.username} 
                onChange={e => setProfileData({...profileData, username: e.target.value})}
                placeholder="Username"
                className="flex-1"
              />
            </div>
            <p className="ml-36 text-[9px] text-neutral-400 font-medium tracking-tight">Display name used across dashboard</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="primary" 
            className="px-8 bg-[#1e4631] hover:bg-[#265a3f] border-[#2d6a4f] text-white font-bold"
            onClick={onSave}
            loading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
