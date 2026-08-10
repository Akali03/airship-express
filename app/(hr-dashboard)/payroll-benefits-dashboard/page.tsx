'use client';

import { motion } from 'framer-motion';
import { Check, CircleDot, Circle } from 'lucide-react';
import Navbar from './comps/navbar/page';
import Sidebar from './comps/sidebar/page';

const PAY_CYCLE_STEPS = [
    { label: 'Timesheets locked', date: 'Aug 05' },
    { label: 'Payroll draft', date: 'Aug 06' },
    { label: 'HR review & approval', date: 'Aug 07' },
    { label: 'Disbursement', date: 'Aug 08' },
    { label: 'Payslips released', date: 'Aug 08' },
];
const currentStep = 1;

const STATS = [
    { label: 'Next pay run', value: 'Aug 08', hint: 'in 4 days' },
    { label: 'Payroll cost, this cycle', value: '₱4.82M', hint: '312 employees' },
    { label: 'Pending claims', value: '18', hint: '₱126,400 total' },
    { label: 'Active HMO enrollees', value: '287', hint: '92% of headcount' },
];

export default function PayrollBenefitsDashboardPage() {
    return (
        <div className="min-h-dvh w-full bg-paper text-ink font-rethink">
            <Navbar />

            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row">
                <Sidebar />

                <main className="flex-1 px-6 py-10 sm:px-10 sm:py-14">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                        <p className="font-rethink text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
                            Payroll &amp; Benefits
                        </p>
                        <h1 className="mt-3 font-bricolage text-[30px] font-medium leading-tight tracking-tight sm:text-[36px]">
                            Here&rsquo;s where this cycle stands.
                        </h1>
                    </motion.div>

                    {/* stats */}
                    <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:grid-cols-4">
                        {STATS.map((s) => (
                            <div key={s.label} className="bg-paper px-5 py-5">
                                <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
                                    {s.label}
                                </p>
                                <p className="mt-2 font-bricolage text-[24px] font-medium tracking-tight">
                                    {s.value}
                                </p>
                                <p className="mt-0.5 text-[12px] text-muted">{s.hint}</p>
                            </div>
                        ))}
                    </div>

                    {/* pay cycle */}
                    <div className="mt-10 border border-line px-6 py-6 sm:px-8 sm:py-7">
                        <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
                            Current pay cycle
                        </p>
                        <ol className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-0">
                            {PAY_CYCLE_STEPS.map((step, i) => {
                                const done = i < currentStep;
                                const active = i === currentStep;
                                return (
                                    <li
                                        key={step.label}
                                        className="flex flex-1 items-start gap-3 sm:flex-col sm:items-start sm:gap-2 sm:border-l sm:border-line sm:pl-4 sm:first:border-l-0 sm:first:pl-0"
                                    >
                                        <span className="mt-0.5 shrink-0 sm:mt-0">
                                            {done ? (
                                                <Check size={16} className="text-accent" strokeWidth={2.5} />
                                            ) : active ? (
                                                <CircleDot size={16} className="text-accent" strokeWidth={2} />
                                            ) : (
                                                <Circle size={16} className="text-line" strokeWidth={2} />
                                            )}
                                        </span>
                                        <span>
                                            <span
                                                className={`block text-[13px] font-medium ${active ? 'text-ink' : done ? 'text-ink' : 'text-muted'
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                            <span className="block text-[12px] text-muted">{step.date}</span>
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </main>
            </div>
        </div>
    );
}