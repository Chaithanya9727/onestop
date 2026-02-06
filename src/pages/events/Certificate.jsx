import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ToastProvider";
import { Download, Share2, ArrowLeft, Loader, Trophy, CheckCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Certificate() {
    const { id } = useParams();
    const { user } = useAuth();
    const { get } = useApi();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const certRef = useRef();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [participant, setParticipant] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await get(`/events/${id}`);
                setEvent(res);
                const p = res.participants.find(pt => pt.userId === user._id);
                setParticipant(p);
            } catch (err) {
                console.error(err);
                showToast("Failed to load certificate data", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user._id]);

    const handleDownload = () => {
        window.print();
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]"><Loader className="animate-spin text-blue-600" size={40} /></div>;

    if (!event || !participant) return (
        <div className="h-screen flex flex-col items-center justify-center text-slate-500">
            <Trophy size={64} className="mb-4 opacity-20" />
            <h2 className="text-xl font-bold">Certificate Not Available</h2>
            <p>You must be registered and completed the event to view certificates.</p>
            <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-12 px-6">
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold">
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="flex gap-4">
                    <button onClick={handleDownload} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2">
                        <Download size={18} /> Print / PDF
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Link copied!", "success"); }} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Professional Certificate Markup */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white dark:bg-[#111] w-full aspect-[1.414/1] shadow-2xl rounded-sm overflow-hidden print:shadow-none print:m-0 print:rounded-none border-[12px] border-[#1a1a1a] dark:border-[#222]"
                style={{ pageBreakInside: 'avoid' }}
            >
                {/* Inner Golden Border */}
                <div className="absolute inset-4 border-2 border-yellow-600/30 dark:border-yellow-500/20 pointer-events-none" />

                <div className="absolute inset-0 flex flex-col items-center justify-between py-24 px-16 text-center">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-500 tracking-[0.2em] font-black uppercase text-sm">
                            <ShieldCheck size={20} /> OneStop Certified
                        </div>
                        <h1 className="text-6xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tight">Certificate</h1>
                        <p className="text-xl md:text-2xl font-serif italic text-slate-500 dark:text-slate-400">of Achievement</p>
                    </div>

                    {/* Recipient */}
                    <div className="w-full space-y-6">
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">This is to certify that</p>
                        <div className="relative inline-block">
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white px-8 pb-4">{user.name}</h2>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50" />
                        </div>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Has successfully participated in and exhibited exemplary performance in the <br />
                            <strong className="text-slate-900 dark:text-white text-2xl font-black italic">"{event.title}"</strong> <br />
                            held on {new Date(event.startDate).toLocaleDateString()}.
                        </p>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="w-full flex justify-between items-end mt-12">
                        <div className="flex flex-col items-center">
                            <div className="w-40 border-b border-slate-300 dark:border-white/10 pb-2 mb-2">
                                <p className="font-serif italic text-xl text-slate-900 dark:text-white">Admin</p>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Head of Operations</p>
                        </div>

                        {/* Central Seal */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 bg-yellow-600/10 rounded-full animate-pulse" />
                            <div className="w-24 h-24 bg-yellow-600 rounded-full flex items-center justify-center shadow-lg border-4 border-yellow-200">
                                <Trophy size={40} className="text-white" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                <CheckCircle size={16} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-40 border-b border-slate-300 dark:border-white/10 pb-2 mb-2">
                                <p className="font-serif italic text-xl text-slate-900 dark:text-white uppercase tracking-tighter">OneStop AI</p>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issuing Authority</p>
                        </div>
                    </div>

                    {/* ID Footer */}
                    <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[8px] font-mono text-slate-300 dark:text-slate-700 tracking-tighter">
                        <span>CERT_ID: {participant._id?.substring(0, 10).toUpperCase()}</span>
                        <span>VERIFY AT: onestop.ai/verify</span>
                        <span>ISSUED: {new Date().toISOString()}</span>
                    </div>

                </div>

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-yellow-600/40 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-yellow-600/40 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-yellow-600/40 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-yellow-600/40 rounded-br-sm pointer-events-none" />
            </motion.div>

            <div className="mt-12 text-center text-slate-400 font-medium max-w-lg mx-auto print:hidden">
                <p className="mb-4">This certificate is issued digitally by OneStop. You can print this page or save it as a PDF for your portfolio.</p>
                <div className="flex justify-center gap-6 text-sm font-bold">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-500" /> Verified</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-500" /> Authentic</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-green-500" /> Lifetime Valid</span>
                </div>
            </div>

            {/* Global Print Styles */}
            <style>{`
          @media print {
            body * { visibility: hidden; background: white !important; }
            .print\\:hidden { display: none !important; }
            .print\\:m-0 { margin: 0 !important; }
            section * { visibility: visible; }
            div[class*='aspect-\\[1.414\\/1\\]'], div[class*='aspect-\\[1.414\\/1\\]'] * { 
               visibility: visible !important; 
            }
            .fixed.inset-0 { display: none !important; }
            nav, footer { display: none !important; }
          }
       `}</style>
        </div>
    );
}
