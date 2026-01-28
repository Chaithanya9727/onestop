import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Github, Twitter, Linkedin, Instagram,
    ArrowRight, Mail, MapPin, Globe, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
    const navigate = useNavigate();

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        "Platform": [
            { label: "Competitions", href: "/events" },
            { label: "Jobs", href: "/jobs" },
            { label: "Mentorship", href: "/mentors" },
            { label: "Resume Shield", href: "/resume-shield" },
        ],
        "Resources": [
            { label: "Blog", href: "/blog" },
            { label: "Community", href: "/community" },
            { label: "Success Stories", href: "/stories" },
            { label: "Help Center", href: "/help" },
        ],
        "Company": [
            { label: "About Us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Partners", href: "/partners" },
            { label: "Contact", href: "/contact" },
        ],
        "Legal": [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Cookie Policy", href: "/cookies" },
        ]
    };

    const socialLinks = [
        { icon: Twitter, href: "https://twitter.com" },
        { icon: Github, href: "https://github.com" },
        { icon: Linkedin, href: "https://linkedin.com" },
        { icon: Instagram, href: "https://instagram.com" }
    ];

    const location = useLocation();

    return (
        <footer className="bg-[#050505] text-white pt-10 overflow-hidden relative border-t border-white/10">

            {/* Background Decorative Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">

                {/* BOTTOM LINKS SECTION */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <Link to="/" className="inline-block">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/25">
                                    ⚡
                                </div>
                                <span className="text-2xl font-display font-black text-white tracking-tighter">OneStop</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
                            The world's leading platform for developers to learn, compete, and get hired. Join the movement today.
                        </p>
                        <div className="flex flex-col gap-2 text-slate-400 text-sm">
                            <div className="flex items-center gap-2"><Mail size={16} />chaithanya9727@gmail.com</div>
                            <div className="flex items-center gap-2"><MapPin size={16} />India</div>
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([title, items]) => (
                        <div key={title} className="col-span-1">
                            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest opacity-70">{title}</h4>
                            <ul className="space-y-4">
                                {items.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-slate-400 hover:text-white transition-colors text-sm font-medium block hover:translate-x-1 transition-transform duration-300"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FOOTER BOTTOM */}
                <div className="border-t border-white/10 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm">
                        &copy; {currentYear} OneStop Inc. All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        {socialLinks.map((social, idx) => (
                            <a
                                key={idx}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
                            >
                                <social.icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* GIANT WATERMARK */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full overflow-hidden pointer-events-none opacity-[0.03]">
                    <h1 className="text-[15vw] font-black text-center text-white leading-none tracking-tighter select-none">
                        ONESTOP
                    </h1>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
