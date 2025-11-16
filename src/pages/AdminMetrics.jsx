// ✅ src/pages/AdminMetrics.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";

export default function AdminMetrics() {
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await get("/admin/insights");
        setInsights(res.data);
      } catch (err) {
        console.error("Error fetching system insights:", err);
        setError("Failed to load admin insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

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

  const Card = ({ title, value, subtitle, gradient }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        background: gradient || "linear-gradient(135deg, #f9f9ff, #ffffff)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        {title}
      </Typography>
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color: "primary.main", mt: 0.5 }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
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
        mb={4}
        sx={{
          background: "linear-gradient(90deg, #4F46E5, #6C63FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        📊 System Insights Dashboard
      </Typography>

      {/* ===== GRID SECTION ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            title="Total Jobs"
            value={insights?.jobs?.totalJobs ?? 0}
            subtitle={`Open: ${insights?.jobs?.openJobs ?? 0} • Closed: ${
              insights?.jobs?.closedJobs ?? 0
            }`}
            gradient="linear-gradient(135deg, #6c63ff99, #6c63ff)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            title="Recruiters"
            value={insights?.recruiters?.totalRecruiters ?? 0}
            subtitle={`Approved: ${
              insights?.recruiters?.approvedRecruiters ?? 0
            } • Pending: ${insights?.recruiters?.pendingRecruiters ?? 0}`}
            gradient="linear-gradient(135deg, #ff408199, #ff4081)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            title="Applicants"
            value={insights?.applicants?.totalApplicants ?? 0}
            subtitle={`Last 7 days: ${
              insights?.applicants?.last7dApplicants ?? 0
            }`}
            gradient="linear-gradient(135deg, #2196f399, #2196f3)"
          />
        </Grid>
      </Grid>

      {/* ===== TIMESTAMP ===== */}
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mt={4}
        textAlign="center"
      >
        Last updated:{" "}
        {new Date(insights?.generatedAt || Date.now()).toLocaleString()}
      </Typography>
    </motion.div>
  );
}
