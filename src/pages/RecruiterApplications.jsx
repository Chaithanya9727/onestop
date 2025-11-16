import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";
import { useParams } from "react-router-dom";

export default function RecruiterApplications() {
  const { id: jobId } = useParams(); // Job ID from URL
  const { get, patch } = useApi();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [jobTitle, setJobTitle] = useState("");

  // 🔁 Fetch applications for this job
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await get(`/rpanel/jobs/${jobId}/applications`);
      setApplications(res.applications || []);
      setJobTitle(res.jobTitle || "Job Applications");
    } catch (err) {
      console.error("Error fetching applications:", err);
      showToast("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      await patch(`/rpanel/applications/${applicationId}`, { status: newStatus });
      showToast(`Application ${newStatus}`, "success");
      setApplications((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      console.error("Failed to update application status:", err);
      showToast("Failed to update status", "error");
    }
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );

  if (applications.length === 0)
    return (
      <Alert severity="info" sx={{ my: 4 }}>
        No applications found for this job.
      </Alert>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ====== Header ====== */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            background: "linear-gradient(90deg, #6c63ff, #ff4081)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🧾 Applications — {jobTitle}
        </Typography>
      </Box>

      {/* ====== Filter Tabs ====== */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        {["all", "applied", "shortlisted", "hired", "rejected"].map((status) => (
          <Chip
            key={status}
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={filter === status ? "primary" : "default"}
            variant={filter === status ? "filled" : "outlined"}
            onClick={() => setFilter(status)}
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
              cursor: "pointer",
            }}
          />
        ))}
      </Box>

      {/* ====== Applications List ====== */}
      <Grid container spacing={3}>
        {filteredApplications.map((app) => (
          <Grid item xs={12} sm={6} lg={4} key={app._id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,255,0.95))",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: "#6c63ff",
                    color: "white",
                    fontWeight: 700,
                    width: 48,
                    height: 48,
                  }}
                >
                  {app.candidate?.name?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {app.candidate?.name || "Unnamed Candidate"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.candidate?.email || "No email"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                📅 Applied on:{" "}
                {new Date(app.createdAt).toLocaleDateString()}
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                📄 Resume:{" "}
                {app.resume ? (
                  <a
                    href={app.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#6c63ff",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View Resume
                  </a>
                ) : (
                  "Not uploaded"
                )}
              </Typography>

              <Box mt={2}>
                <Chip
                  label={app.status}
                  color={
                    app.status === "hired"
                      ? "success"
                      : app.status === "shortlisted"
                      ? "warning"
                      : app.status === "rejected"
                      ? "error"
                      : "default"
                  }
                  size="small"
                  sx={{ textTransform: "capitalize", fontWeight: 600 }}
                />
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Tooltip title="View Details">
                  <IconButton>
                    <VisibilityIcon color="primary" />
                  </IconButton>
                </Tooltip>

                <Box>
                  <Tooltip title="Shortlist">
                    <IconButton
                      onClick={() => updateStatus(app._id, "shortlisted")}
                    >
                      <StarIcon color="warning" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hire">
                    <IconButton
                      onClick={() => updateStatus(app._id, "hired")}
                    >
                      <DoneIcon color="success" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      onClick={() => updateStatus(app._id, "rejected")}
                    >
                      <CloseIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
