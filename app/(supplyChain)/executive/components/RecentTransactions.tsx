import ViewLink from "@/app/(supplyChain)/components/global/Links";

interface Transaction {
    id: string;
    consignee: string;
    courier: string;
    area: string;
    status: string;
    received: string;
}

const transactions: Transaction[] = [
    {
        id: "AX-1023",
        consignee: "Maria Santos",
        courier: "Shopee Express",
        area: "Area A",
        status: "Received",
        received: "2026-07-17 08:23"
    },
    {
        id: "AX-1027",
        consignee: "John Reyes",
        courier: "J&T Express",
        area: "Area B",
        status: "Waiting",
        received: "2026-07-17 09:45"
    },
    {
        id: "AX-1018",
        consignee: "Ana Cruz",
        courier: "Lazada Express",
        area: "Area C",
        status: "Dispatched",
        received: "2026-07-17 10:15"
    },
    {
        id: "AX-1032",
        consignee: "Mike Tan",
        courier: "Flash Express",
        area: "Area A",
        status: "Received",
        received: "2026-07-17 11:30"
    },
    {
        id: "AX-1020",
        consignee: "Lisa Gomez",
        courier: "Shopee Express",
        area: "Area D",
        status: "Dispatched",
        received: "2026-07-17 12:00"
    },
    {
        id: "AX-1034",
        consignee: "Carlos Mendoza",
        courier: "J&T Express",
        area: "Area B",
        status: "Ready for Dispatch",
        received: "2026-07-17 13:20"
    }
];

const StatusBadge = ({ status }: { status: string }) => {
    // Map status to appropriate color scheme
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Received":
                return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/30";
            case "Waiting":
                return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/30";
            case "Dispatched":
                return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/30";
            case "Ready for Dispatch":
                return "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/30";
            default:
                return "bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60";
        }
    };

    const dotColor = {
        "Received": "bg-blue-500 dark:bg-blue-400",
        "Waiting": "bg-amber-500 dark:bg-amber-400",
        "Dispatched": "bg-emerald-500 dark:bg-emerald-400",
        "Ready for Dispatch": "bg-purple-500 dark:bg-purple-400"
    }[status] || "bg-slate-500 dark:bg-slate-400";

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            {status}
        </span>
    );
};

export default function RecentTransactions() {
    return (
        <div className="card p-5 xl:col-span-2 
                        bg-white dark:bg-[#2a2a2e] 
                        border border-slate-200/60 dark:border-slate-700/60 
                        rounded-xl shadow-sm 
                        dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900 dark:text-white">
                    <i className="fas fa-list mr-2 text-pink-500 dark:text-pink-400"></i> Recent transactions
                </div>
                <ViewLink link="/inventory" name="Open inventory" />
            </div>
            <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-[#1a1a1e] text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Reference</th>
                            <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Consignee</th>
                            <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Courier</th>
                            <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Area</th>
                            <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Status</th>
                            <th className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">Received</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#2a2a2e] divide-y divide-slate-200/60 dark:divide-slate-700/60">
                        {transactions.map((tx, index) => (
                            <tr
                                key={tx.id}
                                className={`${index % 2 === 1 ? 'bg-slate-50/50 dark:bg-[#222226]' : ''} 
                                           hover:bg-slate-100/70 dark:hover:bg-slate-700/30 
                                           transition-colors duration-150`}
                            >
                                <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800 dark:text-slate-300">{tx.id}</td>
                                <td className="px-6 py-4 text-slate-900 dark:text-white">{tx.consignee}</td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{tx.courier}</td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{tx.area}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={tx.status} />
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{tx.received}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}