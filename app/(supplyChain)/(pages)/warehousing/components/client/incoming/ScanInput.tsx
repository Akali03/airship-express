"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { scanBarcode } from "@/app/(supplyChain)/(pages)/warehousing/actions/incoming/scanInput"
import BarcodeScanner from "./BarcodeScanner";
import { sanitizeBarcode } from "@/app/(supplyChain)/components/global/sanitize";
import { AppButton } from "@/app/(supplyChain)/components/ui/AppButton";
import { StatusBadge } from "@/app/(supplyChain)/components/ui/StatusBadge";

interface ScanInputProps {
    onScan?: () => void;
    isListening?: boolean;
    onStartListening?: () => void;
    onStopListening?: () => void;
    totalScanned?: number;
}

export default function ScanInput({
    onScan,
    isListening = false,
    onStartListening,
    onStopListening,
    totalScanned = 0
}: ScanInputProps) {
    const [barcode, setBarcode] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const bufferRef = useRef<string>("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    const processBarcode = useCallback(async (barcodeValue: string) => {
        const sanitized = sanitizeBarcode(barcodeValue);

        if (!sanitized || isScanning) return;

        setIsScanning(true);
        const toastId = toast.loading('Processing...');

        try {
            const result = await scanBarcode(sanitized);

            if (!result.success) {
                if (result.data?.existsIn === 'queue') {
                    toast.error(`Already in queue`, {
                        id: toastId,
                        description: `Status: ${result.data.status}`,
                        duration: 3000,
                    });
                } else if (result.data?.existsIn === 'parcels') {
                    toast.error(`Already received`, {
                        id: toastId,
                        description: `Received on ${result.data.receivedAt ? new Date(result.data.receivedAt).toLocaleDateString() : 'earlier'}`,
                        duration: 3000,
                    });
                } else {
                    toast.error(result.error || 'Failed to add', {
                        id: toastId,
                        duration: 3000,
                    });
                }
                setBarcode("");
                return;
            }

            toast.success(`Parcel added! Tracking: ${result.data?.trackingNumber}`, {
                id: toastId,
                duration: 2000,
            });

            setBarcode("");
            onScan?.();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to add parcel', {
                id: toastId,
                duration: 3000,
            });
        } finally {
            setIsScanning(false);
        }
    }, [isScanning, onScan]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isListening || isScanning) {
            if (e.key === ' ' || (e.key.length === 1 && !/[a-zA-Z0-9-]/.test(e.key))) {
                e.preventDefault();
            }
            return;
        }

        if (e.key === ' ') {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const value = bufferRef.current || barcode;
            bufferRef.current = "";
            if (value.trim()) {
                processBarcode(value);
            }
            return;
        }

        if (e.key.length === 1 && /[a-zA-Z0-9-]/.test(e.key)) {
            bufferRef.current += e.key;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                bufferRef.current = "";
            }, 50);
        }

        if (e.key.length === 1 && !/[a-zA-Z0-9-]/.test(e.key)) {
            e.preventDefault();
            return;
        }
    }, [isListening, isScanning, barcode, processBarcode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isScanning) return;
        const sanitized = sanitizeBarcode(e.target.value);
        setBarcode(sanitized);
        if (isListening) {
            bufferRef.current = sanitized;
        }
    };

    const handleStart = () => {
        if (isListening) {
            onStopListening?.();
            bufferRef.current = "";
            toast.info('Scanner paused', { duration: 1500 });
        } else {
            onStartListening?.();
            setBarcode("");
            bufferRef.current = "";
            toast.info('Scanner ready', { duration: 1500 });
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    };

    const handleCameraScan = (scannedBarcode: string) => {
        const sanitized = sanitizeBarcode(scannedBarcode);
        if (sanitized) {
            processBarcode(sanitized);
        }
    };

    // Auto-focus when scanner is listening and active, and when tab changes to incoming
    useEffect(() => {
        if (isListening && !isScanning && !showScanner && (currentTab === 'incoming' || !currentTab)) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isListening, isScanning, showScanner, currentTab]);

    // Keep focus on window/tab activation
    useEffect(() => {
        const handleWindowFocus = () => {
            if (isListening && !isScanning && !showScanner && (currentTab === 'incoming' || !currentTab)) {
                inputRef.current?.focus();
            }
        };
        window.addEventListener('focus', handleWindowFocus);
        return () => window.removeEventListener('focus', handleWindowFocus);
    }, [isListening, isScanning, showScanner, currentTab]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <div className="relative">
                        <i
                            className={`fas fa-barcode absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors ${isListening ? 'text-emerald-500' : 'text-slate-400'
                                }`}
                            aria-hidden="true"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={barcode}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            readOnly={!isListening || isScanning}
                            placeholder={
                                isListening
                                    ? "Scan barcode or type and press Enter..."
                                    : "Click Start to enable scanning mode"
                            }
                            className={`w-full rounded-2xl border py-3 pl-10 pr-24 text-sm font-mono text-slate-800 dark:text-slate-200 transition-all outline-hidden bg-[#ebf0f7]/95 dark:bg-[#14151c]/95 shadow-[inset_2px_2px_5px_rgba(166,175,195,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_4px_rgba(255,255,255,0.05)] ${isListening
                                ? 'border-emerald-500/80 dark:border-emerald-600/80'
                                : 'border-slate-300/60 dark:border-slate-800/60'
                                } ${isScanning ? 'cursor-wait opacity-75' : ''}`}
                        />

                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <StatusBadge
                                tone={isListening ? "emerald" : "neutral"}
                                dot
                                size="xs"
                            >
                                {isListening ? (isScanning ? '...' : 'listening') : 'paused'}
                            </StatusBadge>
                        </div>
                    </div>

                    {isListening && (
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-all">
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                Scanner active and ready
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 gap-2.5">
                    <button
                        type="button"
                        onClick={handleStart}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-[3px_3px_7px_rgba(166,175,195,0.35),-3px_-3px_7px_rgba(255,255,255,0.9),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.55),-2px_-2px_6px_rgba(255,255,255,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)] active:scale-95 cursor-pointer ${
                            isListening
                                ? 'bg-[#f0f3f8] dark:bg-[#1d1e28] text-amber-600 dark:text-amber-400 border border-white/70 dark:border-[#2a2b38] hover:border-amber-300'
                                : 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border border-emerald-400/80 shadow-[0_4px_14px_rgba(16,185,129,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.5)]'
                        }`}
                    >
                        {isListening ? (
                            <i className="fas fa-pause text-xs" />
                        ) : (
                            <i className="fas fa-play text-xs" />
                        )}
                        <span>{isListening ? 'Pause' : 'Start'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white border border-pink-400/80 shadow-[0_4px_14px_rgba(236,72,153,0.45),inset_0_1px_1.5px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.25)] active:scale-95 transition-all cursor-pointer"
                    >
                        <i className="fas fa-camera text-xs" />
                        <span>Camera</span>
                    </button>
                </div>
            </div>

            <BarcodeScanner
                isOpen={showScanner}
                onScan={handleCameraScan}
                onClose={() => setShowScanner(false)}
                scannedCount={totalScanned}
            />
        </>
    );
}