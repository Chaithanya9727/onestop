import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableSortLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import useApi from "../../hooks/useApi";
import { useToast } from "../../components/ToastProvider.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Event Registrations (Admins/Mentors/SuperAdmins)
 * - Loads from: GET /api/events/:id/registrations?page=&limit=
 * - Evaluate scoring: POST /api/events/:id/evaluate { userId, score, feedback }
 * - Features: server pagination, debounced search (client filter on page), column sort (client on page),
 *             reload, CSV export (current page), inline score edit, toasts, motion.
 */
export default function EventRegistrations() {
  const { get, post } = useApi();
  const { role } = useAuth(); // role-based UI (edit score button)
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id: eventId } = useParams();

  const canScore = ["admin", "mentor", "superadmin"].includes(
    (role || "").toLowerCase()
  );

  // Server pagination state
  const [serverPage, setServerPage] = useState(0); // 0-indexed here, API is 1-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Data + UI state
  const [rows, setRows] = useState([]); // rows from server for the current page
  const [loading, setLoading] = useState(false);

  // Search (debounced) — client-side filter within current page
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value

  // Sorting (client-side within current page)
  const [orderBy, setOrderBy] = useState("registeredAt");
  const [order, setOrder] = useState("desc"); // 'asc' | 'desc'

  // Inline scoring dialog
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [scoreValue, setScoreValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");

  // ===== Load (server-side pagination) =====
  const load = async (pageIndex = serverPage, pageSize = rowsPerPage) => {
    // A. Guard: ensure eventId exists
    if (!eventId) {
      showToast("Invalid event ID.", "error");
      return;
    }

    setLoading(true);
    try {
      const apiPage = pageIndex + 1; // API expects 1-indexed
      const data = await get(`/events/${eventId}/registrations`, {
        params: { page: apiPage, limit: pageSize },
      });
      const list = data?.data || [];
      setRows(list);
      setTotalCount(data?.total ?? list.length);
      showToast("✅ Loaded registrations", "success");
    } catch (err) {
      console.error("EventRegistrations load error:", err);
      showToast("❌ Failed to load registrations", "error");
    } finally {
      setLoading(false);
    }
  };

  // On event change: reset to first page (load happens via pagination effect below)
  useEffect(() => {
    setServerPage(0);
  }, [eventId]);

  // ===== Debounce search input =====
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // B. Pagination/load effect (prevents desync and double-calls)
  useEffect(() => {
    load(serverPage, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPage, rowsPerPage, eventId]);

  // ===== Sorting helpers (client-side on current page) =====
  const comparator = (a, b, key) => {
    const av = a?.[key];
    const bv = b?.[key];
    // date fields
    if (key === "registeredAt" || key === "lastUpdated") {
      const ad = av ? new Date(av).getTime() : 0;
      const bd = bv ? new Date(bv).getTime() : 0;
      return ad - bd;
    }
    // numeric score
    if (key === "score") {
      const an = typeof av === "number" ? av : -Infinity;
      const bn = typeof bv === "number" ? bv : -Infinity;
      return an - bn;
    }
    // strings
    const as = (av ?? "").toString().toLowerCase();
    const bs = (bv ?? "").toString().toLowerCase();
    if (as < bs) return -1;
    if (as > bs) return 1;
    return 0;
  };

  const sortedFilteredRows = useMemo(() => {
    // Filter within current page rows
    const term = (search || "").toLowerCase();
    const filtered = rows.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(term) ||
        (r.email || "").toLowerCase().includes(term) ||
        (r.teamName || "").toLowerCase().includes(term)
    );

    // Sort within current page rows
    const arr = [...filtered].sort((a, b) => comparator(a, b, orderBy));
    if (order === "desc") arr.reverse();
    return arr;
  }, [rows, search, orderBy, order]);

  // ===== CSV Export (current page, post-filter/sort) =====
  const toCsvValue = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const handleExportCSV = () => {
    // F. include Feedback column in CSV
    const headers = [
      "Name",
      "Email",
      "Team Name",
      "Registered At",
      "Submission Status",
      "Score",
      "Feedback",
      "Last Updated",
    ];
    const lines = [headers.map(toCsvValue).join(",")];

    sortedFilteredRows.forEach((r) => {
      const line = [
        toCsvValue(r.name || "—"),
        toCsvValue(r.email || "—"),
        toCsvValue(r.teamName || "—"),
        toCsvValue(r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "—"),
        toCsvValue(r.submissionStatus || "not_submitted"),
        toCsvValue(r.score !== null && r.score !== undefined ? r.score : ""),
        toCsvValue(r.feedback || "—"),
        toCsvValue(r.lastUpdated ? new Date(r.lastUpdated).toLocaleString() : "—"),
      ].join(",");
      lines.push(line);
    });

    const csv = lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `event_${eventId}_registrations_page${serverPage + 1}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("📄 Exported current page to CSV", "success");
  };

  // ===== Inline Scoring =====
  const openScoreDialog = (row) => {
    setSelectedRow(row);
    setScoreValue(row?.score ?? "");
    setFeedbackValue(row?.feedback ?? "");
    setScoreDialogOpen(true);
  };

  const closeScoreDialog = () => {
    setScoreDialogOpen(false);
    setSelectedRow(null);
  };

  const submitScore = async () => {
    if (!selectedRow?.userId) {
      showToast("Invalid user selected.", "error");
      return;
    }

    // C. robust numeric handling
    const parsedScore = scoreValue === "" ? null : Number(scoreValue);
    if (parsedScore !== null && (Number.isNaN(parsedScore) || parsedScore < 0)) {
      showToast("Score must be a valid number (≥ 0).", "error");
      return;
    }

    const body = {
      userId: selectedRow.userId,
      score: parsedScore, // null or number
      feedback: feedbackValue || "",
      round: 1,
    };

    try {
      await post(`/events/${eventId}/evaluate`, body);
      showToast("✅ Score updated", "success");

      // Update local rows immediately (optimistic)
      setRows((prev) =>
        prev.map((r) =>
          String(r.userId) === String(selectedRow.userId)
            ? {
                ...r,
                score:
                  body.score === null || Number.isNaN(body.score)
                    ? null
                    : Number(body.score),
                submissionStatus:
                  body.score === null || Number.isNaN(body.score)
                    ? r.submissionStatus || "submitted"
                    : "reviewed",
                lastUpdated: new Date().toISOString(),
                feedback: body.feedback,
              }
            : r
        )
      );

      closeScoreDialog();

      // Optional: re-sync with server if multiple judges are editing
      // await load(serverPage, rowsPerPage);
    } catch (err) {
      console.error("EvaluateSubmission error:", err);
      showToast("❌ Failed to update score", "error");
    }
  };

  // ===== Summary (per page + server total) =====
  const pageTotal = rows.length;
  const pageSubmitted = rows.filter((r) => r.submissionStatus !== "not_submitted").length;
  const pageReviewed = rows.filter((r) => r.submissionStatus === "reviewed").length;

  // ===== Sort handlers =====
  const handleRequestSort = (property) => {
    if (orderBy === property) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(property);
      setOrder("asc");
    }
  };

  // ===== Pagination handlers (no manual load here; effect handles it) =====
  const handleChangePage = (_e, newPage) => {
    setServerPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    const size = +e.target.value;
    setRowsPerPage(size);
    setServerPage(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title="Back">
                <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="h4" fontWeight={800}>
                👥 Event Registrations
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search name, email, or team (current page)…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ width: { xs: "100%", sm: 320 } }}
              />
              <Tooltip title="Reload">
                <span>
                  <IconButton
                    color="primary"
                    onClick={() => load(serverPage, rowsPerPage)}
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Export current page CSV">
                <span>
                  <IconButton
                    color="secondary"
                    onClick={handleExportCSV}
                    disabled={sortedFilteredRows.length === 0}
                  >
                    <DownloadIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Summary */}
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            <Chip label={`Server Total: ${totalCount}`} variant="outlined" />
            <Chip label={`On Page: ${pageTotal}`} variant="outlined" />
            <Chip label={`Submitted (page): ${pageSubmitted}`} color="success" variant="outlined" />
            <Chip label={`Reviewed (page): ${pageReviewed}`} color="info" variant="outlined" />
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Table */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>

                    <TableCell sortDirection={orderBy === "name" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={orderBy === "name" ? order : "asc"}
                        onClick={() => handleRequestSort("name")}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>

                    <TableCell sortDirection={orderBy === "email" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "email"}
                        direction={orderBy === "email" ? order : "asc"}
                        onClick={() => handleRequestSort("email")}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>

                    <TableCell sortDirection={orderBy === "teamName" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "teamName"}
                        direction={orderBy === "teamName" ? order : "asc"}
                        onClick={() => handleRequestSort("teamName")}
                      >
                        Team Name
                      </TableSortLabel>
                    </TableCell>

                    <TableCell sortDirection={orderBy === "registeredAt" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "registeredAt"}
                        direction={orderBy === "registeredAt" ? order : "asc"}
                        onClick={() => handleRequestSort("registeredAt")}
                      >
                        Registered
                      </TableSortLabel>
                    </TableCell>

                    <TableCell>Status</TableCell>

                    <TableCell align="right" sortDirection={orderBy === "score" ? order : false}>
                      <TableSortLabel
                        active={orderBy === "score"}
                        direction={orderBy === "score" ? order : "asc"}
                        onClick={() => handleRequestSort("score")}
                      >
                        Score
                      </TableSortLabel>
                    </TableCell>

                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedFilteredRows.length > 0 ? (
                    sortedFilteredRows.map((r, i) => (
                      <TableRow key={r._id || `${r.userId}-${i}`} hover>
                        <TableCell>{serverPage * rowsPerPage + i + 1}</TableCell>
                        <TableCell>{r.name || "—"}</TableCell>
                        <TableCell>{r.email || "—"}</TableCell>
                        <TableCell>{r.teamName || "—"}</TableCell>
                        <TableCell>
                          {/* D. Better datetime formatting */}
                          {r.registeredAt
                            ? new Date(r.registeredAt).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              r.submissionStatus === "reviewed"
                                ? "Reviewed"
                                : r.submissionStatus === "submitted"
                                ? "Submitted"
                                : "Not Submitted"
                            }
                            color={
                              r.submissionStatus === "reviewed"
                                ? "info"
                                : r.submissionStatus === "submitted"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          {r.score !== null && r.score !== undefined ? r.score : "—"}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View Leaderboard">
                              <IconButton
                                color="success"
                                onClick={() =>
                                  navigate(`/events/${eventId}/leaderboard`)
                                }
                              >
                                <EmojiEventsIcon />
                              </IconButton>
                            </Tooltip>

                            {canScore && (
                              <Tooltip title="Edit Score">
                                <IconButton color="primary" onClick={() => openScoreDialog(r)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No registrations found for this page.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Server Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={serverPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Container>

      {/* Inline Score Dialog */}
      <Dialog
        open={scoreDialogOpen}
        onClose={closeScoreDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Evaluate Submission</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Score"
              type="number"
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              placeholder="e.g., 85"
              inputProps={{ step: "1", min: 0 }}
              helperText="Leave blank to clear score"
            />
            <TextField
              label="Feedback (optional)"
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
              multiline
              minRows={3}
              helperText={!feedbackValue ? "No feedback yet" : ""}
            />
            {selectedRow && (
              <Typography variant="body2" color="text.secondary">
                Participant: <strong>{selectedRow.name}</strong> ({selectedRow.email})
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScoreDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitScore}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
