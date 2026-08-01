"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Wallet, Package, ArrowUpRight } from "lucide-react";

const services = [
    {
        code: "SVC-01",
        icon: Zap,
        title: "Same-Day Delivery",
        desc: "Book before cutoff and your parcel goes out the same day, tracked door to door.",
    },
    {
        code: "SVC-02",
        icon: Clock,
        title: "Next-Day Delivery",
        desc: "Standard scheduled deliveries across Metro Manila at a lower rate.",
    },
    {
        code: "SVC-03",
        icon: Wallet,
        title: "COD Remittance",
        desc: "We collect cash-on-delivery payments and remit them straight to your account.",
    },
    {
        code: "SVC-04",
        icon: Package,
        title: "Business & Bulk Shipments",
        desc: "Recurring pickups for online sellers moving high volumes of parcels daily.",
    },
];

export default function Services() {
    return (
        <section id="services" className="w-full bg-paper px-6 py-20 transition-colors duration-500 dark:bg-ink sm:py-28">
            <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center text-center sm:mb-20">
                <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent font-rethink sm:text-xs">
                    What we do
                </span>
                <h2 className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink font-bricolage dark:text-paper sm:text-5xl md:text-[56px]">
                    Delivery, done right
                </h2>
                <p className="mt-4 max-w-xl text-base text-muted font-rethink dark:text-paper/60 sm:text-lg">
                    Whether it&apos;s a single parcel or hundreds a day, we&apos;ve got a service built for it.
                </p>
            </div>

            <div className="mx-auto flex w-full max-w-4xl flex-col divide-y divide-line rounded-2xl border border-line dark:divide-paper/10 dark:border-paper/10">
                {services.map((s, i) => (
                    <motion.div
                        key={s.code}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex flex-col gap-4 p-6 transition-colors hover:bg-line/20 dark:hover:bg-paper/[0.04] sm:flex-row sm:items-center sm:gap-6 sm:p-8"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-paper transition-colors group-hover:bg-accent dark:bg-paper/10">
                            <s.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <span className="font-rethink text-[11px] font-semibold uppercase tracking-[0.1em] text-muted dark:text-paper/40">
                                {s.code}
                            </span>
                            <h3 className="mt-1 text-lg font-bold text-ink font-bricolage dark:text-paper sm:text-xl">
                                {s.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted font-rethink dark:text-paper/60 sm:text-base">
                                {s.desc}
                            </p>
                        </div>
                        <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-line transition-colors group-hover:text-accent dark:text-paper/20 sm:block" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}