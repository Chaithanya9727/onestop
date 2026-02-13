import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const StunningLoader = ({ message = "Synchronizing your experience...", fullPage = false }) => {
    return (
        <div className={`${fullPage ? 'fixed inset-0 z-[9999]' : 'min-h-[70vh] w-full rounded-[3rem] my-4'} flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050505] transition-colors duration-500 relative overflow-hidden text-center`}>
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.1, 0.05],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.05, 0.1, 0.05],
                        x: [0, -50, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* The Core Orb */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Sonic Pulse Rings */}
                    {[1, 1.2, 1.4].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: "easeOut"
                            }}
                            className="absolute inset-0 border border-blue-500/30 rounded-full"
                        />
                    ))}

                    {/* Rotating Data Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-2 border-dashed border-blue-500/20 rounded-full"
                    />

                    {/* Central Logo Platform */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-white dark:bg-[#0f1014] rounded-[2rem] flex items-center justify-center shadow-2xl border border-slate-200 dark:border-white/10 relative z-20 group"
                    >
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                                rotateX: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Zap className="text-blue-600 dark:text-blue-400 fill-blue-600/10" size={40} />
                        </motion.div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 rounded-[2rem] pointer-events-none" />
                    </motion.div>
                </div>

                {/* Text Area */}
                <div className="mt-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 justify-center mb-3"
                    >
                        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">OneStop</span>
                        <div className="flex gap-1 items-end h-4 pb-1">
                            {[0.2, 0.4, 0.6].map((d, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: ["4px", "12px", "4px"] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: d }}
                                    className="w-1 bg-blue-600 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>

                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] pr-[-0.5em] animate-pulse">
                        {message}
                    </p>
                </div>

                {/* Dynamic Progress Indicator */}
                <div className="w-56 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mt-8 border border-white/5">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="h-full w-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    />
                </div>
            </div>

            {/* Visual noise/grain for texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default StunningLoader;
