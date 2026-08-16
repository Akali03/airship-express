'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers/classNames';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close modal when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-[2px] p-4 sm:p-6">
            <div
                ref={modalRef}
                className={cn(
                    "w-full max-w-lg rounded-xl border border-line bg-paper shadow-xl",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h3 className="text-lg font-semibold text-ink">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
                    >
                        <X size={20} strokeWidth={1.75} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4">{children}</div>
            </div>
        </div>
    );
};