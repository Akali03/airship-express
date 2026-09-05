"use client";
import { useEffect, useState } from "react";
import AddManualButton from "./AddManualButton";
import { useDebounce } from "@/app/(supplyChain)/hooks/useDebounce";
import { sanitizeSearch } from "@/app/(supplyChain)/components/global/sanitize";
interface TableFiltersProps {
    onFilterChange?: (courier: string) => void;
    onSearch?: (search: string) => void;
    onAddManual?: () => void;
}
export default function TableFilters({ onSearch, onAddManual }: TableFiltersProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    useEffect(() => {
        onSearch?.(debouncedSearch);
    }, [debouncedSearch, onSearch]);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeSearch(e.target.value);
        setSearchTerm(sanitized);
    };
    return (<div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-48 bg-[#ebf0f7] dark:bg-[#14151c] border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-2 pl-8 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[inset_1px_1px_3px_rgba(166,175,195,0.35),inset_-1px_-1px_3px_rgba(255,255,255,0.9)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none focus:border-pink-500 transition-all"
                        placeholder="Search barcode..."
                        maxLength={100}
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
                </div>
            </div>

            <AddManualButton onAdd={onAddManual}/>
        </div>);
}
