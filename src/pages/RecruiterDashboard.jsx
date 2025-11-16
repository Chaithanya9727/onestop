import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import { Briefcase, Users, FileText, CalendarDays } from "lucide-react";
import useApi from "../hooks/useApi";

export default function RecruiterDashboard() {
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [recruiterData, setRecruiterData] = useState({});
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        const profileRes = await get("/profile/me");
        const statsRes = await get("/recruiter/stats"); // optional endpoint for job/candidate metrics
        setRecruiterData(profileRes.data);
        setStats(statsRes.data || {});
      } catch (err) {
        console.error(err);
        setError("Failed to load recruiter dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
        sx={{
          background: "linear-gradient(90deg, #4F46E5, #6C63FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        🎯 Recruiter Dashboard
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Welcome back, {recruiterData?.name || "Recruiter"} from{" "}
        <strong>{recruiterData?.orgName || "your organization"}</strong>.
      </Typography>

      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.1), rgba(99,102,241,0.2))",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Briefcase size={28} />
              <Box>
                <Typography variant="h6">{stats?.totalJobs || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Jobs Posted
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.2))",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Users size={28} />
              <Box>
                <Typography variant="h6">{stats?.applicants || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Applicants
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.2))",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <FileText size={28} />
              <Box>
                <Typography variant="h6">{stats?.interviews || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled Interviews
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.2))",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <CalendarDays size={28} />
              <Box>
                <Typography variant="h6">{stats?.upcomingEvents || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Events
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Recruiter Status Info */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(250,250,255,0.9))",
        }}
      >
        <Typography variant="h6" mb={1}>
          Account Status
        </Typography>
        <Chip
          label={recruiterData?.status || "unknown"}
          color={
            recruiterData?.status === "approved"
              ? "success"
              : recruiterData?.status === "pending"
              ? "warning"
              : "error"
          }
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        />

        {recruiterData?.status === "approved" ? (
          <Typography mt={2} color="text.secondary">
            ✅ You have full access to the Recruiter Portal. You can post jobs,
            manage applicants, and schedule interviews.
          </Typography>
        ) : recruiterData?.status === "pending" ? (
          <Typography mt={2} color="text.secondary">
            ⏳ Your recruiter account is pending approval. You’ll be notified by
            email once an admin reviews your application.
          </Typography>
        ) : (
          <Typography mt={2} color="error">
            ❌ Your recruiter application was rejected. Contact{" "}
            <strong>support@onestophub.com</strong> for assistance.
          </Typography>
        )}
      </Paper>

      {recruiterData?.status === "approved" && (
        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => (window.location.href = "/recruiter/post-job")}
          >
            ➕ Post a New Job
          </Button>
        </Box>
      )}
    </motion.div>
  );
}
