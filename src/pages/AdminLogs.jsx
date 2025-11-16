import { useEffect, useState } from "react";
import {
  Box,
  Container,
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
  Tooltip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
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
    if (selected.length === logs.length) setSelected([]);
    else setSelected(logs.map((log) => log._id));
  };

  if (!isElevated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error">🚫 Access Denied — Admins Only</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#6c63ff" }} />
        <Typography sx={{ mt: 2 }}>Loading activity logs...</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Container sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            background:
              "linear-gradient(145deg, #f7f9fc, #eef1f6)",
            boxShadow:
              "0 4px 30px rgba(108,99,255,0.1), 0 0 10px rgba(255,64,129,0.1)",
          }}
        >
          {/* ===== Header ===== */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            mb={3}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: "linear-gradient(90deg, #6c63ff, #ff4081)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📜 {isSuper ? "System Audit Logs" : "Admin Logs"}
            </Typography>

            {isSuper && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
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

          <Divider sx={{ mb: 3 }} />

          {/* 🔍 Filters */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
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
                <MenuItem value="CREATE_EVENT">CREATE_EVENT</MenuItem>
                <MenuItem value="UPDATE_EVENT">UPDATE_EVENT</MenuItem>
                <MenuItem value="DELETE_EVENT">DELETE_EVENT</MenuItem>
                <MenuItem value="REGISTER_EVENT">REGISTER_EVENT</MenuItem>
                <MenuItem value="EVALUATE_SUBMISSION">EVALUATE_SUBMISSION</MenuItem>
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

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                background: "linear-gradient(135deg, #6c63ff, #ff4081)",
                fontWeight: 600,
              }}
            >
              🔍 Search
            </Button>
          </Stack>

          {/* 🧾 Logs Table */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 3px 10px rgba(108,99,255,0.15)",
            }}
          >
            <Table>
              <TableHead sx={{ background: "linear-gradient(135deg, #6c63ff, #ff4081)" }}>
                <TableRow>
                  {isSuper && <TableCell sx={{ color: "#fff" }}>Select</TableCell>}
                  <TableCell sx={{ color: "#fff" }}>Action</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Performed By</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Target User</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Details</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Timestamp</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow
                      key={log._id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      }}
                    >
                      {isSuper && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(log._id)}
                            onChange={() => toggleSelect(log._id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={
                            log.action.includes("DELETE")
                              ? "error"
                              : log.action.includes("CREATE")
                              ? "success"
                              : "primary"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {log.performedBy
                          ? `${log.performedBy.name} (${log.performedBy.email})`
                          : "System"}
                      </TableCell>
                      <TableCell>
                        {log.targetUser
                          ? `${log.targetUser.name} (${log.targetUser.email})`
                          : "—"}
                      </TableCell>
                      <TableCell>{log.details || "-"}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isSuper ? 6 : 5} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No logs found for the selected filters.
                      </Typography>
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
        </Paper>
      </Container>
    </motion.div>
  );
}
