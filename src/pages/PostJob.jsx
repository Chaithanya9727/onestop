import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useToast } from "../components/ToastProvider.jsx";
import useApi from "../hooks/useApi.js";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const { post } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillAdd = (e) => {
    e.preventDefault();
    const val = skillInput.trim();
    if (val && !skills.includes(val)) setSkills((prev) => [...prev, val]);
    setSkillInput("");
  };

  const handleSkillDelete = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, skills };
      const res = await post("/jobs/create", payload);
      showToast("Job posted successfully 🎉", "success");
      navigate("/rpanel/jobs");
      console.log("✅ Job Created:", res);
    } catch (err) {
      console.error("❌ Job Post Error:", err);
      showToast("Failed to post job. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

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
        🚀 Post a New Job
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* ===== Job Title ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Job Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* ===== Location ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* ===== Salary ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Salary (e.g. ₹5 LPA)"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* ===== Job Type ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Job Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
              </TextField>
            </Grid>

            {/* ===== Skills ===== */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Required Skills
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 1,
                }}
              >
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    color="primary"
                    onDelete={() => handleSkillDelete(skill)}
                  />
                ))}
              </Stack>
              <Box component="form" onSubmit={handleSkillAdd} sx={{ display: "flex" }}>
                <TextField
                  label="Add Skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ ml: 2, px: 3, background: "#6c63ff" }}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* ===== Description ===== */}
            <Grid item xs={12}>
              <TextField
                label="Job Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={6}
                placeholder="Describe responsibilities, requirements, perks, etc."
                required
              />
            </Grid>
          </Grid>

          <Box textAlign="right" mt={4}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 4,
                py: 1.3,
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: 2,
                background: "linear-gradient(135deg, #6c63ff, #ff4081)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a52e0, #e23370)",
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Post Job"}
            </Button>
          </Box>
        </form>
      </Paper>
    </motion.div>
  );
}
