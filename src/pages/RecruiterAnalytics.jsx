// src/pages/RecruiterAnalytics.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";
import { useSocket } from "../socket.jsx";

export default function RecruiterAnalytics() {
  const { get } = useApi();
  const { showToast } = useToast();
  const { socket } = useSocket();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await get("/rpanel/analytics");
      setAnalytics(res);
    } catch (err) {
      console.error("Error fetching recruiter analytics:", err);
      setError("Failed to load analytics data.");
      showToast("Failed to load analytics data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // 🔁 Refresh analytics on live recruiter updates
  useEffect(() => {
    if (!socket) return;
    const handleAnalyticsUpdate = (notif) => {
      if (notif?.type === "job_update" || notif?.type === "application_update") {
        showToast("Recruiter analytics updated", "info");
        fetchAnalytics();
      }
    };
    socket.on("recruiter:update", handleAnalyticsUpdate);
    return () => socket.off("recruiter:update", handleAnalyticsUpdate);
  }, [socket]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!analytics)
    return (
      <Typography textAlign="center" color="text.secondary" mt={4}>
        No analytics data found.
      </Typography>
    );

  const statusCards = [
    { label: "Pending", value: analytics.pending || 0, color: "#ff9800" },
    { label: "Shortlisted", value: analytics.shortlisted || 0, color: "#4caf50" },
    { label: "Rejected", value: analytics.rejected || 0, color: "#f44336" },
    { label: "Hired", value: analytics.hired || 0, color: "#2196f3" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
        sx={{
          background: "linear-gradient(90deg, #6c63ff, #ff4081)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        📈 Recruiter Analytics Dashboard
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Gain insights into your hiring process and candidate performance trends.
      </Typography>

      {/* ====== STATUS CARDS ====== */}
      <Grid container spacing={3}>
        {statusCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${card.color}aa, ${card.color})`,
                color: "#fff",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2">{card.label}</Typography>
                <Typography variant="h4" fontWeight={800}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* ====== APPLICATION TRENDS ====== */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        📊 Applications Over Time (Last 30 Days)
      </Typography>
      {analytics.trends?.length ? (
        <Card sx={{ p: 2, borderRadius: 3, background: "rgba(255,255,255,0.9)" }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#6c63ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Typography color="text.secondary" textAlign="center">
          No application trends found.
        </Typography>
      )}

      <Divider sx={{ my: 5 }} />

      {/* ====== TOP JOBS ====== */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        🏆 Top 5 Most Applied Jobs
      </Typography>
      {analytics.topJobs?.length ? (
        <Card sx={{ p: 2, borderRadius: 3, background: "rgba(255,255,255,0.95)" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topJobs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applications" fill="#6c63ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Typography color="text.secondary" textAlign="center">
          No job data available.
        </Typography>
      )}
    </motion.div>
  );
}
