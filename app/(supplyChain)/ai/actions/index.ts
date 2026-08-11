// app/(supplyChain)/ai/actions/index.ts

// Parcels
export { getParcels, getParcelStats, getTodayParcels } from './get_parcels';
export type { ParcelFilters, Parcel } from './get_parcels';

// Inventory
export {
    getLowStockItems,
    getOutOfStockItems,
    getInventorySummary
} from './get_low_stock';
export type { LowStockItem } from './get_low_stock';

// Inventory (additional)
export { getInventory, getInventoryItems } from './get_inventory';

// Receiving Queue
export { getReceivingQueue, getReceivingQueueSummary } from './get_receiving_queue';
export type { ReceivingQueueItem } from './get_receiving_queue';

// Suppliers
// export { getSuppliers } from './get_suppliers';
// export type { Supplier } from './get_suppliers';