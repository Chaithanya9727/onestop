import { useEffect, useState } from "react";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import {
    DollarSign, TrendingUp, Users, Star, Calendar,
    Award, Loader, BarChart3, PieChart
} from "lucide-react";

export default function MentorEarningsStats() {
    const { get } = useApi();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await get("/mentor/stats");
                setStats(data);
            } catch (err) {
                console.error("Error fetching mentor stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            title: "Total Earnings",
            value: `₹${stats.totalEarnings?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-500/10",
            border: "border-green-200 dark:border-green-500/20"
        },
        {
            title: "Total Sessions",
            value: stats.totalSessions || 0,
            icon: Calendar,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            border: "border-blue-200 dark:border-blue-500/20"
        },
        {
            title: "Average Rating",
            value: stats.averageRating || "N/A",
            icon: Star,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "border-amber-200 dark:border-amber-500/20"
        },
        {
            title: "Total Reviews",
            value: stats.totalReviews || 0,
            icon: Award,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-500/10",
            border: "border-purple-200 dark:border-purple-500/20"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-[#0f1014] p-6 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {stat.value}
                        </div>
                        <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {stat.title}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Monthly Earnings Chart */}
            {stats.monthlyData && Object.keys(stats.monthlyData).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-[#0f1014] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Monthly Earnings</h3>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(stats.monthlyData)
                            .sort((a, b) => b[0].localeCompare(a[0]))
                            .map(([month, data]) => (
                                <div key={month} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                            {new Date(month + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {data.sessions} sessions
                                            </span>
                                            <span className="font-black text-green-600 dark:text-green-400">
                                                ₹{data.earnings.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min((data.earnings / Math.max(...Object.values(stats.monthlyData).map(d => d.earnings))) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </motion.div>
            )}

            {/* Service Performance */}
            {stats.serviceStats && Object.keys(stats.serviceStats).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-[#0f1014] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-lg text-pink-600 dark:text-pink-400">
                            <PieChart size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Service Performance</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(stats.serviceStats).map(([service, data]) => (
                            <div
                                key={service}
                                className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{service}</span>
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        {data.count} sessions
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-green-600 dark:text-green-400">
                                    ₹{data.earnings.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Sessions */}
            {stats.recentSessions && stats.recentSessions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-[#0f1014] p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                            <Users size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Sessions</h3>
                    </div>

                    <div className="space-y-3">
                        {stats.recentSessions.slice(0, 5).map((session) => (
                            <div
                                key={session._id}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {session.mentee?.name?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {session.mentee?.name || "Unknown"}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {session.serviceType} • {new Date(session.scheduledTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-green-600 dark:text-green-400">
                                        ₹{session.price}
                                    </div>
                                    {session.rating && (
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={14} className="fill-current" />
                                            <span className="text-sm font-bold">{session.rating}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
