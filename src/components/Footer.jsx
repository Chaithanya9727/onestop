import React from "react";
import { Link } from "react-router-dom";
import { MoveUpRight, Github, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const links = [
    { title: "Product", items: ["Features", "Pricing", "Integrations", "Changelog"] },
    { title: "Company", items: ["About", "Careers", "Blog", "Contact"] },
    { title: "Resources", items: ["Documentation", "Community", "Help Center", "Status"] }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com" },
    { icon: Github, href: "https://github.com" },
    { icon: Linkedin, href: "https://linkedin.com" },
    { icon: Instagram, href: "https://instagram.com" }
  ];

  return (
    <footer className="bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-white/10 pt-24 pb-12 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Top Section: CTA & Logo */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
           <div>
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 leading-[0.9]">
                 LET'S WORK <br/>
                 <span className="text-slate-400 dark:text-slate-600">TOGETHER.</span>
              </h2>
              <a href="mailto:chaithanya9727@gmail.com" className="inline-flex items-center gap-3 text-2xl font-medium text-slate-900 dark:text-white hover:text-indigo-500 transition-colors group">
                 chaithanya9727@gmail.com 
                 <MoveUpRight size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"/>
              </a>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {links.map((section, idx) => (
                 <div key={idx}>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">{section.title}</h4>
                    <ul className="space-y-4">
                       {section.items.map((item, i) => (
                          <li key={i}>
                             <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-lg font-medium">
                                {item}
                             </Link>
                          </li>
                       ))}
                    </ul>
                 </div>
              ))}
           </div>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-slate-200 dark:border-white/10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                 <span className="text-white dark:text-black font-bold text-xl">⚡</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">OneStop.</span>
           </div>

           <p className="text-slate-500 font-medium">
              © {new Date().getFullYear()} OneStop Agency Inc.
           </p>

           <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                 <a 
                   key={i} 
                   href={social.href}
                   target="_blank"
                   rel="noreferrer" 
                   className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
                 >
                    <social.icon size={20} />
                 </a>
              ))}
           </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
