export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type AppModule = 'dashboard' | 'orders' | 'returns' | 'inventory' | 'picking' | 'packing' | 'putaway' | 'warehouse' | 'supplier' | 'users' | 'roles';

export type UserRole = 'admin' | 'manager' | 'picker' | 'packer';

export interface Permission {
  module: AppModule;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id?: string;
  userId?: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
  userRole?: UserRole;
  roles?: any[];
  isActive: boolean;
  roleId?: string;
  roleName?: string;
  role?: Role;
  createdAt?: string;
  lastLogin?: string;
}

export type AllocationStatus = 'AVAILABLE' | 'PARTIAL-AVAILABLE' | 'NOT-AVAILABLE';

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  allocationStatus: AllocationStatus;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  saleOrderNumber: string;
  shopifyOrderNumber: string;
  orderTotalAmount: number;
  totalUnitsCount: number;
  allocationStatus: AllocationStatus;
  status: 'new' | 'picking' | 'packing' | 'delivered' | 'returned';
  customer: Customer;
  shippingAddress?: Address;
  items?: OrderItem[];
  trackingNumber?: string;
  awbUrl?: string;
  orderDate?: string;
}

export interface Product {
  id?: string;
  productId?: string | number;
  ProductID?: string | number;
  sku?: string;
  SKU?: string;
  name: string;
  Name?: string;
  description?: string;
  Description?: string;
  category?: string;
  Category?: string;
  weight?: number;
  Weight?: number;
  trackBatch?: boolean;
  trackSerial?: boolean;
  trackExpiry?: boolean;
  totalVariants?: number;
  TotalVariants?: number;
  currentQuantity?: number;
  Stock?: number;
  shelfLocationId?: string;
  productPrice?: number;
  Price?: number;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id?: string | number;
  productVariantId?: number;
  ProductVariantID?: number;
  variantId: string;
  VariantID?: string;
  productId?: string | number;
  ProductID?: string | number;
  color?: string;
  Color?: string;
  size?: string;
  Size?: string;
  price: number;
  Price?: number;
  availableQuantity?: number;
  AvailableQuantity?: number;
  allocatedQuantity?: number;
  AllocatedQuantity?: number;
}

export interface Barcode {
  id?: string;
  barcode: string;
  Barcode?: string;
  variantId: string;
  VariantID?: string;
  isActive: boolean;
  IsActive?: boolean;
  createdAt: string;
  CreatedAt?: string;
}

export interface ShelfLocation {
  id?: string;
  ShelfID?: string | number;
  aisle?: string;
  Aisle?: string;
  shelfLevel?: string;
  ShelfLevel?: string;
  basket?: string;
  Basket?: string;
  currentOccupancy?: number;
  CurrentOccupancy?: number;
  warehouseId?: string | number;
  WarehouseID?: string | number;
  createdAt?: string;
}

export type PickStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface PickList {
  id: string;
  pickingListNumber: string;
  status: PickStatus;
  pickedQuantity: number;
  totalQuantity: number;
  totalOrders: number;
  basketReference?: string;
}

export interface PickListItem {
  id: string;
  sku: string;
  itemName: string;
  requiredQty: number;
  pickedQty: number;
  shelfLocation?: string; // Descriptive string like A1-L1-B1
  aisle?: string;
  shelfLevel?: string;
  orderNumber?: string;
  basketReference?: string;
}

export interface PackingJob {
  id: string;
  saleOrderNumber: string;
  shopifyOrderNumber: string;
  packedQuantity: number;
  totalQuantity: number;
  status: 'PENDING' | 'PACKING' | 'PACKED';
  basketReference?: string;
  assignedPicker?: { name: string };
  consignmentNumber?: string;
}

export interface PendingScan {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  scannedQty: number;
  shelfLocationId: string;
  shelfLocationLabel: string;
}

export interface Putaway {
  id: string | number;
  putawayNumber: string;
  totalQuantity: number;
  putawayQuantity: number;
  status: string;
  createDate: string;
  assignedPickerId?: number | string;
  assignedPickerName?: string;
  receivingNumber?: string;
  items?: Array<{
    id: string;
    productId: string;
    sku: string;
    productName: string;
    quantity: number;
    putawayQuantity: number;
  }>;
}
