"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface CardsProps {
    frontIcon?: string;
    header?: string;
    data?: string;
    arrow?: string;
    description?: string;
    backBg?: string;
    backHeader?: string;
    backDescription?: string;
    headerTextColor?: string;
    tooltip?: string;
    tooltipLink?: string;
    badge?: string;
    backIcon?: string;
    frontTextColor?: string;
    descriptionTextColor?: string;
}

export default function Cards({
    frontIcon = "fas fa-box mr-1",
    header = "Statistic",
    data = "0",
    arrow = "fas fa-arrow-up mr-1",
    description = "No change",
    backBg = "bg-ink dark:bg-ink/90",
    backHeader = "Details",
    backDescription = "No additional information available.",
    headerTextColor = "text-muted dark:text-white/80",
    tooltip,
    tooltipLink,
    badge,
    backIcon = "fas fa-info-circle",
    frontTextColor = "text-muted dark:text-muted",
    descriptionTextColor = "text-emerald-600 dark:text-emerald-400"
}: CardsProps) {
    const [flipped, setFlipped] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        tooltipTimeoutRef.current = setTimeout(() => {
            if (!isHoveringTooltip) {
                setShowTooltip(false);
            }
        }, 100);
    };

    const handleTooltipMouseEnter = () => {
        setIsHoveringTooltip(true);
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        setShowTooltip(true);
    };

    const handleTooltipMouseLeave = () => {
        setIsHoveringTooltip(false);
        setShowTooltip(false);
    };

    const handleTooltipClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tooltipLink) {
            window.location.href = tooltipLink;
        }
    };

    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
                tooltipTimeoutRef.current = null;
            }
        };
    }, []);

    return (
        <div
            className="relative cursor-pointer perspective h-40 group"
            onClick={() => setFlipped(!flipped)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {tooltip && showTooltip && (
                <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 
                            bg-ink dark:bg-ink/90 
                            text-white text-xs font-medium px-3 py-1.5 
                            rounded-lg shadow-lg whitespace-nowrap pointer-events-auto 
                            transition-opacity duration-200 flex items-center gap-2 
                            cursor-pointer hover:bg-ink/80 dark:hover:bg-ink/70"
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                    onClick={handleTooltipClick}
                >
                    <i className="fas fa-arrow-right text-[10px] text-accent"></i>
                    {tooltip}
                    {tooltipLink && (
                        <i className="fas fa-chevron-right text-[10px] text-accent ml-1"></i>
                    )}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 
                                    bg-ink dark:bg-ink/90 rotate-45"></div>
                </div>
            )}

            {badge && (
                <div className="absolute -top-2 -right-2 z-100 
                                bg-accent text-white text-[10px] font-bold 
                                px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <i className="fas fa-circle text-[6px] text-white/50"></i>
                    {badge}
                </div>
            )}

            <div className={`relative w-full h-full duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
                {/* Front Card */}
                <div className="absolute inset-0 backface-hidden card kpi 
                                bg-paper dark:bg-ink/90 
                                p-4 rounded-xl shadow 
                                border border-line dark:border-ink/20 
                                flex flex-col justify-between 
                                group-hover:shadow-lg group-hover:shadow-pink-500/20 dark:group-hover:shadow-pink-500/30 
                                transition-shadow duration-200">
                    <div className={`label text-xs font-semibold uppercase tracking-wider flex items-center gap-2 
                                    ${frontTextColor}`}>
                        <i className={frontIcon}></i> {header}
                    </div>
                    <div className={`value text-2xl sm:text-3xl font-bold text-ink dark:text-white`}>
                        {data}
                    </div>
                    <div className={`delta delta-up text-sm flex items-center gap-2 ${descriptionTextColor}`}>
                        <i className={arrow}></i>
                        <span>{description}</span>
                        <span className="ml-auto text-[10px] text-muted dark:text-muted 
                                        group-hover:text-accent dark:group-hover:text-accent transition-colors">
                            <i className="fas fa-info-circle"></i>
                        </span>
                    </div>
                </div>

                {/* Back Card */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 ${backBg} text-white p-4 rounded-xl shadow flex flex-col justify-between`}>
                    <div className="overflow-y-auto max-h-full scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div className={`text-xs font-semibold tracking-wider ${headerTextColor} uppercase mb-2 flex items-center gap-2`}>
                            <i className={backIcon}></i>
                            {backHeader}
                        </div>
                        <div className="text-sm text-white/90 dark:text-white/90 space-y-1.5 leading-relaxed">
                            {backDescription.split('\n').map((line, i) => {
                                const formattedLine = line
                                    .replace(/📦/g, '<i class="fas fa-box text-white/70 dark:text-white/70 mr-1"></i>')
                                    .replace(/📊/g, '<i class="fas fa-chart-bar text-white/70 dark:text-white/70 mr-1"></i>')
                                    .replace(/🏆/g, '<i class="fas fa-trophy text-yellow-300 mr-1"></i>')
                                    .replace(/⏰/g, '<i class="fas fa-clock text-blue-300 mr-1"></i>')
                                    .replace(/📈/g, '<i class="fas fa-chart-line text-emerald-300 mr-1"></i>')
                                    .replace(/📅/g, '<i class="fas fa-calendar-day text-purple-300 mr-1"></i>')
                                    .replace(/🚚/g, '<i class="fas fa-truck text-amber-300 mr-1"></i>');

                                return (
                                    <p key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />
                                );
                            })}
                        </div>
                        {tooltipLink && (
                            <Link
                                href={tooltipLink}
                                className="inline-block mt-3 text-xs text-white/80 hover:text-white transition-colors font-medium flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View Details
                                <i className="fas fa-arrow-right text-[10px]"></i>
                            </Link>
                        )}
                    </div>
                    <div className="text-[10px] text-white/50 dark:text-white/50 text-right mt-2 flex items-center justify-end gap-1">
                        <i className="fas fa-mouse-pointer"></i>
                        Click to close info
                    </div>
                </div>
            </div>
        </div>
    );
}