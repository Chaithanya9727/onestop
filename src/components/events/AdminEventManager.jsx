import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  MenuItem,
  TablePagination,
  TableSortLabel,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import { motion } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ToastProvider.jsx";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "hackathon", label: "Hackathon" },
  { value: "quiz", label: "Quiz" },
  { value: "case", label: "Case Study" },
  { value: "job-challenge", label: "Job Challenge" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

// Helper for event status
const getStatusMeta = (event) => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  if (end < now) return { key: "completed", label: "Completed", color: "default" };
  if (start > now) return { key: "upcoming", label: "Upcoming", color: "info" };
  return { key: "ongoing", label: "Ongoing", color: "success" };
};

export default function AdminEventManager() {
  const { role } = useAuth();
  const { get, del, put } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // pagination + filters
  const [serverPage, setServerPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tabStatus, setTabStatus] = useState("all");
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [orderBy, setOrderBy] = useState("startDate");
  const [order, setOrder] = useState("asc");

  const [editEvent, setEditEvent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch events from API
  const load = async (pageIndex = serverPage, limit = rowsPerPage, cat = category, q = search) => {
    setLoading(true);
    try {
      const apiPage = pageIndex + 1;
      const res = await get("/events", {
        params: { page: apiPage, limit, category: cat || undefined, search: q || undefined },
      });
      setEvents(res?.events || []);
      setTotalCount(res?.total ?? 0);
      showToast("✅ Events loaded successfully", "success");
    } catch (err) {
      console.error("FetchEvents error:", err);
      showToast("❌ Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial & refetch when filters change
  useEffect(() => {
    load(0, rowsPerPage, category, search);
    setServerPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Client status filter
  const filteredByStatus = useMemo(() => {
    if (tabStatus === "all") return events;
    return events.filter((e) => getStatusMeta(e).key === tabStatus);
  }, [events, tabStatus]);

  // Sorting (client page)
  const comparator = (a, b, key) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (key === "startDate" || key === "endDate") {
      return new Date(av).getTime() - new Date(bv).getTime();
    }
    return (av || "").localeCompare(bv || "");
  };

  const sortedRows = useMemo(() => {
    const arr = [...filteredByStatus].sort((a, b) => comparator(a, b, orderBy));
    if (order === "desc") arr.reverse();
    return arr;
  }, [filteredByStatus, orderBy, order]);

  const handleChangePage = (_e, newPage) => {
    setServerPage(newPage);
    load(newPage, rowsPerPage, category, search);
  };

  const handleChangeRowsPerPage = (e) => {
    const size = +e.target.value;
    setRowsPerPage(size);
    setServerPage(0);
    load(0, size, category, search);
  };

  const handleRequestSort = (property) => {
    if (orderBy === property) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setOrderBy(property);
      setOrder("asc");
    }
  };

  // Edit / Delete actions
  const handleDelete = async () => {
    try {
      await del(`/events/${confirmDelete._id}`);
      showToast(`🗑️ Deleted event: ${confirmDelete.title}`, "success");
      setConfirmDelete(null);
      load(serverPage, rowsPerPage, category, search);
    } catch (err) {
      console.error("DeleteEvent error:", err);
      showToast("❌ Failed to delete event", "error");
    }
  };

  const handleEditSave = async () => {
    try {
      await put(`/events/${editEvent._id}`, editEvent);
      showToast("✅ Event updated successfully", "success");
      setEditEvent(null);
      load(serverPage, rowsPerPage, category, search);
    } catch (err) {
      console.error("EditEvent error:", err);
      showToast("❌ Failed to update event", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            🏆 Manage Events
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search events…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />,
              }}
              sx={{ minWidth: 220 }}
            />

            <TextField
              select
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>

            <Tooltip title="Reload">
              <IconButton onClick={() => load(serverPage, rowsPerPage, category, search)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/admin/create-event")}
            >
              Create Event
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ mb: 2, borderRadius: 3 }}>
          <Tabs
            value={tabStatus}
            onChange={(_e, v) => setTabStatus(v)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
          >
            <Tab value="all" label="All" />
            <Tab value="upcoming" label="Upcoming" />
            <Tab value="ongoing" label="Ongoing" />
            <Tab value="completed" label="Completed" />
          </Tabs>
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sortDirection={orderBy === "title" ? order : false}>
                        <TableSortLabel
                          active={orderBy === "title"}
                          direction={orderBy === "title" ? order : "asc"}
                          onClick={() => handleRequestSort("title")}
                        >
                          Title
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Organizer</TableCell>
                      <TableCell>Start</TableCell>
                      <TableCell>End</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            No events found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedRows.map((event) => {
                        const s = getStatusMeta(event);
                        return (
                          <TableRow key={event._id} hover>
                            <TableCell>{event.title}</TableCell>
                            <TableCell>{event.category}</TableCell>
                            <TableCell>{event.organizer || "—"}</TableCell>
                            <TableCell>
                              {new Date(event.startDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(event.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip label={s.label} color={s.color} variant="outlined" size="small" />
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="View Registrations">
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      navigate(`/events/${event._id}/registrations`)
                                    }
                                  >
                                    <GroupIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Leaderboard">
                                  <IconButton
                                    color="success"
                                    onClick={() =>
                                      navigate(`/events/${event._id}/leaderboard`)
                                    }
                                  >
                                    <EmojiEventsIcon />
                                  </IconButton>
                                </Tooltip>
                                {["admin", "mentor", "superadmin"].includes(
                                  (role || "").toLowerCase()
                                ) && (
                                  <>
                                    <Tooltip title="Edit">
                                      <IconButton color="info" onClick={() => setEditEvent(event)}>
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton
                                        color="error"
                                        onClick={() => setConfirmDelete(event)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={serverPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>

        {/* ✏️ Edit Dialog */}
        <Dialog open={!!editEvent} onClose={() => setEditEvent(null)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={editEvent?.title || ""}
                onChange={(e) =>
                  setEditEvent((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <TextField
                label="Organizer"
                value={editEvent?.organizer || ""}
                onChange={(e) =>
                  setEditEvent((prev) => ({ ...prev, organizer: e.target.value }))
                }
              />
              <TextField
                select
                label="Category"
                value={editEvent?.category || ""}
                onChange={(e) =>
                  setEditEvent((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditEvent(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* 🗑️ Delete Confirmation */}
        <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} fullWidth maxWidth="xs">
          <DialogTitle>Delete Event</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <strong>{confirmDelete?.title}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}
