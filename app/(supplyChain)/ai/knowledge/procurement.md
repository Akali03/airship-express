# Procurement Module

## Overview
Manages supplier relationships and purchase requests for warehouse operations.

## Key Features

### 1. Supplier Management
- Add/Edit/Delete suppliers
- Supplier categories: Tire Supplier, Auto Parts, Packaging, General Supplies
- Contact information management (name, phone, email, location)
- Active/Inactive status tracking
- Products/Services tracking

### 2. Purchase Requests
- Create purchase requests
- Multi-item requests support
- Supplier selection
- Status tracking: pending → approved → rejected → ordered → received
- Low stock auto-suggestions

### 3. Reports
- Supplier performance reports
- Purchase history tracking
- Spending analysis

## Supplier Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Supplier Name | String | Yes | Company name |
| Category | String | Yes | Supplier type |
| Contact Person | String | Yes | Primary contact |
| Phone | String | Yes | Contact number |
| Email | String | Yes | Email address |
| Location | String | Yes | Address |
| Products | Text | No | Products/services offered |
| Notes | Text | No | Additional details |
| Active Status | Boolean | Yes | Supplier availability |

## Purchase Request Status Flow