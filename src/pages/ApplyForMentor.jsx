// src/pages/ApplyForMentor.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { UserPlus, Info, CheckCircle } from "lucide-react";

export default function ApplyForMentor() {
  const { user, role, refreshUser } = useAuth();
  const { get, post } = useApi();

  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    expertise: "",
    experience: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  // ✅ Fetch mentor status
  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await get("/mentor/status");
      setStatus(data);
    } catch (err) {
      console.error("Error fetching mentor status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // ✅ Submit mentor application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await post("/mentor/apply", formData);
      setToast({ open: true, type: "success", message: res.message });
      setFormData({ expertise: "", experience: "", bio: "" });

      // 🔁 Refresh status & user data
      await loadStatus();
      await refreshUser();
    } catch (err) {
      console.error("Mentor apply error:", err);
      setToast({
        open: true,
        type: "error",
        message: err.message || "Error submitting mentor application",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  const alreadyMentor = status?.mentorApproved || user?.mentorApproved;
  const alreadyApplied = status?.mentorRequested;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e2f, #292946)",
        color: "#fff",
        py: 6,
        px: { xs: 2, md: 4 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Become a Mentor 👩‍🏫
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ mb: 4, color: "rgba(255,255,255,0.7)" }}
        >
          Share your expertise and guide students towards success.
        </Typography>

        {alreadyMentor ? (
          <Card
            sx={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "20px",
              p: 3,
              border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
            }}
          >
            <CardContent>
              <CheckCircle size={50} color="#4caf50" />
              <Typography variant="h5" sx={{ mt: 2 }}>
                You’re already an approved mentor ✅
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                Start helping students through your Mentor Dashboard.
              </Typography>
            </CardContent>
          </Card>
        ) : alreadyApplied ? (
          <Card
            sx={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "20px",
              p: 3,
              border: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Info size={50} color="#fbc02d" />
              <Typography variant="h5" sx={{ mt: 2 }}>
                Your mentor application is under review 🕒
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                Please wait for admin approval. You’ll be notified once approved.
              </Typography>
            </CardContent>
          </Card>
        ) : role !== "candidate" ? (
          <Typography color="error" fontWeight={600}>
            ⚠️ Only candidates can apply to become a mentor.
          </Typography>
        ) : (
          <Card
            sx={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "20px",
              p: 3,
              border: "1px solid rgba(255,255,255,0.15)",
              maxWidth: 700,
              mx: "auto",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Application Form
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Area of Expertise"
                  fullWidth
                  required
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({ ...formData, expertise: e.target.value })
                  }
                />
                <TextField
                  label="Years of Experience"
                  fullWidth
                  type="number"
                  required
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
                <TextField
                  label="Bio / Short Introduction"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />

                <Button
                  variant="contained"
                  startIcon={<UserPlus size={18} />}
                  type="submit"
                  disabled={submitting}
                  sx={{
                    background: "linear-gradient(135deg, #6c63ff, #9a6cff)",
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
                    borderRadius: "25px",
                    mt: 2,
                  }}
                >
                  {submitting ? "Submitting..." : "Apply as Mentor"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* ✅ Toast Message */}
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
