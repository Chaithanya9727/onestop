// ✅ src/App.jsx (FULL UPDATED — FINAL)
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
// import { CssBaseline } from "@mui/material"; // Removed

// 🧩 Context Providers
import { SocketProvider } from "./socket.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";

// 🧱 Layouts & Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import PageTransition from "./components/PageTransition.jsx";
import BackgroundGlow from "./components/BackgroundGlow.jsx";
import CareerCopilot from "./components/CareerCopilot.jsx";

// Mentorship (New)
import { lazy } from "react";
const FindMentor = lazy(() => import("./pages/FindMentor.jsx"));
const MentorProfilePublic = lazy(() => import("./pages/MentorProfilePublic.jsx"));
const MyMentorshipSessions = lazy(() => import("./pages/MyMentorshipSessions.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const GlobalLeaderboard = lazy(() => import("./pages/GlobalLeaderboard.jsx"));
const PlayQuiz = lazy(() => import("./pages/events/PlayQuiz.jsx"));


// 💼 Recruiter Layout & Pages
import RecruiterLayout from "./layouts/RecruiterLayout.jsx";
import RecruiterOverview from "./pages/RecruiterOverview.jsx";
import RecruiterSettings from "./pages/RecruiterSettings.jsx";
import RecruiterAnalytics from "./pages/RecruiterAnalytics.jsx";
import RecruiterJobs from "./pages/RecruiterJobs.jsx";
import RecruiterApplications from "./pages/RecruiterApplications.jsx";
import PostJob from "./pages/PostJob.jsx";

// 👑 Admin Layout & Pages
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Users from "./pages/Users.jsx";
import AdminJobs from "./pages/AdminJobs.jsx";
import AdminLogs from "./pages/AdminLogs.jsx";
import AdminMessages from "./pages/AdminMessages.jsx";
import AdminMentorApprovals from "./pages/AdminMentorApprovals.jsx";
import AdminRecruiterApprovals from "./pages/AdminRecruiterApprovals.jsx";
import AdminMetrics from "./pages/AdminMetrics.jsx";
import AdminEventMetrics from "./pages/AdminEventMetrics.jsx";

// 🌈 Events
import EventsList from "./pages/events/EventsList.jsx";
import EventDetails from "./pages/events/EventDetails.jsx";
import SubmitEntry from "./pages/events/SubmitEntry.jsx";
import Leaderboard from "./pages/events/Leaderboard.jsx";
import CreateEvent from "./pages/events/CreateEvent.jsx";
import EventRegistrations from "./pages/events/EventRegistrations.jsx";
import JudgePanel from "./components/events/JudgePanel.jsx";
import MyRegistrations from "./components/events/MyRegistrations.jsx";
const AdminEventManager = lazy(() => import("./components/events/AdminEventManager.jsx"));
const ManageQuiz = lazy(() => import("./pages/events/ManageQuiz.jsx"));
const EditEvent = lazy(() => import("./pages/events/EditEvent.jsx"));

// 🎓 Mentor System
import MentorDashboard from "./pages/MentorDashboard.jsx";
import ApplyForMentor from "./pages/ApplyForMentor.jsx";
import BecomeMentor from "./pages/BecomeMentor.jsx";

// 🌍 Public + Common Pages
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import RegisterRecruiter from "./pages/RegisterRecruiter.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyOtp from "./pages/verifyOtp.jsx";
import OauthSuccess from "./pages/OauthSuccess.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Resources from "./pages/Resources.jsx";
import Notices from "./pages/Notices.jsx";
import Profile from "./pages/Profile.jsx";
import JobList from "./pages/JobList.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import CandidateApplications from "./pages/CandidateApplications.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import Chat from "./pages/Chat.jsx";

// 🏆 Competitions
import Contests from "./pages/Contests.jsx";
import Hackathons from "./pages/Hackathons.jsx";
import Challenges from "./pages/Challenges.jsx";
import Jobs from "./pages/Jobs.jsx";
import Internships from "./pages/Internships.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import Community from "./pages/Community.jsx";
import MockInterview from "./pages/MockInterview.jsx";
import TeamFinder from "./pages/TeamFinder.jsx";

export default function App() {
  const location = useLocation();

  const showBackgroundGlow = [
    "/",
    "/login",
    "/register",
    "/register-recruiter",
    "/verify-otp",
    "/oauth-success",
  ].includes(location.pathname);

  const isRecruiterPanel = location.pathname.startsWith("/rpanel");

  return (
    <>
      {/* CssBaseline Removed for Tailwind Migration */}

      <SocketProvider>
        <ToastProvider>
          {!isRecruiterPanel && <Navbar />}
          {showBackgroundGlow && !isRecruiterPanel && <BackgroundGlow />}
          {!isRecruiterPanel && <CareerCopilot />}

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{
                minHeight: isRecruiterPanel ? "100vh" : "100vh",
              }}
            >
              <PageTransition>
                <Routes>

                  {/* 🌍 PUBLIC ROUTES */}
                  <Route path="/" element={<Home />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* 🏆 COMPETITIONS & OPPORTUNITIES */}
                  <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
                  <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
                  <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />

                  <Route path="/leaderboard" element={<ProtectedRoute><GlobalLeaderboard /></ProtectedRoute>} />
                  <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />

                  <Route path="/opportunities/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                  <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />


                  <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                  <Route path="/register-recruiter" element={<GuestRoute><RegisterRecruiter /></GuestRoute>} />
                  <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/oauth-success" element={<OauthSuccess />} />

                  {/* 🔐 PASSWORD RESET */}
                  <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                  <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
                  
                  {/* 🤖 AI TOOLS */}
                  <Route path="/resume-shield" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
                  <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
                  <Route path="/team-finder" element={<ProtectedRoute><TeamFinder /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />

                  {/* 🔒 AUTH ROUTES */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

                  {/* 🌈 EVENTS */}
                  <Route path="/events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
                  <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                  <Route path="/events/submit/:id" element={<ProtectedRoute><SubmitEntry /></ProtectedRoute>} />
                  <Route path="/events/:id/leaderboard" element={<Leaderboard />} />
                  <Route path="/events/:id/play" element={<ProtectedRoute><PlayQuiz /></ProtectedRoute>} />
                  <Route path="/events/my/registrations" element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>} />

                  {/* ADMIN EVENT ROUTES */}
                  <Route path="/admin/events" element={<ProtectedRoute roles={['admin', 'mentor', 'superadmin', 'recruiter']}><AdminEventManager /></ProtectedRoute>} />
                  <Route path="/events/:id/manage-quiz" element={<ProtectedRoute roles={['admin', 'mentor', 'superadmin', 'recruiter']}><ManageQuiz /></ProtectedRoute>} />
                  <Route path="/events/:id/edit" element={<ProtectedRoute roles={['admin', 'mentor', 'superadmin', 'recruiter']}><EditEvent /></ProtectedRoute>} />
                  <Route path="/admin/events/registrations/:id" element={<ProtectedRoute roles={["admin","superadmin", "recruiter"]}><EventRegistrations /></ProtectedRoute>} />
                  <Route path="/admin/events/judge/:id" element={<ProtectedRoute roles={["admin","superadmin", "recruiter"]}><JudgePanel /></ProtectedRoute>} />
                  <Route path="/admin/create-event" element={<ProtectedRoute roles={["admin","superadmin", "recruiter"]}><CreateEvent /></ProtectedRoute>} />

                  {/* 🌟 MENTOR */}
                  <Route path="/mentors" element={<ProtectedRoute><FindMentor /></ProtectedRoute>} />
                  <Route path="/mentor/:id" element={<ProtectedRoute><MentorProfilePublic /></ProtectedRoute>} />
                  <Route path="/mentorship/my-sessions" element={<ProtectedRoute><MyMentorshipSessions /></ProtectedRoute>} />
                  <Route path="/mentor-dashboard" element={<ProtectedRoute roles={["mentor"]}><MentorDashboard /></ProtectedRoute>} />
                  <Route path="/apply-for-mentor" element={<ProtectedRoute roles={["candidate"]}><ApplyForMentor /></ProtectedRoute>} />
                  <Route path="/become-mentor" element={<ProtectedRoute><BecomeMentor /></ProtectedRoute>} />

                  {/* 🧩 RECRUITER PANEL */}
                  <Route
                    path="/rpanel"
                    element={
                      <ProtectedRoute roles={["recruiter"]}>
                        <RecruiterLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="overview" element={<RecruiterOverview />} />
                    <Route path="post-job" element={<PostJob />} />
                    <Route path="jobs" element={<RecruiterJobs />} />
                    <Route path="jobs/:id/applications" element={<RecruiterApplications />} />
                    <Route path="applications" element={<RecruiterApplications />} />
                    <Route path="events" element={<EventsList />} />
                    <Route path="analytics" element={<RecruiterAnalytics />} />
                    <Route path="settings" element={<RecruiterSettings />} />
                  </Route>

                  {/* 👑 ADMIN PANEL */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute roles={["admin", "superadmin"]}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminPanel />} />
                    <Route path="users" element={<Users />} />
                    <Route path="jobs" element={<AdminJobs />} />
                    <Route path="logs" element={<AdminLogs />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="mentor-approvals" element={<AdminMentorApprovals />} />
                    <Route path="recruiter-approvals" element={<AdminRecruiterApprovals />} />
                    <Route path="metrics" element={<AdminMetrics />} />
                    <Route path="event-metrics" element={<AdminEventMetrics />} />
                  </Route>

                  {/* 🌐 JOB PORTAL */}
                  <Route path="/jobs" element={<JobList />} />
                  <Route path="/jobs/:id" element={<ProtectedRoute roles={["candidate"]}><JobDetails /></ProtectedRoute>} />
                  <Route path="/candidate/applications" element={<ProtectedRoute roles={["candidate"]}><CandidateApplications /></ProtectedRoute>} />

                  {/* ❌ 404 */}
                  <Route path="*" element={<div style={{ textAlign: "center", marginTop: 80 }}>404 — Page Not Found</div>} />
                </Routes>
              </PageTransition>

              {!isRecruiterPanel && <Footer />}
            </motion.div>
          </AnimatePresence>
        </ToastProvider>
      </SocketProvider>
    </>
  );
}
