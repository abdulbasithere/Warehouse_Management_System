import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { LayoutShell } from './components/LayoutShell';
import { LoginPage } from './pages/LoginPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { PickingOverviewPage } from './pages/PickingOverviewPage';
import { PickingDetailPage } from './pages/PickingDetailPage';
import { PackingOverviewPage } from './pages/PackingOverviewPage';
import { BasketPackingPage } from './pages/BasketPackingPage';
import { PutawayOverviewPage } from './pages/PutawayOverviewPage';
import { PutawayDetailPage } from './pages/PutawayDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ShelfLocationsPage } from './pages/ShelfLocationsPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { InventoryAdjustmentPage } from './pages/InventoryAdjustmentPage';
import ProductMapping from './pages/ProductMapping';
import { PurchaseOrderPage } from './pages/PurchaseOrderPage';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import GetInPage from './pages/GetInPage';
import WarehousePage from './pages/WarehousePage';
import WarehouseFormPage from './pages/WarehouseFormPage';

const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAppSelector(state => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'MASTER': return <Navigate to="/orders" replace />;
    case 'PICKER': return <Navigate to="/picking" replace />;
    case 'PACKER': return <Navigate to="/packing" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { theme } = useAppSelector(state => state.theme);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Verify session on mount only to prevent infinite verification loops
  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <HashRouter>
      <ToastContainer
        theme={theme as 'light' | 'dark'}
        aria-label="Toast Notifications"
        position="top-center"
        autoClose={800}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LayoutShell />}>
          <Route index element={<RootRedirect />} />

          {/* MASTER Only */}
          <Route path="orders" element={<RoleGuard allowedRoles={['MASTER']}><OrdersPage /></RoleGuard>} />
          <Route path="orders/:orderId" element={<RoleGuard allowedRoles={['MASTER']}><OrderDetailPage /></RoleGuard>} />
          <Route path="products" element={<RoleGuard allowedRoles={['MASTER']}><ProductsPage /></RoleGuard>} />
          <Route path="shelf-locations" element={<RoleGuard allowedRoles={['MASTER']}><ShelfLocationsPage /></RoleGuard>} />
          <Route path="returns" element={<RoleGuard allowedRoles={['MASTER']}><ReturnsPage /></RoleGuard>} />
          <Route path="Purchase-Order" element={<RoleGuard allowedRoles={['MASTER']}><PurchaseOrderPage /></RoleGuard>} />
          <Route path="Purchase-Order/:poNumber" element={<RoleGuard allowedRoles={['MASTER']}><PurchaseOrderDetailPage /></RoleGuard>} />
          <Route path="Product-mapping" element={<RoleGuard allowedRoles={['MASTER']}><ProductMapping /></RoleGuard>} />
          <Route path="inventory-adjustment" element={<RoleGuard allowedRoles={['MASTER']}><InventoryAdjustmentPage /></RoleGuard>} />
          <Route path="GetIn" element={<RoleGuard allowedRoles={['MASTER']}><GetInPage /></RoleGuard>} />
          <Route path="warehouse" element={<RoleGuard allowedRoles={['MASTER']}><WarehousePage /></RoleGuard>} />
          <Route path="warehouse/:id" element={<WarehouseFormPage />} />
          <Route path="users" element={<RoleGuard allowedRoles={['MASTER']}><UserManagementPage /></RoleGuard>} />

          {/* Picking & Putaway */}
          <Route path="picking" element={<RoleGuard allowedRoles={['MASTER', 'PICKER']}><PickingOverviewPage /></RoleGuard>} />
          <Route path="picking/:pickListId" element={<RoleGuard allowedRoles={['MASTER', 'PICKER']}><PickingDetailPage /></RoleGuard>} />
          <Route path="putaway" element={<RoleGuard allowedRoles={['MASTER', 'PICKER']}><PutawayOverviewPage /></RoleGuard>} />
          <Route path="putaway/:putawayId" element={<RoleGuard allowedRoles={['MASTER', 'PICKER']}><PutawayDetailPage /></RoleGuard>} />

          {/* Packing */}
          <Route path="packing" element={<RoleGuard allowedRoles={['MASTER', 'PACKER']}><PackingOverviewPage /></RoleGuard>} />
          <Route path="packing/basket/:basketRef" element={<RoleGuard allowedRoles={['MASTER', 'PACKER']}><BasketPackingPage /></RoleGuard>} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
