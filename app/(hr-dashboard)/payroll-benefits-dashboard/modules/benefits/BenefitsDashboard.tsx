'use client';

import React, { useState } from 'react';
import SSSBracketManager from './SSSBracketManager';
import PhilHealthRateManager from './PhilHealthRateManager';
import PagIbigTierManager from './PagIbigTierManager';

export default function BenefitsDashboard() {
    const [activeTab, setActiveTab] = useState('sss');

    const tabs = [
        { id: 'sss', label: 'SSS Brackets', component: <SSSBracketManager /> },
        { id: 'philhealth', label: 'PhilHealth Rates', component: <PhilHealthRateManager /> },
        { id: 'pagibig', label: 'Pag-IBIG Tiers', component: <PagIbigTierManager /> },
    ];

    return (
        <div className="p-6 space-y-6 bg-paper min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-ink">Government Benefits Configuration</h1>
                <p className="text-sm text-muted">Manage SSS, PhilHealth, and Pag-IBIG contribution bases</p>
            </div>

            <div className="w-full">
                <div className="bg-paper rounded-t-xl border-b border-line p-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-accent text-paper shadow-sm shadow-accent/25'
                                    : 'text-muted hover:bg-ink/[0.04] hover:text-ink'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-paper p-6 rounded-b-xl border border-t-0 border-line shadow-sm">
                    {tabs.find((t) => t.id === activeTab)?.component}
                </div>
            </div>
        </div>
    );
}