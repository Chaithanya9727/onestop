// src/pages/AdminMentorApprovals.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, XCircle } from "lucide-react";

export default function AdminMentorApprovals() {
  const { role } = useAuth();
  const { get, put } = useApi();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // 🚫 Restrict non-admin access
  if (role !== "admin" && role !== "superadmin") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1e1e2f, #292946)",
          color: "#fff",
        }}
      >
        <Typography variant="h6" color="error">
          ❌ Access Denied — Admins Only
        </Typography>
      </Box>
    );
  }

  // 🧠 Load pending mentor requests
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await get("/mentor/requests");
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching mentor requests:", err);
      showToast("Failed to fetch mentor requests ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // ⚙️ Approve or Reject Mentor Application
  const handleAction = async (id, actionType) => {
    try {
      setActionLoading(id);
      const res = await put(`/mentor/${actionType}/${id}`); // ✅ Corrected API call
      showToast(res.message || `Mentor ${actionType}d successfully ✅`, "success");
      await loadRequests();
    } catch (err) {
      console.error(`Error performing ${actionType} action:`, err);
      showToast(`Failed to ${actionType} mentor ❌`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 🌀 Loading Spinner
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
        <CircularProgress sx={{ color: "#6c63ff" }} />
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        color: "#fff",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e2f, #292946)",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          mb: 3,
          textAlign: { xs: "center", md: "left" },
        }}
      >
        👩‍🏫 Mentor Approval Requests
      </Typography>

      {requests.length === 0 ? (
        <Typography
          sx={{
            textAlign: "center",
            mt: 12,
            color: "rgba(255,255,255,0.7)",
            fontSize: "1.1rem",
          }}
        >
          🎉 No pending mentor applications — all caught up!
        </Typography>
      ) : (
        <Stack spacing={3}>
          {requests.map((req) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  overflow: "hidden",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {req.name || "Unnamed User"}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
                    {req.email || "No email"}
                  </Typography>

                  <Divider
                    sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.2)" }}
                  />

                  <Typography>
                    <b>Expertise:</b> {req.mentorProfile?.expertise || "—"}
                  </Typography>
                  <Typography>
                    <b>Experience:</b> {req.mentorProfile?.experience || "0"} years
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    <b>Bio:</b>{" "}
                    {req.mentorProfile?.bio
                      ? req.mentorProfile.bio
                      : "No bio provided"}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ mt: 2 }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle size={18} />}
                      disabled={actionLoading === req._id}
                      onClick={() => handleAction(req._id, "approve")}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "25px",
                        flex: 1,
                        py: 1.2,
                        background: "linear-gradient(135deg, #4caf50, #66bb6a)",
                      }}
                    >
                      {actionLoading === req._id
                        ? "Approving..."
                        : "Approve Mentor"}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<XCircle size={18} />}
                      disabled={actionLoading === req._id}
                      onClick={() => handleAction(req._id, "reject")}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "25px",
                        flex: 1,
                        py: 1.2,
                        borderColor: "rgba(244,67,54,0.6)",
                        color: "#ef5350",
                        "&:hover": {
                          borderColor: "#ef5350",
                          background: "rgba(244,67,54,0.1)",
                        },
                      }}
                    >
                      {actionLoading === req._id ? "Rejecting..." : "Reject"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}
    </Box>
  );
}
