# Warehousing Module

## Overview
The Warehousing module manages the entire lifecycle of parcels from receiving to dispatch.

## Sub-modules

### 1. Inbound Receiving
**Purpose:** Manage incoming parcels through scanning and manual entry.

**Key Features:**
- Barcode scanning with camera support
- Manual parcel entry for non-barcoded items
- Real-time duplicate detection to prevent double counting
- Bulk QR code scanning for multiple parcels
- Parcel status tracking: pending → verified → rejected
- Real-time updates via Supabase subscriptions
- Pagination and filtering for large volumes
- Batch operations: receive all, delete multiple

**Workflow:**
1. Parcel arrives at warehouse
2. Scan barcode or enter manually
3. System checks for duplicates
4. Parcel is marked as 'pending'
5. Staff verifies parcel contents
6. Status updates to 'verified' or 'rejected'
7. Verified parcels move to sorting

### 2. Courier Sorting
**Purpose:** Sort and assign parcels to couriers based on destination.

**Key Features:**
- Destination distribution visualization
- Region-based filtering (Luzon, Visayas, Mindanao)
- Courier assignment (J&T, Shopee Express, LBC, etc.)
- Bulk QR code generation for couriers
- Parcel grouping by destination
- Real-time updates

**Workflow:**
1. Verified parcels enter sorting area
2. Parcels grouped by destination
3. Courier assigned to destination group
4. QR code generated for batch
5. Parcels marked as 'ready_for_pickup'

### 3. Outgoing Dispatch
**Purpose:** Manage parcels ready for courier pickup and dispatch.

**Key Features:**
- Scan to mark parcels as ready
- Batch dispatch to couriers
- Driver assignment
- Bulk QR code filtering
- Status tracking: received → ready_for_pickup → picked_up
- Real-time updates

**Workflow:**
1. Courier arrives for pickup
2. Staff scans parcels or selects batch
3. Driver assigned to shipment
4. Parcels marked as 'picked_up'
5. Tracking information updated

### 4. Dashboard
**Purpose:** Warehouse overview with key metrics and analytics.

**Key Features:**
- Real-time statistics: scanned parcels, peak hour, monthly total
- Courier performance charts
- Top courier identification
- Busiest day tracking
- Interactive cards with tooltips
- Real-time updates

## Data Models

### Parcel Status Flow