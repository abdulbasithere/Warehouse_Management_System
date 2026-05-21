import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import UserRole from './UserRole.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import PickList from './PickList.js';
import PackingJob from './PackingJob.js';
import Putaway from './Putaway.js';
import ShelfLocation from './ShelfLocation.js';
import InventoryLocation from './InventoryLocation.js';
import OrderAllocation from './OrderAllocation.js';
import InventoryAdjustment from './InventoryAdjustment.js';
import Warehouse from './Warehouse.js';
import ProductVariant from './ProductVariant.js';
import UnitsOfMeasure from './UnitsOfMeasure.js';
import Supplier from './Supplier.js';
import PurchaseOrder from './PurchaseOrder.js';
import PurchaseOrderLineItem from './PurchaseOrderLineItem.js';
import ProductBarcode from './ProductBarcode.js';
import InboundShipment from './InboundShipment.js';
import InboundShipmentItem from './InboundShipmentItem.js';
import InboundShipmentAttachment from './InboundShipmentAttachment.js';
import InboundShipmentParking from './InboundShipmentParking.js';
import CrossDockPlan from './CrossDockPlan.js';
import InboundVehicleDetail from './InboundVehicleDetail.js';
import Department from './Department.js';
import VehicleType from './VehicleType.js';
import PurchaseOrderActivity from './PurchaseOrderActivity.js';
import ProductReceiptHeader from './ProductReceiptHeader.js';
import ProductReceiptTrans from './ProductReceiptTrans.js';
import TransferOrder from './TransferOrder.js';
import TransferOrderLine from './TransferOrderLine.js';
import PoTracker from './PoTracker.js';
import InboundShipmentItemDetail from './InboundShipmentItemDetail.js';

const models = {
    User,
    Role,
    Permission,
    RolePermission,
    UserRole,
    Product,
    Warehouse,
    ProductVariant,
    UnitsOfMeasure,
    Supplier,
    PurchaseOrder,
    PurchaseOrderLineItem,
    Order,
    OrderItem,
    PickList,
    PackingJob,
    Putaway,
    ShelfLocation,
    InventoryLocation,
    OrderAllocation,
    InventoryAdjustment,
    ProductBarcode,
    InboundShipment,
    InboundShipmentItem,
    InboundShipmentAttachment,
    InboundShipmentParking,
    CrossDockPlan,
    InboundVehicleDetail,
    Department,
    VehicleType,
    PurchaseOrderActivity,
    ProductReceiptHeader,
    ProductReceiptTrans,
    TransferOrder,
    TransferOrderLine,
    PoTracker,
    InboundShipmentItemDetail
};

// Run associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

export {
    User,
    Role,
    Permission,
    RolePermission,
    UserRole,
    Product,
    Warehouse,
    ProductVariant,
    UnitsOfMeasure,
    Supplier,
    PurchaseOrder,
    PurchaseOrderLineItem,
    Order,
    OrderItem,
    PickList,
    PackingJob,
    Putaway,
    ShelfLocation,
    InventoryLocation,
    OrderAllocation,
    InventoryAdjustment,
    ProductBarcode,
    InboundShipment,
    InboundShipmentItem,
    InboundShipmentAttachment,
    InboundShipmentParking,
    CrossDockPlan,
    InboundVehicleDetail,
    Department,
    VehicleType,
    PurchaseOrderActivity,
    ProductReceiptHeader,
    ProductReceiptTrans,
    TransferOrder,
    TransferOrderLine,
    PoTracker,
    InboundShipmentItemDetail
};


export default models;
