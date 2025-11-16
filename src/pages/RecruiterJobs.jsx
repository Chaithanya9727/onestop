import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  Button,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/AddCircleOutline";
import useApi from "../hooks/useApi.js";
import { useToast } from "../components/ToastProvider.jsx";
import { useNavigate } from "react-router-dom";

export default function RecruiterJobs() {
  const { get } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await get("/rpanel/jobs");
      setJobs(res.jobs || []);
    } catch (err) {
      console.error("Error fetching recruiter jobs:", err);
      showToast("Failed to load your jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ===== Header ===== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            background: "linear-gradient(90deg, #6c63ff, #ff4081)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          💼 My Job Listings
        </Typography>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            background: "linear-gradient(135deg, #6c63ff, #ff4081)",
          }}
          onClick={() => navigate("/rpanel/post-job")}
        >
          Post New Job
        </Button>
      </Box>

      {/* ===== Filters ===== */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        {["all", "active", "pending", "approved", "closed"].map((status) => (
          <Chip
            key={status}
            label={
              status.charAt(0).toUpperCase() + status.slice(1)
            }
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

      {/* ===== Job Cards ===== */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filteredJobs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 5, textAlign: "center", borderRadius: 3 }}
        >
          <Typography variant="h6" color="text.secondary">
            No jobs found under “{filter}” category.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={6} lg={4} key={job._id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,255,0.95))",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📍 {job.location || "Not specified"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    💰 {job.salary || "Not disclosed"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🕒 {job.type || "Full-time"}
                  </Typography>

                  <Box mt={1}>
                    <Chip
                      label={job.status}
                      color={
                        job.status === "active"
                          ? "primary"
                          : job.status === "approved"
                          ? "success"
                          : job.status === "pending"
                          ? "warning"
                          : "default"
                      }
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="body2"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: "text.secondary",
                    }}
                  >
                    {job.description || "No description provided."}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <Tooltip title="View Applications">
                      <IconButton
                        onClick={() =>
                          navigate(`/rpanel/jobs/${job._id}/applications`)
                        }
                      >
                        <VisibilityIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Job">
                      <IconButton>
                        <EditIcon color="secondary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </motion.div>
  );
}
