import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 isolate">
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 40, rotateX: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40, rotateX: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-[#111] w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-200 dark:border-white/10 relative z-[100000] perspective-1000"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Close Button */}
                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                            >
                                <X size={20} className="text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="p-10">
                            {/* Visual Header */}
                            <div className="text-center mb-10 pt-4">
                                <div className="relative inline-block mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[1.75rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 transform -rotate-6">
                                        <LogIn size={40} className="text-white" />
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-2 -right-2 text-yellow-500"
                                    >
                                        <Sparkles size={24} className="drop-shadow-sm" />
                                    </motion.div>
                                </div>

                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                    Unlock the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Full Experience</span>
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    Join our community to apply for roles, compete in contests, and get AI insights.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    onClick={onClose}
                                    className="group relative w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                                >
                                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                    Sign In to Continue
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={onClose}
                                    className="w-full py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white font-black rounded-2xl transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 text-lg"
                                >
                                    <UserPlus size={20} />
                                    Join OneStop Free
                                </Link>
                            </div>

                            {/* Footer Hint */}
                            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Trusted by 5,000+ candidates
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AuthModal;
