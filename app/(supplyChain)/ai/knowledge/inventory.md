# Inventory Management System

## Overview
The inventory system tracks all warehouse supplies, equipment, and assets.

## Inventory Items
- **Item Code**: Unique identifier for each item
- **Item Name**: Display name of the item
- **Category**: Classification (e.g., Packaging, Equipment, Supplies)
- **Unit**: Measurement unit (e.g., pieces, rolls, boxes)
- **Current Stock**: Current quantity in warehouse
- **Minimum Stock**: Alert threshold for low stock
- **Storage Location**: Physical location in warehouse
- **Supplier**: Source of the item
- **Purchase Price**: Cost per unit

## Stock Status
- **Available**: Stock level is above minimum
- **Low-Stock**: Stock level is at or below minimum
- **Out-of-Stock**: No stock available
- **Reserved**: Stock reserved for specific use

## Stock Operations
### Stock In
- Add stock with supplier reference
- Updates current stock total
- Auto-calculates new status

### Stock Out
- Remove stock with department and purpose
- Updates current stock total
- Auto-calculates new status

## Inventory Reports
- Total items count
- Low stock alerts
- Out of stock items
- Equipment in use
- Category distribution
- Stock status distribution