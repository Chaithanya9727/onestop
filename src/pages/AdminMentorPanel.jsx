import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

export default function AdminMentorPanel() {
  const { role } = useAuth();
  const { get, put } = useApi();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  // ✅ Fetch all pending mentors
  const loadMentors = async () => {
    setLoading(true);
    try {
      const data = await get("/users/mentors/pending");
      setMentors(data);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setToast({ open: true, type: "error", message: "Failed to fetch mentors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
  }, []);

  // ✅ Approve mentor
  const handleApprove = async (id) => {
    try {
      await put(`/users/mentors/${id}/approve`);
      setToast({ open: true, type: "success", message: "Mentor approved successfully ✅" });
      loadMentors();
    } catch (err) {
      setToast({ open: true, type: "error", message: "Error approving mentor" });
    }
  };

  // ✅ Reject mentor
  const handleReject = async (id) => {
    try {
      await put(`/users/mentors/${id}/reject`);
      setToast({ open: true, type: "info", message: "Mentor request rejected ❌" });
      loadMentors();
    } catch (err) {
      setToast({ open: true, type: "error", message: "Error rejecting mentor" });
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e2f, #292946)",
        color: "#fff",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Users size={40} color="#6c63ff" />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Mentor Approval Panel
            </Typography>
            <Typography variant="subtitle1" color="rgba(255,255,255,0.7)">
              Manage mentor requests — only for Admins & SuperAdmins
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {mentors.length === 0 ? (
        <Typography color="rgba(255,255,255,0.7)">
          No pending mentor requests found.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <CardContent>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={3}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={mentor.avatar}
                        alt={mentor.name}
                        sx={{ width: 60, height: 60, border: "2px solid #6c63ff" }}
                      >
                        {mentor.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {mentor.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="rgba(255,255,255,0.7)"
                        >
                          {mentor.email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <b>Expertise:</b> {mentor.mentorProfile?.expertise || "Not specified"}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <b>Experience:</b> {mentor.mentorProfile?.experience || 0} years
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        <b>Bio:</b> {mentor.mentorProfile?.bio || "No bio provided"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle size={18} />}
                        onClick={() => handleApprove(mentor._id)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: "20px",
                          background: "linear-gradient(135deg, #00c853, #43a047)",
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<XCircle size={18} />}
                        onClick={() => handleReject(mentor._id)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: "20px",
                          background: "linear-gradient(135deg, #ff5252, #d32f2f)",
                        }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}

      {/* ✅ Snackbar / Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.type}
          variant="filled"
          onClose={() => setToast({ ...toast, open: false })}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
