import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";

export default function JobList() {
  const { get } = useApi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await get("/jobs");
        setJobs(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load job listings.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={3}
        sx={{
          background: "linear-gradient(90deg, #4F46E5, #6C63FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        💼 Explore Career Opportunities
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : jobs.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No jobs available right now.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job._id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,255,0.95))",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {job.location || "Remote"}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    {job.description.length > 100
                      ? job.description.slice(0, 100) + "..."
                      : job.description}
                  </Typography>
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                  <Chip
                    label={job.status}
                    color={job.status === "open" ? "success" : "default"}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    View Details
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </motion.div>
  );
}
