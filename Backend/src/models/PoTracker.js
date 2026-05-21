import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PoTracker = sequelize.define('PoTracker', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    trackerStatus: {
        type: DataTypes.ENUM(
            'Shipment Arrived',
            'In Process',
            'GRN Process',
            'Partial Closed',
            'Closed',
            'Cancelled',
            'Move to Sample',
            'Pending a Merchant End',
            'Pending at Supply Chain'
        ),
        allowNull: true
    },
    trackerSubStatus: {
        type: DataTypes.ENUM(
            'Stock placed in Receiving Rack',
            'Stock placed in Department',
            'Pending due to Documentation',
            'Partial Received from China Carry',
            'Pending for Weight',
            'Partial Received from Supplier End',
            'Pending to Process',
            'Pending for Sampling',
            'Handover to Admin',
            'On Packing',
            'On Partial Barcoding',
            'On Barcoding',
            'On Distribution',
            'On Scanning',
            'On Sorting',
            'Pending due to Network Issue',
            'On Security Verification',
            'On Audit Verification',
            'Document handover for GRN',
            'Pending at MSO End',
            'GRN Posted',
            'China Partial Received',
            'Receiving WH Issue',
            'Urgent Dispatch',
            'Hand Over to Audit',
            'Hand Over to Merchant',
            'PO/TO Cancel',
            'Stock Returned',
            'Physical Stock Moved',
            'Physical Stock not Moved',
            'TO Or PO need to be updated',
            'Q.C Issue found and hold by merchant',
            'PO, Bill & Physical Stock not match',
            'Over Delivery (Need Child PO)',
            'Mix Stock Receive',
            'Partial Barcoded',
            'Wrong Barcoded',
            'Price Updated',
            'Packing Accessories not available',
            'Partial Received',
            'Due to Vendor not available for Live Receiving',
            'Dispatch not Receive on Time',
            'Change in Dispatch'
        ),
        allowNull: true
    },
    departmentReceiver: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    withSupplier: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    verifiedByLp: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    verifiedByAudit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    ConsiderDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    responsibleSupervisor: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    SampleMovementDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    packer: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    googleLens: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    parkLocation: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    ShipmentConsiderDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ChinaCarry: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    billFrom: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    invoiceSubmittedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    CommittedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    billSubmittedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    editLines: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    SignatureRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    brand: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    division: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    merchandiser: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    department: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'PoTrackers',
    timestamps: true
});

PoTracker.associate = (models) => {
    PoTracker.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    PoTracker.belongsTo(models.User, { foreignKey: 'departmentReceiver', as: 'departmentReceiverUser' });
    PoTracker.belongsTo(models.User, { foreignKey: 'responsibleSupervisor', as: 'supervisorUser' });
    PoTracker.belongsTo(models.User, { foreignKey: 'packer', as: 'packerUser' });
};

export default PoTracker;
