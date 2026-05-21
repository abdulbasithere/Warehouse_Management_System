import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateUserProfile } from '../redux/slices/authSlice';
import { resetPassword as resetPasswordApi, updateUser } from '../api/endpoints/users';
import { toast } from 'react-toastify';

// Layout Components
import { SidebarIconBar } from './layout/SidebarIconBar';
import { SecondarySidebar } from './layout/SecondarySidebar';
import { MobileSidebar } from './layout/MobileSidebar';
import { Header } from './layout/Header';
import { CommandPalette } from './layout/CommandPalette';
import { ResetPasswordModal, ProfileSettingsModal } from './layout/Modals';

interface LayoutShellProps {
  children?: React.ReactNode;
}

type NavCategory = 'dashboard' | 'inventory' | 'operations' | 'management';

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { user } = useAppSelector(state => state.auth);
  const { theme } = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NavCategory>('dashboard');
  const [isHovered, setIsHovered] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [profileSettingsModalOpen, setProfileSettingsModalOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    username: user?.email || ''
  });
  const [paletteSearch, setPaletteSearch] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    }
    setSidebarOpen(false);
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.fullName?.split(' ')[0] || '',
        lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        username: user.email || ''
      });
    }
  }, [user]);

  const handleResetPassword = async () => {
    if (!passwords.new) {
      toast.error('Please enter a new password');
      return;
    }
    setIsResetting(true);
    try {
      await resetPasswordApi(user!.id, passwords.new);
      setResetPasswordModalOpen(false);
      setPasswords({ current: '', new: '' });
      toast.success('Password reset successful');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      await updateUser(user!.id || user!.userId!.toString(), { fullName, email: profileData.email });
      dispatch(updateUserProfile({ fullName, email: profileData.email }));
      setProfileSettingsModalOpen(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Set active category based on path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') setActiveCategory('dashboard');
    else if (['/products', '/shelf-locations', '/Product-mapping', '/inventory-adjustment'].includes(path)) setActiveCategory('inventory');
    else if (['/picking', '/packing', '/putaway', '/GetIn', '/Purchase-Order'].includes(path)) setActiveCategory('operations');
    else if (['/orders', '/returns', '/warehouse', '/supplier', '/users'].includes(path)) setActiveCategory('management');
  }, [location.pathname]);

  if (!user) return <Outlet />;

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-[#1c1c1c] text-neutral-900 dark:text-neutral-100">
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div 
        className="hidden lg:flex h-screen sticky top-0 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarIconBar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />
        <SecondarySidebar 
          activeCategory={activeCategory} 
          isHovered={isHovered} 
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeCategory={activeCategory}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenProfileSettings={() => setProfileSettingsModalOpen(true)}
          onOpenResetPassword={() => setResetPasswordModalOpen(true)}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          profileRef={profileRef}
        />
        
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 md:p-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        search={paletteSearch}
        setSearch={setPaletteSearch}
      />

      <ResetPasswordModal 
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        passwords={passwords}
        setPasswords={setPasswords}
        showCurrentPassword={showCurrentPassword}
        setShowCurrentPassword={setShowCurrentPassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        onReset={handleResetPassword}
        isResetting={isResetting}
      />

      <ProfileSettingsModal 
        isOpen={profileSettingsModalOpen}
        onClose={() => setProfileSettingsModalOpen(false)}
        profileData={profileData}
        setProfileData={setProfileData}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
};
