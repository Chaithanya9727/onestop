import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";

export default function SubmitEntry() {
  const { id } = useParams();
  const { post } = useApi();

  const [submissionLink, setSubmissionLink] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!submissionLink && !file) {
      return setMessage("Please provide either a link or upload a file.");
    }

    const formData = new FormData();
    formData.append("submissionLink", submissionLink);
    if (file) formData.append("file", file);

    try {
      setLoading(true);
      await post(`/events/${id}/submit`, formData, true);
      setMessage("✅ Submission uploaded successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      setMessage("❌ Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Submit Your Entry
        </Typography>

        <TextField
          fullWidth
          label="Submission Link (optional)"
          value={submissionLink}
          onChange={(e) => setSubmissionLink(e.target.value)}
          sx={{ my: 2 }}
        />

        <Button variant="outlined" component="label">
          Upload File
          <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
        </Button>

        {file && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            📎 {file.name}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Submit Entry
          </Button>
        )}

        {message && (
          <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
