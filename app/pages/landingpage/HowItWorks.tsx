"use client";

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Book a pickup",
        desc: "Message us on Facebook with your parcel details and pickup address.",
    },
    {
        number: "02",
        title: "We collect it",
        desc: "A rider picks up your parcel at your requested time and location.",
    },
    {
        number: "03",
        title: "Track and deliver",
        desc: "Follow your parcel in real time until it lands in the recipient's hands.",
    },
];

export default function HowItWorks() {
    return (
        <section className="w-full bg-ink px-6 py-20 sm:py-28">
            <div className="mx-auto mb-14 flex max-w-3xl flex-col items-center text-center sm:mb-20">
                <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent font-rethink sm:text-xs">
                    The process
                </span>
                <h2 className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] text-paper font-bricolage sm:text-5xl md:text-[56px]">
                    How it works
                </h2>
            </div>

            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-paper/10 sm:grid-cols-3">
                {steps.map((s, i) => (
                    <motion.div
                        key={s.number}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative flex flex-col gap-3 bg-paper/[0.03] p-8 sm:border-r sm:border-dashed sm:border-paper/15 sm:last:border-r-0"
                    >
                        {i !== 0 && (
                            <span className="absolute -left-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-ink sm:block" />
                        )}
                        {i !== steps.length - 1 && (
                            <span className="absolute -right-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-ink sm:block" />
                        )}
                        <span className="font-bricolage text-4xl font-extrabold tracking-[-0.02em] text-accent sm:text-5xl">
                            {s.number}
                        </span>
                        <h3 className="text-lg font-bold text-paper font-bricolage sm:text-xl">
                            {s.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-paper/60 font-rethink sm:text-base">
                            {s.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}