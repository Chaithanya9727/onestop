import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { LockReset, Delete, Edit } from "@mui/icons-material";

export default function Users() {
  const { role } = useAuth();
  const { get, put, del, post } = useApi();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", mobile: "" });

  const [openReset, setOpenReset] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");

  const isElevated = ["admin", "superadmin"].includes(role?.toLowerCase());
  const isSuper = role?.toLowerCase() === "superadmin";

  // 🔄 Load users
  const load = async () => {
    try {
      setLoading(true);
      const data = await get(`/users?search=${search}`);
      setUsers(data);
      setErr("");
    } catch {
      setErr("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isElevated) load();
  }, [isElevated]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") load();
  };

  const searchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  // 🧾 Create Admin
  const createAdmin = async () => {
    const { name, email, password, mobile } = newAdmin;
    if (!name || !email || !password)
      return setErr("All fields required to create admin");

    try {
      await post(`/users/create-admin`, { name, email, password, mobile });
      setSuccess("Admin created successfully ✅");
      setNewAdmin({ name: "", email: "", password: "", mobile: "" });
      load();
    } catch {
      setErr("Failed to create admin");
    }
  };

  // 🔐 Reset Password
  const handleResetPassword = async () => {
    try {
      await put(`/users/${selectedUser._id}/reset-password`, { newPassword });
      setSuccess("Password reset successfully ✅");
      setOpenReset(false);
      setNewPassword("");
      load();
    } catch {
      setErr("Password reset failed");
    }
  };

  // 🛡️ Change Role
  const handleChangeRole = async () => {
    try {
      await put(`/users/${selectedUser._id}/role`, { role: newRole });
      setSuccess("Role updated ✅");
      setOpenRole(false);
      setNewRole("");
      load();
    } catch {
      setErr("Role change failed");
    }
  };

  // 🗑️ Delete User
  const handleDeleteUser = async () => {
    try {
      await del(`/users/${selectedUser._id}`);
      setSuccess("User deleted successfully ❌");
      setOpenDelete(false);
      load();
    } catch {
      setErr("Failed to delete user");
    }
  };

  if (!isElevated) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          🚫 Access Denied — Admins Only
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        👥 Users Management
      </Typography>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* 🔍 Search */}
      <form onSubmit={searchSubmit}>
        <TextField
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or email"
          size="small"
          sx={{ mb: 3, width: 300 }}
        />
        <Button variant="contained" type="submit" sx={{ ml: 2 }}>Search</Button>
      </form>

      {/* ➕ Create Admin (Only SuperAdmin) */}
      {isSuper && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>➕ Create New Admin</Typography>
          <Stack spacing={2} direction="row" flexWrap="wrap">
            <TextField label="Name" size="small" value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
            <TextField label="Email" size="small" value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
            <TextField label="Password" type="password" size="small" value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
            <TextField label="Mobile" size="small" value={newAdmin.mobile}
              onChange={(e) => setNewAdmin({ ...newAdmin, mobile: e.target.value })} />
            <Button variant="contained" onClick={createAdmin}>Create Admin</Button>
          </Stack>
        </Paper>
      )}

      {/* 📋 Users Table */}
      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading users...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Typography sx={{ p: 3 }}>No users found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Role</b></TableCell>
                <TableCell><b>Mobile</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      color={
                        u.role === "superadmin"
                          ? "success"
                          : u.role === "admin"
                          ? "warning"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{u.mobile || "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LockReset />}
                        onClick={() => {
                          setSelectedUser(u);
                          setOpenReset(true);
                        }}
                      >
                        Reset
                      </Button>

                      {isSuper && (
                        <>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role);
                              setOpenRole(true);
                            }}
                          >
                            Role
                          </Button>

                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => {
                              setSelectedUser(u);
                              setOpenDelete(true);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* 🔐 Reset Password Dialog */}
      <Dialog open={openReset} onClose={() => setOpenReset(false)}>
        <DialogTitle>🔐 Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Reset password for: <b>{selectedUser?.email}</b>
          </Typography>
          <TextField
            label="New Password"
            fullWidth
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReset(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained">Reset</Button>
        </DialogActions>
      </Dialog>

      {/* 🛡️ Change Role Dialog */}
      <Dialog open={openRole} onClose={() => setOpenRole(false)}>
        <DialogTitle>🛡️ Change Role</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Change role for: <b>{selectedUser?.email}</b>
          </Typography>
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            fullWidth
          >
            <MenuItem value="candidate">Candidate</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="superadmin">SuperAdmin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRole(false)}>Cancel</Button>
          <Button onClick={handleChangeRole} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* 🗑️ Delete User Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>🗑️ Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete user:{" "}
            <b>{selectedUser?.email}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
