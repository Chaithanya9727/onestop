// src/pages/RecruiterOverview.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";
import { useSocket } from "../socket.jsx";

export default function RecruiterOverview() {
  const { get } = useApi();
  const { showToast } = useToast();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  // Fetch overview data
  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await get("/rpanel/overview");
      setOverview(res);
    } catch (err) {
      console.error("Error fetching recruiter overview:", err);
      setError("Failed to load recruiter overview data.");
      showToast("Failed to load recruiter overview", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // 🔁 Auto-refresh when recruiter gets new updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = (notif) => {
      if (notif?.type === "job_update" || notif?.type === "application_update") {
        showToast("Dashboard updated with new recruiter data", "info");
        fetchOverview();
      }
    };

    socket.on("recruiter:update", handleJobUpdate);
    return () => socket.off("recruiter:update", handleJobUpdate);
  }, [socket]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ my: 4 }}>
        {error}
      </Alert>
    );

  if (!overview)
    return (
      <Typography textAlign="center" color="text.secondary">
        No overview data available.
      </Typography>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Typography
        variant="h4"
        fontWeight={800}
        mb={3}
        sx={{
          background: "linear-gradient(90deg, #6c63ff, #ff4081)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        📊 Recruiter Dashboard Overview
      </Typography>

      {/* ====== STAT CARDS ====== */}
      <Grid container spacing={3}>
        {[
          { label: "Total Jobs", value: overview.counts.totalJobs, color: "#6c63ff" },
          { label: "Applications", value: overview.counts.totalApplications, color: "#2196f3" },
          { label: "Shortlisted", value: overview.counts.totalShortlisted, color: "#4caf50" },
          { label: "Hired", value: overview.counts.totalHires, color: "#ff4081" },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${stat.color}99, ${stat.color})`,
                color: "#fff",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2">{stat.label}</Typography>
                <Typography variant="h4" fontWeight={800}>
                  {stat.value || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* ====== RECENT JOBS ====== */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        🧾 Recent Job Postings
      </Typography>
      {overview.recentJobs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No recent job postings found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {overview.recentJobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,255,0.95))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  📍 {job.location || "Not specified"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </Typography>
                <Box mt={1}>
                  <Chip
                    size="small"
                    label={job.status}
                    color={
                      job.status === "approved"
                        ? "success"
                        : job.status === "active"
                        ? "primary"
                        : job.status === "pending"
                        ? "warning"
                        : "default"
                    }
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      {/* ====== APPLICATIONS TREND ====== */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        📈 Applications in Last 7 Days
      </Typography>

      {overview.sparkline.length === 0 ? (
        <Typography color="text.secondary" textAlign="center">
          No application activity in the last 7 days.
        </Typography>
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            p: 2,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview.sparkline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6c63ff"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </motion.div>
  );
}
