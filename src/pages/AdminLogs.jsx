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
} from "@mui/material";
import useApi from "../hooks/useApi";
import './styles.css'

export default function AdminLogs() {
  const { get, del } = useApi();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [userOptions, setUserOptions] = useState([]); // 🔥 dynamic options
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState([]);

  const pageSize = 10;

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await get(
        `/users/audit?page=${page}&limit=${pageSize}&search=${search}&action=${actionFilter}&user=${userFilter}`
      );
      setLogs(data.logs || data);
      setPages(data.pages || 1);
      setSelected([]);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fetch users dynamically (on typing)
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
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, userFilter]);

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  // ✅ Bulk delete
  const handleBulkDelete = async () => {
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
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">📜 Activity Logs</Typography>
        <Button
          variant="contained"
          color="error"
          disabled={selected.length === 0}
          onClick={handleBulkDelete}
        >
          🗑 Delete Selected ({selected.length})
        </Button>
      </Stack>

      {/* Filters */}
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Action</InputLabel>
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
            <MenuItem value="DELETE_USER">DELETE_USER</MenuItem>
            <MenuItem value="CHANGE_ROLE">CHANGE_ROLE</MenuItem>
            <MenuItem value="RESET_PASSWORD">RESET_PASSWORD</MenuItem>
            <MenuItem value="REPLY_MESSAGE">REPLY_MESSAGE</MenuItem>
          </Select>
        </FormControl>

        {/* 🔥 Autocomplete User Filter */}
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

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === logs.length && logs.length > 0}
                  indeterminate={
                    selected.length > 0 && selected.length < logs.length
                  }
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Target User</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(log._id)}
                      onChange={() => toggleSelect(log._id)}
                    />
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
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
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
