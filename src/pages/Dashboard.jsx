import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
   Briefcase,
   Trophy,
   Users,
   Calendar,
   ArrowRight,
   Zap,
   Target,
   TrendingUp,
   Clock,
   CheckCircle2,
   MapPin,
   Building2,
   Rocket,
   Search,
   Bell,
   AlertTriangle,
   Github,
   Linkedin,
   FileText,
   Bookmark
} from "lucide-react";
import StunningLoader from "../components/StunningLoader";


const MOCK_EXTERNAL_EVENTS = [
   {
      _id: "ext-1",
      title: "Global AI Hackathon 2026",
      location: "Online",
      date: "2026-03-15",
      link: "https://devpost.com",
      isExternal: true
   },
   {
      _id: "ext-2",
      title: "Google Hash Code 2026",
      location: "Global",
      date: "2026-04-20",
      link: "https://codingcompetitions.withgoogle.com/hashcode",
      isExternal: true
   },
   {
      _id: "ext-3",
      title: "NASA Space Apps 2026",
      location: "Hybrid",
      date: "2026-05-10",
      link: "https://www.spaceappschallenge.org/",
      isExternal: true
   }
];

export default function Dashboard() {
   const { user, refreshUser } = useAuth();
   const { get } = useApi();
   const navigate = useNavigate();

   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({
      applications: 0,
      mentorships: 0,
      contests: 0,
      interviews: 0
   });
   const [recentApps, setRecentApps] = useState([]);
   const [recommendedJobs, setRecommendedJobs] = useState([]);
   const [recentNotifications, setRecentNotifications] = useState([]);
   const [profileMissing, setProfileMissing] = useState([]);
   const [contests, setContests] = useState([]);
   const [upcomingEvents, setUpcomingEvents] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [appsRes, jobsRes, sessionsRes, notifRes, contestsRes, eventsRes] = await Promise.allSettled([
               get("/candidate/applications"),
               get("/jobs"),
               get("/mentorship/sessions/my"),
               get("/notifications"),
               get("/contests"),
               get("/events?status=upcoming")
            ]);

            let userAppliedTitles = [];

            if (appsRes.status === "fulfilled") {
               const apps = appsRes.value || [];
               const shortlisted = apps.filter(a => a.status === 'shortlisted').length;
               setStats(prev => ({ ...prev, applications: apps.length, interviews: shortlisted }));
               setRecentApps(apps.slice(0, 3));
               userAppliedTitles = apps.map(a => a.job?.title).filter(Boolean);
            }

            if (jobsRes.status === "fulfilled") {
               let jobsData = jobsRes.value.jobs || jobsRes.value || [];
               if (!Array.isArray(jobsData)) jobsData = [];

               // Smart Recommendation Logic
               let recommendations = [];

               if (userAppliedTitles.length > 0) {
                  // 1. Recommendation based on application history
                  const keywords = userAppliedTitles.flatMap(t => t.split(/\s+/)).filter(w => w.length > 3).map(w => w.toLowerCase());
                  recommendations = jobsData.filter(job => {
                     const text = (job.title + " " + (job.skills || []).join(" ")).toLowerCase();
                     return keywords.some(k => text.includes(k));
                  });
               }

               // 2. Fallback to IT/Software Jobs if no matches or no applications
               if (recommendations.length === 0) {
                  const itKeywords = ["software", "developer", "engineer", "react", "node", "full stack", "frontend", "backend", "data", "cloud", "tech", "web"];
                  recommendations = jobsData.filter(job => {
                     const text = (job.title + " " + (job.skills || []).join(" ")).toLowerCase();
                     return itKeywords.some(k => text.includes(k));
                  });
               }

               // 3. Final Fallback to any recent jobs
               if (recommendations.length === 0) {
                  recommendations = jobsData;
               }

               setRecommendedJobs(recommendations.slice(0, 3)); // Increased to 3 for better visibility
            }

            if (sessionsRes.status === "fulfilled") {
               const sessions = sessionsRes.value || [];
               setStats(prev => ({ ...prev, mentorships: sessions.length }));
            }

            if (notifRes.status === "fulfilled") {
               const list = notifRes.value?.notifications || notifRes.value?.data || [];
               setRecentNotifications(list.slice(0, 3));
            }

            if (contestsRes.status === "fulfilled") {
               const allContests = contestsRes.value || [];
               if (Array.isArray(allContests)) {
                  setContests(allContests.slice(0, 2));
                  setStats(prev => ({ ...prev, contests: allContests.length }));
               }
            }

            if (eventsRes.status === "fulfilled") {
               let allEvents = eventsRes.value?.events || eventsRes.value || [];
               if (Array.isArray(allEvents)) {
                  // Merge with External Events
                  const combinedEvents = [...allEvents, ...MOCK_EXTERNAL_EVENTS];

                  const sorted = combinedEvents
                     .filter(e => new Date(e.startDate || e.date) > new Date())
                     .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));

                  setUpcomingEvents(sorted.slice(0, 3)); // Show top 3
               }
            }

         } catch (err) {
            console.error("Dashboard data load failed", err);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
      checkProfileCompleteness();
   }, [get, user]);

   const checkProfileCompleteness = () => {
      if (!user) return;
      const missing = [];
      if (!user.avatar) missing.push({ label: "Upload Avatar", link: "/profile", icon: <Users size={14} /> });
      if (!user.bio) missing.push({ label: "Add Bio", link: "/profile", icon: <FileText size={14} /> });
      if (!user.socials?.github) missing.push({ label: "Link GitHub", link: "/profile", icon: <Github size={14} /> });
      if (!user.socials?.linkedin) missing.push({ label: "Link LinkedIn", link: "/profile", icon: <Linkedin size={14} /> });

      if (!user.resume) missing.push({ label: "Upload Resume", link: "/profile", icon: <FileText size={14} /> });

      setProfileMissing(missing);
   };

   const profileScore = Math.max(20, 100 - (profileMissing.length * 15));

   const formatDate = (dateString) => {
      if (!dateString) return "Date TBA";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Check Details";
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
   };

   const getEventDateObj = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { month: 'TBA', day: '--' };
      return {
         month: date.toLocaleString('default', { month: 'short' }),
         day: date.getDate()
      }
   }

   if (loading) {
      return <StunningLoader message="Initializing Command Center..." />;
   }

   const StatCard = ({ icon: Icon, label, value, color, bg, delay }) => (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: delay * 0.1 }}
         whileHover={{ y: -5 }}
         className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group"
      >
         <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} opacity-20 blur-xl group-hover:scale-150 transition-transform duration-500`} />

         <div className="relative z-10 flex items-center justify-between">
            <div>
               <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
               <h3 className="text-4xl font-black text-slate-900 dark:text-white">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${bg} ${color}`}>
               <Icon size={24} />
            </div>
         </div>
      </motion.div>
   );

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white pb-20 relative overflow-hidden transition-colors duration-300">

         {/* Background Effects */}
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100 dark:bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-100 dark:bg-purple-600/5 rounded-full blur-[120px]" />
         </div>

         <div className="max-w-7xl mx-auto px-6 pt-10 relative z-10">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-2 mb-3">
                     <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-xs font-bold uppercase tracking-widest">
                        {user?.role ? `${user.role} Portal` : "Candidate Portal"}
                     </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                     Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">{user?.name?.split(" ")[0] || "User"}</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium max-w-xl">
                     Your career command center. Track applications, manage mentorships, and find your next big opportunity.
                  </p>
               </motion.div>

               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Link to="/jobs" className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10">
                     <Search size={20} /> Find Jobs
                  </Link>
               </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               <StatCard
                  delay={1}
                  icon={Briefcase}
                  label="Active Applications"
                  value={stats.applications}
                  color="text-blue-600 dark:text-blue-400"
                  bg="bg-blue-100 dark:bg-blue-500/20"
               />
               <StatCard
                  delay={2}
                  icon={TrendingUp}
                  label="Interviews Calls"
                  value={stats.interviews}
                  color="text-green-600 dark:text-green-400"
                  bg="bg-green-100 dark:bg-green-500/20"
               />
               <StatCard
                  delay={3}
                  icon={Users}
                  label="Mentorship Sessions"
                  value={stats.mentorships}
                  color="text-purple-600 dark:text-purple-400"
                  bg="bg-purple-100 dark:bg-purple-500/20"
               />
               <StatCard
                  delay={4}
                  icon={Trophy}
                  label="Active Contests"
                  value={stats.contests}
                  color="text-amber-600 dark:text-amber-400"
                  bg="bg-amber-100 dark:bg-amber-500/20"
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

               {/* Main Content - Recent Activity */}
               <div className="lg:col-span-2 space-y-8">

                  {/* Apps Section */}
                  <motion.div
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                     className="bg-white dark:bg-[#0f1014] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
                  >
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Briefcase className="text-blue-500" /> Recent Applications
                        </h2>
                        <Link to="/candidate/applications" className="text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                           View All <ArrowRight size={14} />
                        </Link>
                     </div>

                     {recentApps.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                           <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                              <Briefcase size={24} />
                           </div>
                           <p className="text-slate-500 font-medium mb-1">No applications yet.</p>
                           <p className="text-slate-400 text-sm mb-4">Start your journey by finding the perfect role.</p>
                           <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors">
                              Browse Jobs <ArrowRight size={14} />
                           </Link>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           {recentApps.map((app) => (
                              <div key={app._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group gap-4">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center text-xl font-bold text-slate-700 dark:text-white shadow-sm border border-slate-200 dark:border-white/5 uppercase">
                                       {app.job?.recruiter?.orgName?.[0] || <Briefcase size={20} />}
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{app.job?.title}</h4>
                                       <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <Building2 size={12} /> {app.job?.recruiter?.orgName || "Company Confidential"}
                                       </p>
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                    <div className="text-right mr-2 hidden sm:block">
                                       <div className="text-xs font-bold text-slate-400">Applied</div>
                                       <div className="text-xs font-medium text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${app.status === 'shortlisted' ? 'bg-green-50 text-green-700 border-green-200' :
                                          app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                             'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20'
                                       }`}>
                                       {app.status || 'Applied'}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </motion.div>

                  {/* Live Contests */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Trophy className="text-amber-500" /> Live Contests
                        </h2>
                        <Link to="/contests" className="text-sm font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                           Explore <ArrowRight size={14} />
                        </Link>
                     </div>
                     <div className="grid md:grid-cols-2 gap-5">
                        {contests.length > 0 ? contests.map(contest => {
                           // Handle different property names from various platforms
                           const title = contest.title || contest.name;
                           const dateStr = contest.endDate || contest.deadline || contest.endTime || contest.startTime;
                           const isExternal = !!contest.url;
                           const link = contest.url || `/contests/${contest._id}`;

                           return (
                              <div key={contest._id || contest.id || Math.random()} className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all shadow-lg hover:shadow-xl group relative overflow-hidden flex flex-col h-full">
                                 <div className="relative z-10">
                                    <span className="text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-1 rounded mb-3 inline-block">
                                       {contest.type || contest.site || "Coding"}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{title}</h3>
                                    <p className="text-slate-500 text-xs font-bold mb-4 flex items-center gap-1">
                                       <Clock size={12} /> {contest.status === 'ONGOING' ? 'Ends:' : 'Starts:'} {formatDate(dateStr)}
                                    </p>
                                    <button
                                       onClick={() => isExternal ? window.open(link, '_blank') : navigate(link)}
                                       className="w-full py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-white"
                                    >
                                       {isExternal ? 'Visit Site' : 'Join Now'} <ArrowRight size={14} />
                                    </button>
                                 </div>
                              </div>
                           );
                        }) : (
                           <div className="col-span-2 text-center py-10 bg-white dark:bg-[#0f1014] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                              <p className="text-slate-500 font-medium">No active contests at the moment.</p>
                              <Link to="/contests" className="text-xs font-bold text-blue-500 mt-2 inline-block hover:underline">View All Contests</Link>
                           </div>
                        )}
                     </div>
                  </motion.div>

                  {/* Recommended Jobs */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 mt-8">
                        <Zap className="text-purple-500" /> Recommended Jobs
                     </h2>
                     <div className="grid md:grid-cols-2 gap-5">
                        {recommendedJobs.length > 0 ? recommendedJobs.map(job => {
                           const isExternal = !job._id && job.url; // Use URL if no internal ID
                           const jobId = job._id || job.id;
                           const link = isExternal ? job.url : `/jobs/${jobId}`;

                           return (
                              <div key={jobId || Math.random()} className="bg-white dark:bg-[#0f1014] p-6 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all shadow-lg hover:shadow-xl group relative overflow-hidden flex flex-col h-full">
                                 <div className="relative z-10 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                       <div className="w-12 h-12 bg-slate-50 dark:bg-white/10 rounded-2xl flex items-center justify-center font-bold text-slate-900 dark:text-white text-lg border border-slate-100 dark:border-white/5 uppercase">
                                          {job.recruiter?.orgName?.[0] || job.company?.[0] || <Briefcase size={20} />}
                                       </div>
                                       <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md text-slate-500 border border-slate-200 dark:border-white/5">
                                          {job.jobType || "Full Time"}
                                       </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{job.title}</h3>
                                    <p className="text-slate-500 text-xs font-bold mb-4 flex items-center gap-1">
                                       <MapPin size={12} /> {job.location || "Remote"} • <span className="text-green-600 dark:text-green-400">{job.salary || "Not disclosed"}</span>
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap mb-6 mt-auto">
                                       {job.skills?.slice(0, 3).map(skill => (
                                          <span key={skill} className="px-2 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                             {skill}
                                          </span>
                                       ))}
                                    </div>
                                    <button
                                       onClick={() => isExternal ? window.open(link, '_blank') : navigate(link)}
                                       className="w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 group-hover:border-transparent"
                                    >
                                       {isExternal ? 'Apply Now' : 'View Details'} <ArrowRight size={14} />
                                    </button>
                                 </div>
                              </div>
                           );
                        }) : (
                           <div className="col-span-2 text-center py-10 bg-white dark:bg-[#0f1014] rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                              <p className="text-slate-500 font-medium">No job recommendations yet.</p>
                           </div>
                        )}
                     </div>
                  </motion.div>

               </div>

               {/* Sidebar */}
               <div className="space-y-6">

                  {/* Profile Widget */}
                  <motion.div
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                     className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                     <div className="relative z-10 text-center">
                        <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-md rounded-full p-1 mb-4 flex items-center justify-center border-2 border-white/30 shadow-lg">
                           <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <h3 className="text-2xl font-black mb-1">{user?.name}</h3>
                        <p className="text-blue-100 text-sm font-medium mb-8 opacity-80">{user?.role === 'candidate' ? 'Candidate' : user?.role}</p>

                        <div className="bg-black/20 rounded-2xl p-4 mb-6 backdrop-blur-md border border-white/10">
                           <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 opacity-90">
                              <span>Profile Completion</span>
                              <span>{profileScore}%</span>
                           </div>
                           <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden mb-3">
                              <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${profileScore}%` }}></div>
                           </div>

                           {profileMissing.length > 0 && (
                              <div className="flex flex-col gap-2">
                                 {profileMissing.slice(0, 2).map((item, idx) => (
                                    <Link key={idx} to={item.link} className="flex items-center gap-2 text-[10px] font-bold text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                                       <span className="p-1 bg-white/20 rounded-md">{item.icon}</span> {item.label}
                                       <ArrowRight size={10} className="ml-auto opacity-50" />
                                    </Link>
                                 ))}
                              </div>
                           )}
                        </div>

                        <Link to="/profile" className="block w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg active:scale-95">
                           Edit Profile
                        </Link>
                     </div>
                  </motion.div>

                  {/* Notifications Widget */}
                  <motion.div
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                     className="bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none"
                  >
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Bell size={18} className="text-amber-500" /> Activity
                        </h3>
                        <Link to="/notifications" className="text-[10px] font-bold uppercase hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 px-2 py-1 rounded transition-colors">
                           View All
                        </Link>
                     </div>

                     {recentNotifications.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">No recent activity</div>
                     ) : (
                        <div className="space-y-3">
                           {recentNotifications.map((notif, i) => (
                              <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                                 <div className="min-w-2 w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                 <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">{notif.message}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </motion.div>

                  {/* Upcoming Events Mini (REALTIME) */}
                  <motion.div
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
                     className="bg-white dark:bg-[#0f1014] rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none"
                  >
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Calendar size={18} className="text-purple-500" /> Upcoming
                        </h3>
                        <Link to="/events" className="text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-1 rounded hover:bg-purple-100 transition-colors">
                           Events
                        </Link>
                     </div>

                     <div className="space-y-4">
                        {upcomingEvents.length > 0 ? (
                           upcomingEvents.map(event => {
                              const dateObj = getEventDateObj(event.startDate || event.date);
                              const isExternal = event.isExternal || false;
                              return (
                                 <div
                                    key={event._id}
                                    onClick={() => isExternal ? window.open(event.link, '_blank') : navigate(`/events/${event._id}`)}
                                    className="flex gap-4 items-center p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer group"
                                 >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex flex-col items-center justify-center border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-colors relative">
                                       <span className="text-[10px] font-bold uppercase z-10">{dateObj.month}</span>
                                       <span className="text-lg font-black leading-none z-10">{dateObj.day}</span>
                                       {isExternal && (
                                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-[#0f1014]" title="External Event" />
                                       )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                             {event.title}
                                          </h4>
                                          {isExternal && <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900/30 text-[8px] font-bold uppercase text-blue-600 dark:text-blue-400">Ext</span>}
                                       </div>
                                       <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{event.location || "Online"}</p>
                                    </div>
                                 </div>
                              )
                           })
                        ) : (
                           <div className="text-center py-6 text-slate-400 text-xs font-bold">
                              No upcoming events scheduled.
                           </div>
                        )}
                     </div>
                     <Link to="/events" className="block w-full py-3 mt-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        View Calendar
                     </Link>
                  </motion.div>

               </div>
            </div>
         </div>
      </div>
   );
}
