"use client"

import { useState } from "react"
import CrbcSidebar from "./CrbcSidebar"

export default function CrbcLayout({
    children,
    role,
}: {
    children: React.ReactNode
    role: string
}) {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="flex min-h-screen border-line bg-background">
            <CrbcSidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />
            <main className={`${collapsed ? "ml-16" : "ml-56"} flex-1 transition-all duration-200 md:p-8 overflow-x-auto bg-background`}>
                {children}
            </main>
        </div>
    )
}