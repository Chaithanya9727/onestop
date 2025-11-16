import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import RuleIcon from "@mui/icons-material/Rule";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ToastProvider";

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { get, post } = useApi();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await get(`/events/${id}`);
        setEvent(res);
      } catch (err) {
        console.error("FetchEvent error:", err);
        showToast("Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      setRegistering(true);

      await post(`/events/${id}/register`);

      showToast("🎉 Successfully registered!", "success");
      setTimeout(() => navigate("/events/my/registrations"), 1000);
    } catch (err) {
      console.log("FULL ERROR OBJECT:", err);

      const msg =
        err?.data?.message ||
        err?.message ||
        "Registration failed";

      const lowerMsg = msg.toLowerCase();

      // Already registered
      if (lowerMsg.includes("already") || lowerMsg.includes("registered")) {
        showToast("⚠ You are already registered for this event.", "warning");
        setTimeout(() => navigate("/events/my/registrations"), 1000);
        return; // IMPORTANT
      }

      // Deadline passed
      if (lowerMsg.includes("deadline")) {
        showToast("⏳ Registration deadline has passed.", "warning");
        return;
      }

      // Fallback
      showToast(`❌ ${msg}`, "error");
    } finally {
      setRegistering(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (!event)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="text.secondary">
          Event not found.
        </Typography>
      </Box>
    );

  const now = new Date();
  const isUpcoming = new Date(event.startDate) > now;
  const isOngoing =
    new Date(event.startDate) <= now && now <= new Date(event.endDate);
  const isCompleted = new Date(event.endDate) < now;

  const statusColor = isUpcoming
    ? "info"
    : isOngoing
    ? "success"
    : "default";

  const registrationClosed = new Date(event.registrationDeadline) < now;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1000, mx: "auto" }}>
      {event.coverImage?.url && (
        <Box
          sx={{
            width: "100%",
            height: 280,
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            boxShadow: 3,
          }}
        >
          <img
            src={event.coverImage.url}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      )}

      <Stack spacing={1}>
        <Typography variant="h3" fontWeight={800}>
          {event.title}
        </Typography>
        {event.subtitle && (
          <Typography variant="h6" color="text.secondary">
            {event.subtitle}
          </Typography>
        )}
        <Chip
          label={event.category.toUpperCase()}
          color="primary"
          size="small"
          sx={{ mt: 1 }}
        />
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {new Date(event.startDate).toLocaleDateString()} –{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2">{event.location || "Online"}</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <GroupsIcon fontSize="small" color="action" />
          <Typography variant="body2">
            Max Team Size: {event.maxTeamSize}
          </Typography>
        </Stack>
      </Stack>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Description
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {event.description || "No description provided."}
        </Typography>
      </Paper>

      {event.prizes?.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <EmojiEventsIcon fontSize="small" sx={{ mr: 1 }} />
            Prizes
          </Typography>
          <ul>
            {event.prizes.map((p, i) => (
              <li key={i}>
                <Typography variant="body2">{p}</Typography>
              </li>
            ))}
          </ul>
        </Paper>
      )}

      {event.rules?.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <RuleIcon fontSize="small" sx={{ mr: 1 }} />
            Rules
          </Typography>
          <ul>
            {event.rules.map((r, i) => (
              <li key={i}>
                <Typography variant="body2">{r}</Typography>
              </li>
            ))}
          </ul>
        </Paper>
      )}

      {event.faqs?.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <QuestionAnswerIcon fontSize="small" sx={{ mr: 1 }} />
            FAQs
          </Typography>
          {event.faqs.map((f, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Q: {f.q}</Typography>
              <Typography variant="body2" color="text.secondary">
                A: {f.a}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        {isCompleted ? (
          <Chip label="Event Completed" color="default" />
        ) : registrationClosed ? (
          <Chip label="Registration Closed" color="warning" />
        ) : (
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? "Registering..." : "Register Now"}
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="caption" color="text.secondary">
        Organized by <strong>{event.organizer || "Unknown Organizer"}</strong>
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Chip
          label={
            isOngoing ? "Ongoing" : isUpcoming ? "Upcoming" : "Completed"
          }
          color={statusColor}
        />
      </Box>
    </Box>
  );
}
