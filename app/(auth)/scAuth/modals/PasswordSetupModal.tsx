'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';

interface PasswordSetupModalProps {
    showPasswordModal: boolean;
    selectedEmployeeForPassword: any;
    hrHasPassword: boolean;
    useHrPassword: boolean;
    setUseHrPassword: (v: boolean) => void;
    newPassword: string;
    setNewPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    isCreatingUser: boolean;
    getRoleColor: (role: string) => string;
    handleCreateAccount: () => void;
    setShowPasswordModal: (v: boolean) => void;
    setOtpSent: (v: boolean) => void;
    setShowEmployeeModal: (v: boolean) => void;
}

export default function PasswordSetupModal({
    showPasswordModal,
    selectedEmployeeForPassword,
    hrHasPassword,
    useHrPassword,
    setUseHrPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isCreatingUser,
    getRoleColor,
    handleCreateAccount,
    setShowPasswordModal,
    setOtpSent,
    setShowEmployeeModal,
}: PasswordSetupModalProps) {
    return (
        <AnimatePresence>
            {showPasswordModal && selectedEmployeeForPassword && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-start sm:items-center justify-center z-50 p-2.5 sm:p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#EEF2F6] dark:bg-[#161A23] border border-white/80 dark:border-white/5 rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[88vh] sm:max-h-[85vh] flex flex-col shadow-none my-auto overflow-hidden"
                    >
                        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
                            <div className="text-center mb-5 sm:mb-6">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#EEF2F6] dark:bg-[#1A1F2B] shadow-[5px_5px_10px_#d1dbe7,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <User className="text-accent" size={26} />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-ink dark:text-paper font-bricolage">Set Up Your Account</h3>
                                <p className="text-xs sm:text-sm text-muted dark:text-paper/70 mt-1">
                                    Create your account to access the supply chain system
                                </p>
                            </div>

                            {/* Recessed Neumorphic Employee Info Card */}
                            <div className="mb-4 p-3.5 sm:p-4 bg-[#EAF0F6] dark:bg-[#13161F] shadow-[inset_3px_3px_6px_#cbd6e4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] rounded-2xl border border-white/40 dark:border-white/5">
                                <p className="text-xs text-muted dark:text-paper/70 font-medium">Employee</p>
                                <p className="font-semibold text-ink dark:text-paper text-sm sm:text-base mt-0.5">{selectedEmployeeForPassword.display_name}</p>
                                <p className="text-xs sm:text-sm text-muted dark:text-paper/70 break-all">{selectedEmployeeForPassword.email}</p>
                                {selectedEmployeeForPassword.employee_id && (
                                    <p className="text-xs text-muted dark:text-paper/50 mt-1">ID: {selectedEmployeeForPassword.employee_id}</p>
                                )}
                                {selectedEmployeeForPassword.department && (
                                    <p className="text-xs text-muted dark:text-paper/50">{selectedEmployeeForPassword.department} • {selectedEmployeeForPassword.position}</p>
                                )}
                                <span className={`inline-block mt-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg shadow-[2px_2px_5px_rgba(0,0,0,0.08)] ${getRoleColor(selectedEmployeeForPassword.role)}`}>
                                    {selectedEmployeeForPassword.role}
                                </span>
                            </div>

                            {hrHasPassword && (
                                <div className="mb-4 p-3.5 sm:p-4 bg-[#EAF0F6] dark:bg-[#13161F] shadow-[inset_3px_3px_6px_#cbd6e4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.6),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] rounded-2xl border border-blue-500/20 dark:border-blue-500/10">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useHrPassword}
                                            onChange={(e) => setUseHrPassword(e.target.checked)}
                                            className="mt-1 w-4 h-4 text-accent rounded border-line dark:border-paper/20 dark:bg-paper/5 focus:ring-accent cursor-pointer"
                                        />
                                        <div>
                                            <p className="text-xs sm:text-sm font-semibold text-ink dark:text-paper">
                                                Use HR system password
                                            </p>
                                            <p className="text-xs text-muted dark:text-paper/70 mt-0.5">
                                                Your password will be synced from the HR system
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {!useHrPassword && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-ink dark:text-paper mb-1.5">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-[#EAF0F6] dark:bg-[#13161F] shadow-[inset_3px_3px_6px_#cbd6e4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7),inset_-2px_-2px_6px_rgba(255,255,255,0.03)] border border-transparent focus:border-accent/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-paper placeholder:text-muted/40 dark:placeholder:text-paper/40 outline-none transition"
                                            placeholder="Enter password (min 6 characters)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-ink dark:text-paper mb-1.5">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[#EAF0F6] dark:bg-[#13161F] shadow-[inset_3px_3px_6px_#cbd6e4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.7),inset_-2px_-2px_6px_rgba(255,255,255,0.03)] border border-transparent focus:border-accent/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink dark:text-paper placeholder:text-muted/40 dark:placeholder:text-paper/40 outline-none transition"
                                            placeholder="Confirm your password"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Neumorphic Modal Footer */}
                        <div className="shrink-0 border-t border-white/60 dark:border-white/5 p-4 sm:p-5 bg-[#EEF2F6] dark:bg-[#161A23] flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setOtpSent(true);
                                    setShowEmployeeModal(true);
                                }}
                                className="flex-1 px-4 py-2.5 bg-[#EEF2F6] dark:bg-[#1A1F2B] shadow-[4px_4px_8px_#d1dbe7,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.6),-3px_-3px_8px_rgba(255,255,255,0.03)] active:shadow-[inset_2px_2px_5px_#c4d0df,inset_-2px_-2px_5px_#ffffff] dark:active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8)] rounded-xl text-xs sm:text-sm font-medium text-muted dark:text-paper/80 hover:text-ink dark:hover:text-paper transition-all cursor-pointer border border-white/60 dark:border-white/5"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateAccount}
                                disabled={isCreatingUser}
                                className="flex-1 px-4 py-2.5 bg-accent text-paper rounded-xl text-xs sm:text-sm font-medium shadow-[4px_4px_10px_rgba(234,88,12,0.35),-2px_-2px_6px_rgba(255,255,255,0.3)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-accent/30"
                            >
                                {isCreatingUser ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
