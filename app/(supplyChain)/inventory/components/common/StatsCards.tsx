'use client';

import Cards from '@/app/(supplyChain)/components/global/Cards';

interface StatsCardsProps {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
}

export function StatsCards({ totalItems, lowStockItems, outOfStockItems }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <Cards
                frontIcon="fas fa-boxes mr-1"
                header="Total Items"
                data={totalItems.toLocaleString()}
                arrow="fas fa-arrow-up mr-1"
                description="Inventory items"
                backBg="bg-ink dark:bg-accent"
                backHeader="Total Inventory"
                backIcon="fas fa-boxes"
                headerTextColor="text-muted dark:text-white/80"
                backDescription={`Total of ${totalItems} items in inventory.\n\n📦 All items across all categories and statuses.`}
                tooltip="Click the card to see more details"
                badge={totalItems > 0 ? 'Live' : ''}
            />

            <Cards
                frontIcon="fas fa-exclamation-triangle mr-1"
                header="Low Stock"
                data={lowStockItems.toLocaleString()}
                arrow="fas fa-arrow-up mr-1"
                description="Need restock"
                backBg="bg-ink dark:bg-accent"
                backHeader="Low Stock Items"
                backIcon="fas fa-exclamation-triangle"
                headerTextColor="text-muted dark:text-white/80"
                backDescription={`${lowStockItems} items are below minimum stock levels.\n\n⚠️ These items need immediate attention.\n\n Check inventory to review stock levels.`}
                tooltip="Click the card to see more details"
                badge={lowStockItems > 0 ? '⚠️ Alert' : ''}
                frontTextColor="text-amber-600 dark:text-amber-400"
                descriptionTextColor="text-amber-600 dark:text-amber-400"
            />

            <Cards
                frontIcon="fas fa-times-circle mr-1"
                header="Out of Stock"
                data={outOfStockItems.toLocaleString()}
                arrow="fas fa-arrow-down mr-1"
                description="Unavailable"
                backBg="bg-ink dark:bg-accent"
                backHeader="Out of Stock Items"
                backIcon="fas fa-times-circle"
                headerTextColor="text-muted dark:text-white/80"
                backDescription={`${outOfStockItems} items are currently out of stock.\n\n🚫 These items need restocking immediately.\n\n Check inventory to reorder.`}
                tooltip="Click the card to see more details"
                badge={outOfStockItems > 0 ? '🚫 Alert' : ''}
                frontTextColor="text-red-600 dark:text-red-400"
                descriptionTextColor="text-red-600 dark:text-red-400"
            />
        </div>
    );
}