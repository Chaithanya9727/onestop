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


export default function AdminLogs() {
  const { get, del } = useApi();
  const { role: userRole } = useAuth();

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
        `/users/audit?page=${page}&limit=${pageSize}&search=${encodeURIComponent(
          search
        )}&action=${actionFilter}&user=${userFilter}`
      );
      setLogs(data.logs || []);
      setPages(data.pages || 1);
      setSelected([]);
      setError("");
    } catch (err) {
      console.error("Failed to load logs", err);
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search users (for filter dropdown)
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

  useEffect(() => {
    if (isElevated) loadLogs();
  }, [page, actionFilter, userFilter, isElevated]);

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  // ✅ Bulk delete (SuperAdmin only)
  const handleBulkDelete = async () => {
    if (!isSuper) {
      alert("🚫 Only SuperAdmin can delete logs");
      return;
    }
    if (selected.length === 0) return alert("No logs selected");
    if (!window.confirm(`Delete ${selected.length} selected logs?`)) return;

    try {
      await del("/users/audit/bulk", { ids: selected });
      setLogs((prev) => prev.filter((log) => !selected.includes(log._id)));
      setSelected([]);
      alert("Selected logs deleted ✅");
    } catch (err) {
      console.error("Bulk delete failed", err);
      alert("Failed to delete logs");
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
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading activity logs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Typography variant="h4">
          📜 {isSuper ? "System Audit Logs" : "Admin Logs"}
        </Typography>

        {isSuper && (
          <Button
            variant="contained"
            color="error"
            disabled={selected.length === 0}
            onClick={handleBulkDelete}
          >
            🗑 Delete Selected ({selected.length})
          </Button>
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
            <MenuItem value="CREATE_NOTICE">CREATE_NOTICE</MenuItem>
            <MenuItem value="UPDATE_NOTICE">UPDATE_NOTICE</MenuItem>
            <MenuItem value="DELETE_NOTICE">DELETE_NOTICE</MenuItem>
            <MenuItem value="CREATE_EVENT">CREATE_EVENT</MenuItem>
            <MenuItem value="UPDATE_EVENT">UPDATE_EVENT</MenuItem>
            <MenuItem value="DELETE_EVENT">DELETE_EVENT</MenuItem>
            <MenuItem value="CREATE_RESOURCE">CREATE_RESOURCE</MenuItem>
            <MenuItem value="UPDATE_RESOURCE">UPDATE_RESOURCE</MenuItem>
            <MenuItem value="DELETE_RESOURCE">DELETE_RESOURCE</MenuItem>
            <MenuItem value="CHANGE_ROLE">CHANGE_ROLE</MenuItem>
            <MenuItem value="DELETE_USER">DELETE_USER</MenuItem>
            <MenuItem value="RESET_PASSWORD">RESET_PASSWORD</MenuItem>
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
                    <Chip label={log.action} size="small" />
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
  