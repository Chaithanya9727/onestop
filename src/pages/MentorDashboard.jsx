// src/pages/MentorDashboard.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { motion } from "framer-motion";
import { User, Edit, MessageSquare, BookOpen } from "lucide-react";
import { useToast } from "../components/ToastProvider";

export default function MentorDashboard() {
  const { user, refreshUser } = useAuth();
  const { get, post, put } = useApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // 🧠 Fetch mentor data and mentees
  const loadData = async () => {
    try {
      setLoading(true);
      const [profile, menteesData] = await Promise.all([
        get("/mentor/profile"),
        get("/mentor/mentees"),
      ]);
      setMentorProfile(profile);
      setMentees(menteesData.mentees || []);
    } catch (error) {
      console.error("Error fetching mentor dashboard data:", error);
      showToast("Failed to load mentor dashboard ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✏️ Update mentor profile
  const handleProfileUpdate = async () => {
    const { expertise, experience, bio } = mentorProfile?.mentorProfile || {};
    if (!expertise?.trim() || !bio?.trim()) {
      showToast("Please fill all required fields ❗", "warning");
      return;
    }

    try {
      setUpdating(true);
      await put("/mentor/profile", { expertise, experience, bio });
      await loadData();
      await refreshUser();
      setOpenEdit(false);
      showToast("✅ Mentor profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("❌ Failed to update profile.", "error");
    } finally {
      setUpdating(false);
    }
  };

  // 💬 Give feedback to a mentee
  const handleAddFeedback = async (studentId) => {
    if (!feedback.trim()) {
      showToast("Feedback cannot be empty ❗", "warning");
      return;
    }

    try {
      setSendingFeedback(true);
      await post(`/mentor/feedback/${studentId}`, { feedback });
      setFeedback("");
      setSelectedStudent(null);
      showToast("✅ Feedback submitted successfully!", "success");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast("❌ Failed to submit feedback.", "error");
    } finally {
      setSendingFeedback(false);
    }
  };

  // 🌀 Loading state
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "#fff",
        }}
      >
        <CircularProgress sx={{ mb: 2, color: "#6c63ff" }} />
        <Typography>Loading your mentor dashboard...</Typography>
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
      {/* ⚠️ Approval Notice */}
      {!mentorProfile?.mentorApproved && (
        <Box
          sx={{
            background: "linear-gradient(90deg, #ff6b6b, #f06595)",
            p: 1.5,
            borderRadius: 2,
            textAlign: "center",
            color: "white",
            mb: 3,
          }}
        >
          <Typography fontWeight={600}>
            ⚠️ Your mentor profile is awaiting admin approval.
          </Typography>
        </Box>
      )}

      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src={user.avatar}
            alt={user.name}
            sx={{
              width: 70,
              height: 70,
              border: "3px solid #6c63ff",
              boxShadow: "0 0 15px rgba(108,99,255,0.5)",
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Mentor Dashboard
            </Typography>
            <Typography variant="subtitle1" color="rgba(255,255,255,0.8)">
              Welcome back, {user.name}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={<Edit size={18} />}
          onClick={() => setOpenEdit(true)}
          sx={{
            background: "linear-gradient(135deg, #6c63ff, #9a6cff)",
            fontWeight: 600,
            borderRadius: "25px",
            textTransform: "none",
            px: 3,
            py: 1,
          }}
        >
          Edit Profile
        </Button>
      </Stack>

      {/* Mentor Profile */}
      <Card
        sx={{
          background: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          mb: 4,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
            <User size={20} style={{ marginRight: 6 }} /> Mentor Profile
          </Typography>
          <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.2)" }} />
          <Typography sx={{ mb: 1 }}>
            <b>Expertise:</b> {mentorProfile?.mentorProfile?.expertise || "Not set"}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <b>Experience:</b>{" "}
            {mentorProfile?.mentorProfile?.experience || 0} years
          </Typography>
          <Typography>
            <b>Bio:</b> {mentorProfile?.mentorProfile?.bio || "No bio added yet."}
          </Typography>
        </CardContent>
      </Card>

      {/* Mentees Section */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        <BookOpen size={22} style={{ marginRight: 8 }} /> Your Mentees (
        {mentees.length})
      </Typography>

      {mentees.length === 0 ? (
        <Typography color="rgba(255,255,255,0.7)">
          No students assigned yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {mentees.map((student) => (
            <motion.div
              key={student._id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                sx={{
                  background: "rgba(255,255,255,0.07)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(6px)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        src={student.avatar}
                        alt={student.name}
                        sx={{
                          width: 50,
                          height: 50,
                          border: "2px solid #6c63ff",
                        }}
                      />
                      <Box>
                        <Typography variant="h6">{student.name}</Typography>
                        <Typography
                          variant="body2"
                          color="rgba(255,255,255,0.7)"
                        >
                          {student.email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<MessageSquare size={16} />}
                        onClick={() =>
                          (window.location.href = `/chat?user=${student._id}`)
                        }
                        sx={{
                          background: "linear-gradient(135deg, #6c63ff, #a88bff)",
                          textTransform: "none",
                        }}
                      >
                        Chat
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setSelectedStudent(student)}
                        sx={{
                          borderColor: "#f48fb1",
                          color: "#f48fb1",
                          textTransform: "none",
                        }}
                      >
                        Give Feedback
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}

      {/* ✏️ Edit Mentor Profile Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit Mentor Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Expertise"
            fullWidth
            margin="normal"
            value={mentorProfile?.mentorProfile?.expertise || ""}
            onChange={(e) =>
              setMentorProfile((prev) => ({
                ...prev,
                mentorProfile: {
                  ...prev.mentorProfile,
                  expertise: e.target.value,
                },
              }))
            }
          />
          <TextField
            label="Experience (years)"
            fullWidth
            type="number"
            margin="normal"
            value={mentorProfile?.mentorProfile?.experience || 0}
            onChange={(e) =>
              setMentorProfile((prev) => ({
                ...prev,
                mentorProfile: {
                  ...prev.mentorProfile,
                  experience: e.target.value,
                },
              }))
            }
          />
          <TextField
            label="Bio"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={mentorProfile?.mentorProfile?.bio || ""}
            onChange={(e) =>
              setMentorProfile((prev) => ({
                ...prev,
                mentorProfile: {
                  ...prev.mentorProfile,
                  bio: e.target.value,
                },
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            onClick={handleProfileUpdate}
            variant="contained"
            disabled={updating}
            sx={{
              background: "linear-gradient(135deg, #6c63ff, #9a6cff)",
            }}
          >
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 💬 Feedback Dialog */}
      <Dialog
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        fullWidth
      >
        <DialogTitle>
          Feedback for {selectedStudent?.name || "Student"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Write Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStudent(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => handleAddFeedback(selectedStudent._id)}
            disabled={!feedback.trim() || sendingFeedback}
            sx={{
              background: "linear-gradient(135deg, #6c63ff, #9a6cff)",
            }}
          >
            {sendingFeedback ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
