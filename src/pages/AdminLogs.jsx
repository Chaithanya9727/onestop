import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Stack,
  InputLabel,
  FormControl,
  Button,
  Checkbox,
  Autocomplete,
  Alert,
  Chip,
} from "@mui/material";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";

export default function AdminLogs() {
  const { get, del } = useApi();
  const { role: userRole } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [userOptions, setUserOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const pageSize = 10;
  const isElevated = ["admin", "superadmin"].includes(userRole?.toLowerCase());
  const isSuper = userRole?.toLowerCase() === "superadmin";

  // ✅ Load logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await get(
        `/audit?page=${page}&limit=${pageSize}&search=${encodeURIComponent(
          search
        )}&action=${actionFilter}&user=${userFilter}`
      );
      setLogs(data.logs || []);
      setPages(data.pages || 1);
      setSelected([]);
      setError("");
    } catch (err) {
      console.error("Failed to load logs", err);
      setError("Failed to fetch logs ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isElevated) loadLogs();
  }, [page, actionFilter, userFilter, isElevated]);

  // ✅ Search users for filter
  const searchUsers = async (query) => {
    try {
      if (!query) {
        setUserOptions([]);
        return;
      }
      const data = await get(`/users?search=${encodeURIComponent(query)}`);
      setUserOptions(data || []);
    } catch (err) {
      console.error("User search failed", err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  // ✅ Bulk delete selected logs
  const handleBulkDelete = async () => {
    if (!isSuper) return alert("🚫 Only SuperAdmin can delete logs");
    if (selected.length === 0) return alert("No logs selected");
    if (!window.confirm(`Delete ${selected.length} selected logs?`)) return;

    try {
      const res = await del("/audit/bulk", { ids: selected });
      showToast(res.message || "Selected logs deleted ✅", "success");
      setLogs((prev) => prev.filter((log) => !selected.includes(log._id)));
      setSelected([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
      showToast("Failed to delete selected logs ❌", "error");
    }
  };

  // ✅ Bulk delete all filtered logs
  const handleDeleteFiltered = async () => {
    if (!isSuper)
      return showToast("🚫 Only SuperAdmin can delete all filtered logs", "warning");

    if (
      !window.confirm(
        "⚠️ Are you sure you want to delete ALL logs matching your current filters? This cannot be undone!"
      )
    )
      return;

    try {
      const res = await del(
        `/audit/bulk/all?search=${encodeURIComponent(search)}&action=${actionFilter}&user=${userFilter}`
      );
      showToast(res.message || "All filtered logs deleted ✅", "success");
      await loadLogs();
    } catch (err) {
      console.error("Delete all filtered logs failed", err);
      showToast("Failed to delete filtered logs ❌", "error");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === logs.length) {
      setSelected([]);
    } else {
      setSelected(logs.map((log) => log._id));
    }
  };

  // 🚫 Restrict unauthorized access
  if (!isElevated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error">🚫 Access Denied — Admins Only</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#6c63ff" }} />
        <Typography sx={{ mt: 2 }}>Loading activity logs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight={700}>
          📜 {isSuper ? "System Audit Logs" : "Admin Logs"}
        </Typography>

        {isSuper && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              color="error"
              disabled={selected.length === 0}
              onClick={handleBulkDelete}
            >
              🗑 Delete Selected ({selected.length})
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={handleDeleteFiltered}
            >
              🧹 Delete All Filtered Logs
            </Button>
          </Stack>
        )}
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {/* 🔍 Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search logs..."
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Action Type</InputLabel>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="MENTOR_APPLY">MENTOR_APPLY</MenuItem>
            <MenuItem value="MENTOR_APPROVED">MENTOR_APPROVED</MenuItem>
            <MenuItem value="MENTOR_REJECTED">MENTOR_REJECTED</MenuItem>
            <MenuItem value="MENTOR_FEEDBACK">MENTOR_FEEDBACK</MenuItem>
            <MenuItem value="CREATE_NOTICE">CREATE_NOTICE</MenuItem>
            <MenuItem value="DELETE_USER">DELETE_USER</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete
          size="small"
          options={userOptions}
          getOptionLabel={(u) => `${u.name} (${u.email})`}
          onInputChange={(e, value) => searchUsers(value)}
          onChange={(e, value) => setUserFilter(value ? value._id : "all")}
          renderInput={(params) => (
            <TextField {...params} label="Filter by User" variant="outlined" />
          )}
          sx={{ minWidth: 250 }}
        />

        <Button variant="contained" onClick={handleSearch}>
          🔍 Search
        </Button>
      </Stack>

      {/* 🧾 Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {isSuper && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === logs.length && logs.length > 0}
                    indeterminate={
                      selected.length > 0 && selected.length < logs.length
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell><b>Action</b></TableCell>
              <TableCell><b>Performed By</b></TableCell>
              <TableCell><b>Target User</b></TableCell>
              <TableCell><b>Details</b></TableCell>
              <TableCell><b>Timestamp</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log._id}>
                  {isSuper && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(log._id)}
                        onChange={() => toggleSelect(log._id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip label={log.action} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    {log.performedBy
                      ? `${log.performedBy.name} (${log.performedBy.email})`
                      : "System"}
                  </TableCell>
                  <TableCell>
                    {log.targetUser
                      ? `${log.targetUser.name} (${log.targetUser.email})`
                      : log.targetUserSnapshot
                      ? `${log.targetUserSnapshot.name} (${log.targetUserSnapshot.email})`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{log.details || "-"}</TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isSuper ? 6 : 5} align="center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔄 Pagination */}
      {pages > 1 && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ◀ Prev
          </Button>
          <Typography>
            Page {page} of {pages}
          </Typography>
          <Button
            variant="outlined"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ▶
          </Button>
        </Stack>
      )}
    </Box>
  );
}
