export interface InboundShipment {
  id: string;
  refNo: string;
  poNumber: string;
  shipment: string;
  supplierName: string;
  warehouse: string;
  department?: string;
  quantity: number;
  status: 'DRAFT' | 'PENDING' | 'RECEIVED';
  date: string;
}

export const DUMMY_SHIPMENTS: InboundShipment[] = [
  {
    id: '1',
    refNo: 'SH-221',
    poNumber: 'PO-1001',
    shipment: 'sh-221',
    supplierName: '-',
    warehouse: 'ST-FS',
    department: 'Electronics',
    quantity: 22,
    status: 'DRAFT',
    date: 'Apr 04, 2026',
  },
  {
    id: '2',
    refNo: 'SH-12342',
    poNumber: 'PO-1001',
    shipment: 'SH-12342',
    supplierName: 'Abdul Basit',
    warehouse: 'ST-FS',
    department: 'Apparel',
    quantity: 2000,
    status: 'PENDING',
    date: 'Mar 30, 2026',
  },
];
