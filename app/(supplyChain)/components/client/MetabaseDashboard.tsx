"use client";

import { useEffect, useRef } from "react";

export default function MetabaseDashboard() {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Optional: Add any client-side logic for the iframe
        // For example, reload iframe on certain conditions
        const iframe = iframeRef.current;
        if (iframe) {
            // You can add event listeners or other logic here
        }

        return () => {
            // Cleanup
        };
    }, []);

    return (
        <div>
            <div className="relative h-[calc(100vh-200px)] rounded-xl border border-(--line) bg-white overflow-hidden">
                <iframe
                    ref={iframeRef}
                    src="http://localhost:3001/public/dashboard/521c6ddd-82a6-45e9-bbd8-edc02bea6f9d"
                    title="Metabase Dashboard"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    loading="lazy"
                    allow="fullscreen"
                />
            </div>
        </div>
    );
}