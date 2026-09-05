'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';

interface RememberedPasswordModalProps {
    showRememberedPasswordModal: boolean;
    selectedEmployee: any;
    rememberedPassword: string;
    setRememberedPassword: (v: string) => void;
    isLoggingInWithRemembered: boolean;
    getRoleColor: (role: string) => string;
    handleVerifyRememberedPassword: () => void;
    setShowRememberedPasswordModal: (v: boolean) => void;
}

export default function RememberedPasswordModal({
    showRememberedPasswordModal,
    selectedEmployee,
    rememberedPassword,
    setRememberedPassword,
    isLoggingInWithRemembered,
    getRoleColor,
    handleVerifyRememberedPassword,
    setShowRememberedPasswordModal,
}: RememberedPasswordModalProps) {
    return (
        <AnimatePresence>
            {showRememberedPasswordModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-start sm:items-center justify-center z-50 p-2.5 sm:p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#EEF2F6] dark:bg-[#161A23] border border-white/80 dark:border-white/5 rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[88vh] sm:max-h-[85vh] flex flex-col shadow-none my-auto overflow-hidden"
                    >
                        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
                            <div className="text-center mb-5 sm:mb-6">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#EEF2F6] dark:bg-[#1A1F2B] shadow-[5px_5px_10px_#d1dbe7,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <LogIn className="text-emerald-600 dark:text-emerald-400" size={26} />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-ink dark:text-paper font-bricolage">Login as {selectedEmployee.display_name}</h3>
                                <p className="text-xs sm:text-sm text-muted dark:text-paper/70 mt-1">
                                    Enter your password to continue
                                </p>
                            </div>

                            {/* Recessed Neumorphic Info Card */}
                            <div className="mb-4 p-3.5 sm:p-4 bg-[#EAF0F6] dark:bg-[#13161F] shadow-[inset_3px_3px_6px_#cbd6e4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] rounded-2xl border border-white/40 dark:border-white/5">
                                <p className="text-xs text-muted dark:text-paper/70 font-medium">Account</p>
                                <p className="font-semibold text-ink dark:text-paper text-sm sm:text-base mt-0.5">{selectedEmployee.display_name}</p>
                                <p className="text-xs sm:text-sm text-muted dark:text-paper/70 break-all">{selectedEmployee.email}</p>
                                {selectedEmployee.employee_id && (
                                    <p className="text-xs text-muted dark:text-paper/50 mt-1">ID: {selectedEmployee.employee_id}</p>
                                )}
                                {selectedEmployee.department && (
                                    <p className="text-xs text-muted dark:text-paper/50">{selectedEmployee.department} • {selectedEmployee.position}</p>
                                )}
                                <span className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg shadow-[2px_2px_5px_rgba(0,0,0,0.08)] ${getRoleColor(selectedEmployee.role)}`}>
                                    {selectedEmployee.role}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-ink dark:text-paper mb-1.5">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={rememberedPassword}
                                        onChange={(e) => setRememberedPassword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleVerifyRememberedPassword();
                                            }
                                        }}
                                        className="w-full bg-[#EAF0F6] dark:bg-[#13161F] shadow-[inset_3px_3px_6px_#cbd6e4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7),inset_-2px_-2px_6px_rgba(255,255,255,0.03)] border border-transparent focus:border-accent/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-paper placeholder:text-muted/40 dark:placeholder:text-paper/40 outline-none transition"
                                        placeholder="Enter your password"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <p className="mt-3.5 text-center text-[11px] sm:text-xs text-muted dark:text-paper/50">
                                This is a remembered session. Your password is required for security.
                            </p>
                        </div>

                        {/* Neumorphic Modal Footer */}
                        <div className="shrink-0 border-t border-white/60 dark:border-white/5 p-4 sm:p-5 bg-[#EEF2F6] dark:bg-[#161A23] flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRememberedPasswordModal(false);
                                    setRememberedPassword('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-[#EEF2F6] dark:bg-[#1A1F2B] shadow-[4px_4px_8px_#d1dbe7,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(255,255,255,0.03)] active:shadow-[inset_2px_2px_5px_#c4d0df,inset_-2px_-2px_5px_#ffffff] dark:active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8)] rounded-xl text-xs sm:text-sm font-medium text-muted dark:text-paper/80 hover:text-ink dark:hover:text-paper transition-all cursor-pointer border border-white/60 dark:border-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleVerifyRememberedPassword}
                                disabled={isLoggingInWithRemembered || !rememberedPassword.trim()}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 dark:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium shadow-[4px_4px_10px_rgba(16,185,129,0.35),-2px_-2px_6px_rgba(255,255,255,0.3)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
                            >
                                {isLoggingInWithRemembered ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={16} />
                                        Login
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
