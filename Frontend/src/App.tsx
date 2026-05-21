/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { LayoutShell } from './components/LayoutShell';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { PoTrackerPage } from './pages/PoTrackerPage';
import { WarehousePage } from './pages/WarehousePage';
import { WarehouseFormPage } from './pages/WarehouseFormPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { UserFormPage } from './pages/UserFormPage';
import { RolesPage } from './pages/RolesPage';
import { RoleFormPage } from './pages/RoleFormPage';
import { SupplierPage } from './pages/SupplierPage';
import { SupplierFormPage } from './pages/SupplierFormPage';
import { ShelfLocationsPage } from './pages/ShelfLocationsPage';
import { ShelfLocationFormPage } from './pages/ShelfLocationFormPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { PutawayOverviewPage } from './pages/PutawayOverviewPage';
import { PutawayDetailPage } from './pages/PutawayDetailPage';
import { TransferOrdersPage } from './pages/TransferOrdersPage';
import { TransferOrderDetailPage } from './pages/TransferOrderDetailPage';
import { TransferOrderFormPage } from './pages/TransferOrderFormPage';
import { PurchaseOrderPage } from './pages/PurchaseOrderPage';
import { PurchaseOrderDetailPage } from './pages/PurchaseOrderDetailPage';
import { PoTrackerDetailPage } from './pages/PoTrackerDetailPage';
import { PurchaseOrderFormPage } from './pages/PurchaseOrderFormPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { VariantsPage } from './pages/VariantsPage';
import { BarcodesPage } from './pages/BarcodesPage';
import { ProductMapping } from './pages/ProductMapping';
import { PickingOverviewPage } from './pages/PickingOverviewPage';
import { PickingDetailPage } from './pages/PickingDetailPage';
import { PackingOverviewPage } from './pages/PackingOverviewPage';
import { PackingDetailPage } from './pages/PackingDetailPage';
import { BasketPackingPage } from './pages/BasketPackingPage';
import { OrdersPage } from './pages/OrdersPage';
import { InboundShipmentsPage } from './pages/InboundShipmentsPage';
import { InboundShipmentDetailPage } from './pages/InboundShipmentDetailPage';
import { InboundShipmentFormPage } from './pages/InboundShipmentFormPage';
import { CrossdockScanPage } from './pages/CrossdockScanPage';
import { InventoryAdjustmentsPage } from './pages/InventoryAdjustmentsPage';
import { RefusalFormPage } from './pages/RefusalFormPage';
import { RefusalsPage } from './pages/RefusalsPage';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isInitialized, loading } = useAppSelector(state => state.auth);
  const { theme } = useAppSelector(state => state.theme);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!isInitialized || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-[#1c1c1c]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black text-neutral-400">Initializing OS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
          aria-label="Notifications"
        />
      </>
    );
  }

  return (
    <>
      <LayoutShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/po-tracker" element={<PoTrackerPage />} />
          <Route path="/po-tracker/:poNumber" element={<PoTrackerDetailPage />} />
          
          {/* Inventory */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/edit/:id" element={<ProductFormPage />} />
          <Route path="/products/:id/details" element={<ProductDetailsPage />} />
          <Route path="/variants" element={<VariantsPage />} />
          <Route path="/barcodes" element={<BarcodesPage />} />
          <Route path="/product-mapping" element={<ProductMapping />} />
          <Route path="/inventory-adjustments" element={<InventoryAdjustmentsPage />} />
          
          {/* Inbound */}
          <Route path="/Purchase-Order" element={<PurchaseOrderPage />} />
          <Route path="/Purchase-Order/new" element={<PurchaseOrderFormPage />} />
          <Route path="/Purchase-Order/:poNumber" element={<PurchaseOrderDetailPage />} />
          <Route path="/transfer-orders" element={<TransferOrdersPage />} />
          <Route path="/transfer-orders/new" element={<TransferOrderFormPage />} />
          <Route path="/transfer-orders/:transferNumber" element={<TransferOrderDetailPage />} />
          <Route path="/inbound-shipments" element={<InboundShipmentsPage />} />
          <Route path="/inbound-shipments/new" element={<InboundShipmentFormPage />} />
          <Route path="/inbound-shipments/edit/:poNumber" element={<InboundShipmentFormPage />} />
          <Route path="/inbound-shipments/:id" element={<InboundShipmentDetailPage />} />
          <Route path="/inbound-shipments/:id/scan" element={<CrossdockScanPage />} />
          <Route path="/refusals" element={<RefusalsPage />} />
          <Route path="/refusals/new" element={<RefusalFormPage />} />
          <Route path="/putaway" element={<PutawayOverviewPage />} />
          <Route path="/putaway/:putawayId" element={<PutawayDetailPage />} />
          
          {/* Outbound */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/picking" element={<PickingOverviewPage />} />
          <Route path="/picking/:pickListId" element={<PickingDetailPage />} />
          <Route path="/packing" element={<PackingOverviewPage />} />
          <Route path="/packing/:orderNumber" element={<PackingDetailPage />} />
          <Route path="/packing/basket/:basketId" element={<BasketPackingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          
          {/* Admin / Setup */}
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/edit/:id" element={<UserFormPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/new" element={<RoleFormPage />} />
          <Route path="/roles/edit/:id" element={<RoleFormPage />} />
          <Route path="/warehouses" element={<WarehousePage />} />
          <Route path="/warehouses/new" element={<WarehouseFormPage />} />
          <Route path="/warehouses/edit/:id" element={<WarehouseFormPage />} />
          <Route path="/suppliers" element={<SupplierPage />} />
          <Route path="/suppliers/new" element={<SupplierFormPage />} />
          <Route path="/suppliers/edit/:id" element={<SupplierFormPage />} />
          <Route path="/shelf-locations" element={<ShelfLocationsPage />} />
          <Route path="/shelf-locations/new" element={<ShelfLocationFormPage />} />
          <Route path="/shelf-locations/edit/:id" element={<ShelfLocationFormPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutShell>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        aria-label="Notifications"
      />
    </>
  );
};

export default function App() {
  return <AppContent />;
}
