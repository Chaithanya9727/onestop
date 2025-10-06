import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  TextField,
  Button,
  Stack,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import './styles.css'

export default function Events() {
  const { get, post, put, del } = useApi();
  const { role } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // Admin form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Toggle view: list or calendar
  const [viewMode, setViewMode] = useState("list");

  const pageSize = 6;

  const load = async () => {
    try {
      setLoading(true);
      const data = await get(
        `/events?search=${search}&page=${page}&limit=${pageSize}`
      );
      setEvents(data.events || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Load events failed:", err);
      setErr("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    load();
  };

  // ➕ Create event
  const create = async (e) => {
    e.preventDefault();
    try {
      await post("/events", { title, description, date, location });
      setSuccess("Event created ✅");
      resetForm();
      setPage(1);
      load();
    } catch {
      setErr("Failed to create event");
    }
  };

  // ✏️ Update event
  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await put(`/events/${editId}`, { title, description, date, location });
      setSuccess("Event updated ✅");
      resetForm();
      load();
    } catch {
      setErr("Failed to update event");
    }
  };

  // ❌ Delete event
  const remove = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await del(`/events/${id}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      setSuccess("Event deleted ❌");
    } catch {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
  };

  if (loading)
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        📅 Events
      </Typography>

      {err && <Alert severity="error">{err}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* Admin Form */}
      {role === "admin" && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">
            {editId ? "✏️ Edit Event" : "➕ Add Event"}
          </Typography>
          <Box
            component="form"
            onSubmit={editId ? saveEdit : create}
            sx={{ mt: 2, display: "grid", gap: 2 }}
          >
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextField
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained">
                {editId ? "Save Changes" : "Add Event"}
              </Button>
              {editId && (
                <Button variant="outlined" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* 🔍 Search Bar + View Toggle */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
            <TextField
              label="Search events"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="contained" onClick={handleSearch}>
              🔍 Search
            </Button>
          </Stack>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            size="small"
          >
            <ToggleButton value="list">📋 List</ToggleButton>
            <ToggleButton value="calendar">📆 Calendar</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* Events View */}
      {viewMode === "list" ? (
        <>
          {events.length === 0 ? (
            <Typography>No events found</Typography>
          ) : (
            <Grid container spacing={2}>
              {events.map((ev) => (
                <Grid item xs={12} md={6} key={ev._id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{ev.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(ev.date).toLocaleDateString()} @ {ev.location}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{ev.description}</Typography>

                    {role === "admin" && (
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setEditId(ev._id);
                            setTitle(ev.title);
                            setDescription(ev.description);
                            setDate(ev.date.slice(0, 10));
                            setLocation(ev.location);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={() => remove(ev._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ⬅ Prev
            </Button>
            <Typography>
              Page {page} of {pages || 1}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === pages || pages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ➡
            </Button>
          </Stack>
        </>
      ) : (
        <Paper sx={{ p: 2 }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map((ev) => ({
              id: ev._id,
              title: ev.title,
              start: ev.date,
              extendedProps: { location: ev.location, description: ev.description },
            }))}
            eventContent={(arg) => (
              <div>
                <b>{arg.event.title}</b>
                <br />
                <small>{arg.event.extendedProps.location}</small>
              </div>
            )}
          />
        </Paper>
      )}
    </Box>
  );
}
