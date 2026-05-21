import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ScanItem {
  id: string;
  purchaseOrderId: string;
  variantId: string;
  itemDescription: string;
  color: string;
  size: string;
  warehouseId: number;
  warehouseName: string;
  plannedQuantity: number;
  scannedQuantity: number;
  status: 'Pending' | 'In_Progress' | 'Completed' | 'Posted' | 'Scanned';
  barcodes: string[];
  uploadedBarcode?: string;
}

interface ScanProgress {
  scannedQuantity: number;
  plannedQuantity?: number;
  status: 'Pending' | 'In_Progress' | 'Completed' | 'Posted' | 'Scanned';
}

interface CrossdockState {
  progress: {
    [shipmentId: string]: {
      [itemId: string]: ScanProgress;
    }
  };
}

const initialState: CrossdockState = {
  progress: {},
};

const crossdockSlice = createSlice({
  name: 'crossdock',
  initialState,
  reducers: {
    updateScannedQuantity: (state, action: PayloadAction<{ shipmentId: string; itemId: string; quantity: number }>) => {
      const { shipmentId, itemId, quantity } = action.payload;
      if (!state.progress[shipmentId]) state.progress[shipmentId] = {};
      if (!state.progress[shipmentId][itemId]) {
        state.progress[shipmentId][itemId] = { scannedQuantity: 0, status: 'Pending' };
      }
      state.progress[shipmentId][itemId].scannedQuantity += quantity;
    },
    updateItemStatus: (state, action: PayloadAction<{ shipmentId: string; itemId: string; status: ScanProgress['status'] }>) => {
      const { shipmentId, itemId, status } = action.payload;
      if (!state.progress[shipmentId]) state.progress[shipmentId] = {};
      if (!state.progress[shipmentId][itemId]) {
        state.progress[shipmentId][itemId] = { scannedQuantity: 0, status: 'Pending' };
      }
      state.progress[shipmentId][itemId].status = status;
    },
    setValueOverrides: (state, action: PayloadAction<{ shipmentId: string; itemId: string; scannedQuantity: number; plannedQuantity: number }>) => {
      const { shipmentId, itemId, scannedQuantity, plannedQuantity } = action.payload;
      if (!state.progress[shipmentId]) state.progress[shipmentId] = {};
      if (!state.progress[shipmentId][itemId]) {
        state.progress[shipmentId][itemId] = { scannedQuantity: 0, status: 'Pending' };
      }
      state.progress[shipmentId][itemId].scannedQuantity = scannedQuantity;
      state.progress[shipmentId][itemId].plannedQuantity = plannedQuantity;
    },
    setInitialProgress: (state, action: PayloadAction<{ shipmentId: string; progress: Record<string, ScanProgress> }>) => {
      const { shipmentId, progress } = action.payload;
      if (!state.progress[shipmentId]) {
        state.progress[shipmentId] = progress;
      }
    },
    clearShipmentData: (state, action: PayloadAction<string>) => {
      delete state.progress[action.payload];
    }
  },
});

export const { updateScannedQuantity, updateItemStatus, setValueOverrides, setInitialProgress, clearShipmentData } = crossdockSlice.actions;
export default crossdockSlice.reducer;
