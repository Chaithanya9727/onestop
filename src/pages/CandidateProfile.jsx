import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";

export default function CandidateProfile() {
  const { get, post, put, del } = useApi();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [savingCL, setSavingCL] = useState(false);
  const [msg, setMsg] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await get("/candidate/profile");
      setMe(res.data);
      setCoverLetter(res.data.coverLetter || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadResume = async () => {
    if (!cvFile) return;
    const formData = new FormData();
    formData.append("file", cvFile);
    try {
      setMsg("");
      const res = await post("/candidate/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(res.data.message || "Resume uploaded.");
      loadProfile();
    } catch (e) {
      setMsg(e.response?.data?.message || "Upload failed.");
    }
  };

  const saveCoverLetter = async () => {
    try {
      setSavingCL(true);
      const res = await put("/candidate/cover-letter", { coverLetter });
      setMsg(res.data.message || "Updated cover letter.");
    } catch (e) {
      setMsg(e.response?.data?.message || "Save failed.");
    } finally {
      setSavingCL(false);
    }
  };

  const unsaveJob = async (id) => {
    try {
      await del(`/candidate/save/${id}`);
      loadProfile();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
        🧾 Candidate Profile
      </Typography>

      {msg && (
        <Typography mb={2} color={msg.toLowerCase().includes("fail") ? "error" : "green"}>
          {msg}
        </Typography>
      )}

      {/* Resume */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Resume
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Upload PDF resumes only.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <input type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files[0])} />
          <Button variant="contained" onClick={uploadResume} disabled={!cvFile}>
            Upload
          </Button>
          {me?.resumeUrl && (
            <Button variant="outlined" component="a" href={me.resumeUrl} target="_blank" rel="noreferrer">
              View Current
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Cover Letter */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Cover Letter
        </Typography>
        <TextField
          placeholder="Write a short cover letter..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          fullWidth
          multiline
          minRows={4}
        />
        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={saveCoverLetter} disabled={savingCL}>
            {savingCL ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        {/* Saved Jobs */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Saved Jobs
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {me?.savedJobs?.length ? (
            me.savedJobs.map((job) => (
              <Box
                key={job._id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.08)",
                  mb: 1.5,
                }}
              >
                <Typography fontWeight={600}>{job.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.location || "Remote"} ·{" "}
                  <Chip
                    label={job.status}
                    color={job.status === "open" ? "success" : "default"}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" variant="outlined" href={`/jobs/${job._id}`}>
                    View
                  </Button>
                  <Button size="small" color="error" variant="contained" onClick={() => unsaveJob(job._id)}>
                    Unsave
                  </Button>
                </Stack>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No saved jobs.</Typography>
          )}
        </Paper>

        {/* Applications */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Applications
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {me?.applications?.length ? (
            me.applications
              .slice()
              .reverse()
              .map((a) => (
                <Box
                  key={`${a.job?._id}-${a.appliedAt}`}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    mb: 1.5,
                  }}
                >
                  <Typography fontWeight={600}>{a.job?.title || "Job unavailable"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.job?.location || "Remote"} ·{" "}
                    <Chip
                      label={a.status}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                      color={
                        a.status === "applied"
                          ? "default"
                          : a.status === "under_review"
                          ? "info"
                          : a.status === "shortlisted"
                          ? "success"
                          : a.status === "hired"
                          ? "success"
                          : a.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Applied: {new Date(a.appliedAt).toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Button size="small" variant="outlined" href={`/jobs/${a.job?._id}`}>
                      View
                    </Button>
                    {a.status !== "withdrawn" && (
                      <Button
                        size="small"
                        color="warning"
                        variant="contained"
                        onClick={async () => {
                          try {
                            await fetch(`/api/candidate/applications/${a.job?._id}/status`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                              body: JSON.stringify({ status: "withdrawn" }),
                            });
                            setMsg("Application withdrawn.");
                            loadProfile();
                          } catch (e) {
                            setMsg("Failed to withdraw.");
                          }
                        }}
                      >
                        Withdraw
                      </Button>
                    )}
                  </Stack>
                </Box>
              ))
          ) : (
            <Typography color="text.secondary">No applications yet.</Typography>
          )}
        </Paper>
      </Stack>
    </motion.div>
  );
}
