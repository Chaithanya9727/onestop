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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";

export default function Users() {
  const { role } = useAuth();
  const { get, put, del, post } = useApi();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", mobile: "" });

  const isElevated = ["admin", "superadmin"].includes(role?.toLowerCase());
  const isSuper = role?.toLowerCase() === "superadmin";

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

  const resetPassword = async (id) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    try {
      await put(`/users/${id}/reset-password`, { newPassword });
      setSuccess("Password reset successfully ✅");
      load();
    } catch {
      setErr("Password reset failed");
    }
  };

  const changeRole = async (id) => {
    const newRole = prompt("Enter new role (candidate/admin):");
    if (!newRole) return;
    try {
      await put(`/users/${id}/role`, { role: newRole });
      setSuccess("Role updated ✅");
      load();
    } catch {
      setErr("Role change failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await del(`/users/${id}`);
      setSuccess("User deleted ❌");
      load();
    } catch {
      setErr("Delete failed");
    }
  };

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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>👥 Users Management</Typography>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role}
                      color={u.role === "superadmin" ? "secondary" : u.role === "admin" ? "primary" : "default"} />
                  </TableCell>
                  <TableCell>{u.mobile || "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => resetPassword(u._id)}>
                        Reset Password
                      </Button>
                      {isSuper && (
                        <>
                          <Button variant="outlined" color="secondary" size="small"
                            onClick={() => changeRole(u._id)}>Change Role</Button>
                          <Button variant="outlined" color="error" size="small"
                            onClick={() => deleteUser(u._id)}>Delete</Button>
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
    </Box>
  );
}
