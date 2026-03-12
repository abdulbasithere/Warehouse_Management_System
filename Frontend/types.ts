export type UserRole = 'MASTER' | 'PICKER' | 'PACKER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  isActive?: boolean;
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
  status: 'new' | 'picking' | 'packing' | 'delivered';
  customer?: Customer;
  shippingAddress?: Address;
  items?: OrderItem[];
  trackingNumber?: string;
  awbUrl?: string;
  orderDate?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  currentQuantity: number;
  shelfLocationId?: string;
  productPrice?: number;
}

export interface ShelfLocation {
  id: string;
  aisle: string;
  shelfLevel: string;
  basket: string;
  currentOccupancy: number;
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

export interface Putaway {
  id: string | number;
  putawayNumber: string;
  totalQuantity: number;
  putawayQuantity: number;
  status: string;
  createDate: string;
  assignedPickerId?: number | string;
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