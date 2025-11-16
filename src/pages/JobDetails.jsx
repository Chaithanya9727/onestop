import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import useApi from "../hooks/useApi";

export default function JobDetails() {
  const { id } = useParams();
  const { get, post } = useApi();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Job not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setMessage("");
    try {
      const res = await post(`/jobs/${id}/apply`);
      setMessage(res.data.message || "Applied successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );

  if (!job)
    return (
      <Typography color="error" textAlign="center" mt={4}>
        {message}
      </Typography>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,255,0.95))",
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          {job.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          {job.location || "Remote"}
        </Typography>

        <Typography variant="body2" mb={3}>
          {job.description}
        </Typography>

        <Typography variant="subtitle1" fontWeight={600}>
          Requirements:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1} mb={3}>
          {job.requirements && job.requirements.length > 0 ? (
            job.requirements.map((req, i) => <Chip key={i} label={req} />)
          ) : (
            <Typography variant="body2" color="text.secondary">
              None specified.
            </Typography>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" mb={2}>
          <strong>Deadline:</strong>{" "}
          {new Date(job.deadline).toLocaleDateString()}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          <strong>Salary:</strong> {job.salaryRange || "Not specified"}
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          <strong>Recruiter:</strong> {job.recruiter?.name || "Anonymous"}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          disabled={applying || job.status !== "open"}
          onClick={handleApply}
        >
          {applying ? "Applying..." : "Apply Now"}
        </Button>

        {message && (
          <Typography mt={2} color={message.includes("success") ? "green" : "error"}>
            {message}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
}
