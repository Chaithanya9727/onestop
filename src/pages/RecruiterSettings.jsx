// src/pages/RecruiterSettings.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import { useToast } from "../components/ToastProvider.jsx";

export default function RecruiterSettings() {
  const { get, patch } = useApi();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    orgName: "",
    avatar: "",
    companyWebsite: "",
    companyDescription: "",
  });
  const [error, setError] = useState("");

  // Fetch recruiter profile
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await get("/rpanel/profile");
      setProfile(res);
    } catch (err) {
      console.error("Error fetching recruiter profile:", err);
      setError("Failed to load profile. Please try again later.");
      showToast("Failed to load recruiter profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Update recruiter profile
  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        name: profile.name,
        mobile: profile.mobile,
        orgName: profile.orgName,
        avatar: profile.avatar,
        companyWebsite: profile.companyWebsite,
        companyDescription: profile.companyDescription,
      };

      const res = await patch("/rpanel/profile", updateData);
      showToast(res.message || "Profile updated successfully ✅", "success");
      fetchProfile();
    } catch (err) {
      console.error("Error updating recruiter profile:", err);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
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
        ⚙️ Recruiter Settings
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
            backdropFilter: "blur(10px)",
          }}
        >
          <Grid container spacing={3}>
            {/* LEFT SIDE - PROFILE IMAGE */}
            <Grid item xs={12} md={3} textAlign="center">
              <Avatar
                src={profile.avatar || ""}
                alt={profile.name}
                sx={{
                  width: 120,
                  height: 120,
                  margin: "0 auto",
                  mb: 2,
                  bgcolor: "#6c63ff",
                  fontSize: 40,
                }}
              >
                {profile.name ? profile.name[0].toUpperCase() : "R"}
              </Avatar>

              <TextField
                label="Avatar URL"
                name="avatar"
                fullWidth
                value={profile.avatar || ""}
                onChange={handleChange}
                placeholder="Paste image URL"
              />
            </Grid>

            {/* RIGHT SIDE - DETAILS FORM */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address"
                    name="email"
                    value={profile.email}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mobile Number"
                    name="mobile"
                    value={profile.mobile || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Organization Name"
                    name="orgName"
                    value={profile.orgName || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Company Website"
                    name="companyWebsite"
                    value={profile.companyWebsite || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Company Description"
                    name="companyDescription"
                    value={profile.companyDescription || ""}
                    onChange={handleChange}
                    multiline
                    minRows={4}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box textAlign="right" mt={3}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    px: 4,
                    py: 1,
                    fontWeight: 700,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, #6c63ff 0%, #ff4081 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #5a55e0 0%, #e3367d 100%)",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </motion.div>
  );
}
