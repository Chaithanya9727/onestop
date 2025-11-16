import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  Tooltip,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Search,
  Refresh,
  Visibility,
  Download,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import useApi from "../hooks/useApi";

export default function AdminJobs() {
  const { get, patch, del, post } = useApi();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // ✅ Fetch all jobs and analytics
  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        get("/admin/jobs"),
        get("/admin/insights"),
      ]);
      setJobs(jobsRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs or analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.recruiter?.email?.toLowerCase().includes(q) ||
        j.recruiter?.name?.toLowerCase().includes(q) ||
        j.recruiter?.orgName?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" ? true : j.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [jobs, query, statusFilter]);

  // ✅ Toggle job open/close
  const handleToggle = async (job) => {
    const newStatus = job.status === "open" ? "closed" : "open";
    setActionLoading(job._id);
    try {
      const res = await patch(`/admin/jobs/${job._id}/status`, { status: newStatus });
      setJobs((prev) => prev.map((x) => (x._id === job._id ? res.data.job : x)));

      // 🔔 Notify recruiter
      await post("/notifications/send", {
        userId: job.recruiter?._id,
        title: "Job Status Updated",
        message: `Your job "${job.title}" has been marked as ${newStatus}.`,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Approve job
  const handleApprove = async (job) => {
    setActionLoading(job._id);
    try {
      const res = await patch(`/admin/jobs/${job._id}/approve`, { approved: true });
      setJobs((prev) => prev.map((x) => (x._id === job._id ? res.data.job : x)));

      // 🔔 Notify recruiter
      await post("/notifications/send", {
        userId: job.recruiter?._id,
        title: "Job Approved ✅",
        message: `Your job "${job.title}" has been approved and is now visible to candidates.`,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to approve job.");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Reject job
  const handleReject = async (job) => {
    if (!window.confirm("Reject this job? This will notify the recruiter.")) return;
    setActionLoading(job._id);
    try {
      await patch(`/admin/jobs/${job._id}/approve`, { approved: false });
      setJobs((prev) =>
        prev.map((x) =>
          x._id === job._id ? { ...x, approved: false, status: "closed" } : x
        )
      );

      // 🔔 Notify recruiter
      await post("/notifications/send", {
        userId: job.recruiter?._id,
        title: "Job Rejected ❌",
        message: `Your job "${job.title}" was rejected by the admin. Please review your listing.`,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to reject job.");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Delete job
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job listing? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      await del(`/admin/jobs/${id}`);
      setJobs((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete job.");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ View applicants
  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
    setApplicants([]);
    setLoadingApplicants(true);
    try {
      const res = await get(`/admin/jobs/${job._id}/applicants`);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // ✅ Export CSV
  const exportCSV = () => {
    if (applicants.length === 0) return;
    const header = ["Name", "Email", "Mobile", "Role", "Applied At"];
    const rows = applicants.map((a) => [
      a.name,
      a.email,
      a.mobile,
      a.role,
      new Date(a.appliedAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${selectedJob.title}_Applicants.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          background: "linear-gradient(90deg, #6c63ff, #ff4081)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        🧭 Admin · Job Oversight & Analytics
      </Typography>

      {/* Analytics Section */}
      {analytics && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f7f9fc, #eef1f6)",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            📊 System Overview
          </Typography>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Chip
              label={`Total Jobs: ${analytics.jobs?.totalJobs || 0}`}
              color="primary"
            />
            <Chip
              label={`Open Jobs: ${analytics.jobs?.openJobs || 0}`}
              color="success"
            />
            <Chip
              label={`Closed Jobs: ${analytics.jobs?.closedJobs || 0}`}
              color="default"
            />
            <Chip
              label={`Recruiters: ${analytics.recruiters?.totalRecruiters || 0}`}
              color="secondary"
            />
            <Chip
              label={`Applicants: ${analytics.applicants?.totalApplicants || 0}`}
              color="info"
            />
          </Stack>
        </Paper>
      )}

      {/* Filters */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        mb={2}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flex={1}>
          <TextField
            placeholder="Search title, location, recruiter name/email/org..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
        </Stack>

        <IconButton onClick={fetchJobs} title="Refresh">
          <Refresh />
        </IconButton>
      </Stack>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No jobs match your filters.
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Recruiter</TableCell>
                <TableCell>Applicants</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approval</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.location || "Remote"}</TableCell>
                  <TableCell>
                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.3}>
                      <Typography variant="body2" fontWeight={600}>
                        {job.recruiter?.name || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.recruiter?.email || "—"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{job.applicants?.length || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={job.status === "open" ? "success" : "default"}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>
                    {job.approved ? (
                      <Chip label="Approved" color="success" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Applicants">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleViewApplicants(job)}
                        >
                          View
                        </Button>
                      </Tooltip>
                      <Tooltip title="Approve Job">
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircle />}
                            disabled={actionLoading === job._id}
                            onClick={() => handleApprove(job)}
                          >
                            Approve
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="Reject Job">
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            disabled={actionLoading === job._id}
                            onClick={() => handleReject(job)}
                          >
                            Reject
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* 👥 Applicants Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Applicants — {selectedJob?.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {loadingApplicants ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : applicants.length === 0 ? (
            <Typography color="text.secondary">
              No applicants for this job yet.
            </Typography>
          ) : (
            <>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: "60vh",
                  overflow: "auto",
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applicants.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell>{a.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={exportCSV}
              >
                Export CSV
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </motion.div>
  );
}
