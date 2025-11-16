import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
  MenuItem,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { motion } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";

export default function CreateEvent() {
  const { post } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    organizer: "",
    category: "other",
    tags: [],
    location: "Online",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxTeamSize: 1,
    prizes: [""],
    rules: [""],
  });

  const [faqs, setFaqs] = useState([{ q: "", a: "" }]);
  const [cover, setCover] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateForm = () => {
    const { title, startDate, endDate, registrationDeadline } = form;
    if (!title || !startDate || !endDate || !registrationDeadline) {
      showToast("⚠️ Please fill all required fields", "warning");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, val]) => {
        if (Array.isArray(val)) fd.append(key, JSON.stringify(val));
        else fd.append(key, val);
      });

      // ✅ Convert FAQ structure to match backend
      fd.append(
        "faqs",
        JSON.stringify(
          faqs
            .filter((f) => f.q.trim() && f.a.trim())
            .map((f) => ({ question: f.q, answer: f.a }))
        )
      );

      if (cover) fd.append("cover", cover);

      await post("/events", fd, true);
      showToast("✅ Event created successfully!", "success");
      navigate("/admin/events");
    } catch (err) {
      console.error("CreateEvent error:", err);
      showToast(`❌ Failed to create event: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic list handlers
  const addStr = (key) => setForm((f) => ({ ...f, [key]: [...f[key], ""] }));
  const setStr = (key, idx, val) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr[idx] = val;
      return { ...f, [key]: arr };
    });
  const delStr = (key, idx) =>
    setForm((f) => {
      const arr = [...f[key]];
      arr.splice(idx, 1);
      return { ...f, [key]: arr };
    });

  const setFaq = (idx, key, val) =>
    setFaqs((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
  const addFaq = () => setFaqs((s) => [...s, { q: "", a: "" }]);
  const delFaq = (idx) => setFaqs((s) => s.filter((_, i) => i !== idx));

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            🛠️ Create / Manage Event
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Title *"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              sx={{ maxWidth: 280 }}
            >
              <MenuItem value="hackathon">Hackathon</MenuItem>
              <MenuItem value="quiz">Quiz</MenuItem>
              <MenuItem value="case">Case Study</MenuItem>
              <MenuItem value="job-challenge">Job Challenge</MenuItem>
              <MenuItem value="workshop">Workshop</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              label="Organizer"
              value={form.organizer}
              onChange={(e) => set("organizer", e.target.value)}
              sx={{ maxWidth: 420 }}
            />
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              sx={{ maxWidth: 420 }}
            />

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <TextField
                label="Start Date & Time *"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date & Time *"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Registration Deadline *"
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <TextField
              label="Max Team Size"
              type="number"
              value={form.maxTeamSize}
              onChange={(e) => set("maxTeamSize", Math.max(1, Number(e.target.value)))}
              sx={{ maxWidth: 200 }}
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              fullWidth
              multiline
              minRows={4}
            />

            <TextField
              label="Tags (comma separated)"
              value={form.tags?.join(", ")}
              onChange={(e) =>
                set("tags", e.target.value.split(",").map((t) => t.trim()))
              }
              fullWidth
            />

            {/* Prizes */}
            <Divider textAlign="left">🏆 Prizes</Divider>
            {form.prizes.map((p, i) => (
              <Stack key={i} direction="row" spacing={1}>
                <TextField
                  label={`Prize ${i + 1}`}
                  value={p}
                  onChange={(e) => setStr("prizes", i, e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => delStr("prizes", i)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addStr("prizes")}>+ Add Prize</Button>

            {/* Rules */}
            <Divider textAlign="left">📜 Rules</Divider>
            {form.rules.map((r, i) => (
              <Stack key={i} direction="row" spacing={1}>
                <TextField
                  label={`Rule ${i + 1}`}
                  value={r}
                  onChange={(e) => setStr("rules", i, e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => delStr("rules", i)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => addStr("rules")}>+ Add Rule</Button>

            {/* FAQs */}
            <Divider textAlign="left">💬 FAQs</Divider>
            {faqs.map((f, i) => (
              <Stack key={i} direction="row" spacing={1}>
                <TextField
                  label="Question"
                  value={f.q}
                  onChange={(e) => setFaq(i, "q", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Answer"
                  value={f.a}
                  onChange={(e) => setFaq(i, "a", e.target.value)}
                  fullWidth
                />
                <IconButton onClick={() => delFaq(i)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={addFaq}>+ Add FAQ</Button>

            {/* Cover Image */}
            <Divider textAlign="left">🖼️ Cover Image</Divider>
            <Button variant="outlined" component="label">
              Upload Cover
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
              />
            </Button>
            {cover && <Chip label={cover.name} sx={{ mt: 1 }} />}

            {/* Save */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={submit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {loading ? "Saving..." : "Save Event"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </motion.div>
  );
}
