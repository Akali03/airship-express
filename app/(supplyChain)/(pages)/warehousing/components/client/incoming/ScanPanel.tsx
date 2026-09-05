"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/(supplyChain)/lib/services/client/supabase";
import ScanInput from "./ScanInput";
import { ScanSummary } from "./ScanSummary";
import { StatsCards } from "./StatsCards";

interface ScanPanelProps {
    scanned: number;
    topCourier: string;
    onScan?: () => void;
}

export default function ScanPanel({ scanned, topCourier, onScan }: ScanPanelProps) {
    const [lastScan, setLastScan] = useState<string>("");
    const [lastScanStatus, setLastScanStatus] = useState<string>("");
    const [isListening, setIsListening] = useState(true);

    const fetchLastScan = async () => {
        try {
            const { data, error } = await supabase
                .from('receiving_queue')
                .select('barcode, status')
                .order('scanned_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                setLastScan(data[0].barcode);
                setLastScanStatus(data[0].status);
            } else {
                setLastScan("No scans yet");
                setLastScanStatus("");
            }
        } catch (error) {
            console.error('Error fetching last scan:', error);
            setLastScan("Error loading");
            setLastScanStatus("");
        }
    };

    useEffect(() => {
        fetchLastScan();
    }, []);

    const handleScan = () => {
        fetchLastScan();
        onScan?.(); //  This now just updates the count locally
    };

    const handleStartListening = () => {
        setIsListening(true);
    };

    const handleStopListening = () => {
        setIsListening(false);
    };

    return (
        <div className="bg-[#f0f3f8] dark:bg-[#191a24] rounded-3xl border border-white/80 dark:border-[#2c2d3c] p-5 sm:p-6 shadow-[8px_8px_24px_rgba(166,175,195,0.4),-8px_-8px_24px_rgba(255,255,255,0.95),inset_0_1px_1.5px_rgba(255,255,255,0.9)] dark:shadow-[10px_10px_30px_rgba(0,0,0,0.75),-6px_-6px_20px_rgba(255,255,255,0.03),inset_0_1px_1px_rgba(255,255,255,0.07)] grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                    <ScanInput
                        onScan={handleScan}
                        isListening={isListening}
                        onStartListening={handleStartListening}
                        onStopListening={handleStopListening}
                        totalScanned={scanned}
                    />
                </div>
                <ScanSummary lastScan={lastScan} lastScanStatus={lastScanStatus} />
            </div>
            <StatsCards scanned={scanned} topCourier={topCourier} />
        </div>
    );
}