import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Moon, Sun, LogOut, Lock, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/themeSlice';

interface HeaderProps {
  activeCategory: string;
  onOpenCommandPalette: () => void;
  onOpenSidebar: () => void;
  onOpenProfileSettings: () => void;
  onOpenResetPassword: () => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  profileRef: React.RefObject<HTMLDivElement | null>;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeCategory, 
  onOpenCommandPalette, 
  onOpenSidebar,
  onOpenProfileSettings,
  onOpenResetPassword,
  profileOpen,
  setProfileOpen,
  profileRef
}) => {
  const { user } = useAppSelector(state => state.auth);
  const { theme } = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-6 bg-white/80 dark:bg-[#1c1c1c]/80 backdrop-blur-md border-b border-neutral-100 dark:border-[#2e2e2e]">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-7 h-7 rounded-lg bg-supabase-green flex items-center justify-center">
          <span className="text-[11px] font-black text-black">W</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-neutral-400">
          <span className="capitalize">{activeCategory}</span>
          {location.pathname === '/' ? (
            <>
              <span className="text-neutral-200 dark:text-neutral-700">/</span>
              <span className="text-black dark:text-white capitalize">Overview</span>
            </>
          ) : (
            location.pathname.split('/').filter(Boolean).filter(s => s !== 'edit').map((segment, index, array) => {
              const path = `/${array.slice(0, index + 1).join('/')}`;
              const isLast = index === array.length - 1;
              return (
                <React.Fragment key={path}>
                  <span className="text-neutral-200 dark:text-neutral-700">/</span>
                  {isLast ? (
                    <span className="text-black dark:text-white capitalize">{segment.replace(/-/g, ' ')}</span>
                  ) : (
                    <Link to={path} className="hover:text-black dark:hover:text-white transition-colors capitalize">
                      {segment.replace(/-/g, ' ')}
                    </Link>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Search Icon */}
        <button 
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <Search size={20} />
        </button>

        {/* Search Bar Trigger */}
        <div 
          onClick={onOpenCommandPalette}
          className="relative hidden sm:flex items-center w-64 cursor-pointer group"
        >
          <div className="absolute left-3 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
            <Search size={14} />
          </div>
          <div className="w-full h-9 pl-9 pr-12 bg-neutral-100 dark:bg-[#2e2e2e] border-none rounded-full text-xs text-neutral-400 flex items-center group-hover:bg-neutral-200 dark:group-hover:bg-[#3e3e3e] transition-all">
            Search...
          </div>
          <div className="absolute right-3 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-[9px] font-bold text-neutral-400">
            Ctrl K
          </div>
        </div>

        {/* Profile Icon with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black hover:opacity-80 transition-all shadow-sm"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#232323] border border-neutral-200 dark:border-[#3e3e3e] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-neutral-100 dark:border-[#2e2e2e]">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user.email}</p>
              </div>
              
              <div className="py-1">
                <button 
                  onClick={onOpenProfileSettings}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors"
                >
                  <User size={14} /> Profile settings
                </button>
                <button 
                  onClick={onOpenResetPassword}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors"
                >
                  <Lock size={14} /> Reset password
                </button>
              </div>

              <div className="py-1 border-t border-neutral-100 dark:border-[#2e2e2e]">
                <div className="px-4 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Theme</div>
                <button 
                  onClick={() => dispatch(toggleTheme())}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    <span className="capitalize">{theme}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-supabase-green" />
                </button>
              </div>

              <div className="py-1 border-t border-neutral-100 dark:border-[#2e2e2e]">
                <button 
                  onClick={() => { dispatch(logoutUser()); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg bg-neutral-100 dark:bg-[#2e2e2e] text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};
