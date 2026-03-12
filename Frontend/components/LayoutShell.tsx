import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarLink, Button } from './ui';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logoutUser } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/themeSlice';

export const LayoutShell: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const { theme } = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    }
    setSidebarOpen(false);
  }, [user, location.pathname, navigate]);

  if (!user) return <Outlet />;

  const NavItems = (onItemClick?: () => void) => (
    <div className="flex flex-col gap-0.5">
      {user.role === 'MASTER' && (
        <>
          <SidebarLink to="/orders" onClick={onItemClick}>Orders</SidebarLink>
          <SidebarLink to="/returns" onClick={onItemClick}>Returns</SidebarLink>
          <SidebarLink to="/inventory-adjustment" onClick={onItemClick}>Adjustments</SidebarLink>
          <SidebarLink to="/picking" onClick={onItemClick}>Picking</SidebarLink>
          <SidebarLink to="/packing" onClick={onItemClick}>Packing</SidebarLink>
          <SidebarLink to="/putaway" onClick={onItemClick}>Putaway</SidebarLink>
          <SidebarLink to="/products" onClick={onItemClick}>Catalog</SidebarLink>
          <SidebarLink to="/shelf-locations" onClick={onItemClick}>Shelves</SidebarLink>
          <SidebarLink to="/Purchase-Order" onClick={onItemClick}>Purchase Order</SidebarLink>
          <SidebarLink to="/users" onClick={onItemClick}>Users</SidebarLink>
        </>
      )}
      {(user.role === 'PICKER') && (
        <>
          <SidebarLink to="/picking" onClick={onItemClick}>Picking</SidebarLink>
          <SidebarLink to="/putaway" onClick={onItemClick}>Putaway</SidebarLink>
        </>
      )}
      {user.role === 'PACKER' && <SidebarLink to="/packing" onClick={onItemClick}>Packing</SidebarLink>}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex flex-col w-44 border-r border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950">
        <div className="flex h-10 items-center px-4 border-b border-neutral-50 dark:border-neutral-900">
          <span className="text-[9px] font-black tracking-widest text-neutral-400 dark:text-white uppercase">ChaseValue</span>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto no-scrollbar">
          {NavItems()}
        </nav>
        <div className="p-2 border-t border-neutral-50 dark:border-neutral-900 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="h-5 w-5 rounded bg-neutral-100 dark:bg-white flex items-center justify-center text-[9px] font-black text-neutral-600 dark:text-black">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden leading-none">
              <p className="truncate text-[9px] font-bold text-neutral-600 dark:text-white">{user.name}</p>
              <p className="truncate text-[7px] text-neutral-400 uppercase tracking-widest font-bold">{user.role}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full text-[8px] h-6" onClick={() => { dispatch(logoutUser()); navigate('/login'); }}>Logout</Button>
        </div>
      </aside>

      {/* Mobile Sidebar (Hamburger Menu Backdrop) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Drawer (Hamburger Content) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-[70] w-56 bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-900 transition-transform duration-300 transform md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-10 items-center justify-between px-4 border-b border-neutral-50 dark:border-neutral-900">
          <span className="text-[9px] font-black tracking-widest text-neutral-400 dark:text-white uppercase">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="text-neutral-300">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto no-scrollbar">
          {NavItems(() => setSidebarOpen(false))}
        </nav>
        <div className="p-3 border-t border-neutral-50 dark:border-neutral-900">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => { dispatch(logoutUser()); navigate('/login'); }}>Sign Out</Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-10 flex items-center justify-between px-4 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 rounded bg-neutral-50 dark:bg-neutral-900 text-neutral-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-[10px] font-black text-neutral-400 dark:text-white uppercase md:hidden">WMS</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-1 text-neutral-300 hover:text-neutral-500 transition-all"
            >
              {theme === 'light' ? (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707" /></svg>
              )}
            </button>
            <div className="h-3 w-px bg-neutral-100 dark:bg-neutral-800 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-300">{user.name}</span>
              <span className="text-[7px] text-neutral-400 font-black uppercase tracking-[0.1em]">{user.role}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-4 overflow-y-auto no-scrollbar">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};