import React, { useEffect, useState } from "react";
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
  Button,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";

export default function AdminRecruiterApprovals() {
  const { get, patch } = useApi();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // Fetch pending recruiters (backend now returns an array)
  const fetchRecruiters = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await get("/admin/recruiters");
      // The API returns an array directly
      setRecruiters(Array.isArray(list) ? list : list?.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load recruiter data.");
      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    setError("");
    try {
      // action: "approve" | "reject"
      const res = await patch(`/admin/recruiters/${id}/${action}`);
      const serverStatus = res?.status || (action === "approve" ? "approved" : "rejected");

      // Remove from the list (we only show pending)
      setRecruiters((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
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
        🧾 Recruiter Approvals
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : recruiters.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No recruiter applications pending.
        </Typography>
      ) : (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(250,250,255,0.9))",
            backdropFilter: "blur(10px)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Recruiter Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recruiters.map((rec) => (
                <TableRow key={rec._id}>
                  <TableCell>{rec.orgName || "—"}</TableCell>
                  <TableCell>{rec.name || "—"}</TableCell>
                  <TableCell>{rec.email}</TableCell>
                  <TableCell>{rec.mobile || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={rec.status}
                      color={
                        rec.status === "approved"
                          ? "success"
                          : rec.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                      variant="filled"
                      size="small"
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {/* Only show actions for pending */}
                      {rec.status === "pending" && (
                        <>
                          <Tooltip title="Approve recruiter" arrow>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={actionLoading === rec._id}
                              onClick={() => handleAction(rec._id, "approve")}
                            >
                              {actionLoading === rec._id ? "..." : "Approve"}
                            </Button>
                          </Tooltip>

                          <Tooltip title="Reject recruiter" arrow>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              disabled={actionLoading === rec._id}
                              onClick={() => handleAction(rec._id, "reject")}
                            >
                              {actionLoading === rec._id ? "..." : "Reject"}
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </motion.div>
  );
}
