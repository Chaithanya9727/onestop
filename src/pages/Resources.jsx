import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Stack,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
import { useLocation, useNavigate } from "react-router-dom";
import ResourceCard from "../components/ResourceCard";

export default function Resources() {
  const { user, role } = useAuth();
  const { get, post, del, put } = useApi();
  const location = useLocation();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("note");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null); // ✅ new
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [editId, setEditId] = useState(null);

  // 🔍 Search & Filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  // 📌 Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const filter = queryParams.get("filter");

  const load = async (reset = false) => {
    try {
      const data = await get(
        `/resources?search=${encodeURIComponent(search)}&type=${filterType}&page=${page}&limit=6`
      );

      let resources = data.resources;

      if (filter === "my" && user) {
        resources = resources.filter((r) => r.user?._id === user._id);
      }

      setList((prev) => (reset ? resources : [...prev, ...resources]));
      setHasMore(page < data.pages);
    } catch {
      setErr("Failed to load resources");
    }
  };

  useEffect(() => {
    setPage(1);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user, search, filterType]);

  useEffect(() => {
    if (page > 1) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      if (url) formData.append("url", url);
      if (file) formData.append("file", file);

      await post("/resources", formData, true); // ✅ multipart

      setTitle("");
      setDescription("");
      setType("note");
      setUrl("");
      setFile(null);
      setSuccess("Resource added ✅");
      setPage(1);
      load(true);
    } catch {
      setErr("Create failed (students/admins only)");
    }
  };

  const remove = async (id) => {
    try {
      await del(`/resources/${id}`);
      setList((prev) => prev.filter((x) => x._id !== id));
    } catch {
      alert("Delete failed (admin only)");
    }
  };

  const startEdit = (r) => {
    setEditId(r._id);
    setTitle(r.title);
    setDescription(r.description || "");
    setType(r.type || "note");
    setUrl(r.url || "");
    setFile(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      if (url) formData.append("url", url);
      if (file) formData.append("file", file);

      const updated = await put(`/resources/${editId}`, formData, true);
      setList((prev) => prev.map((x) => (x._id === editId ? updated : x)));
      setSuccess("Resource updated ✅");
      cancelEdit();
    } catch {
      setErr("Update failed");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setType("note");
    setUrl("");
    setFile(null);
  };

  const handleToggle = () => {
    if (filter === "my") {
      navigate("/resources");
    } else {
      navigate("/resources?filter=my");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Typography variant="h4" gutterBottom>
          {filter === "my" ? "My Resources" : "Resources"}
        </Typography>

        {user && (role === "student" || role === "admin") && (
          <Button variant="outlined" onClick={handleToggle}>
            {filter === "my" ? "Show All" : "Show My Resources"}
          </Button>
        )}
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* 🔍 Search + Filter */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search resources"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Filter by type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="note">Note</MenuItem>
          <MenuItem value="tutorial">Tutorial</MenuItem>
          <MenuItem value="link">Link</MenuItem>
        </TextField>
      </Stack>

      {/* ➕ Add form */}
      {user && (role === "student" || role === "admin") && filter !== "my" && !editId && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Add Resource</Typography>
          <Box component="form" onSubmit={create} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="tutorial">Tutorial</MenuItem>
              <MenuItem value="link">Link</MenuItem>
            </TextField>

            {/* URL or File */}
            <TextField
              label="URL (optional if uploading file)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button variant="outlined" component="label">
              {file ? `File: ${file.name}` : "Upload File"}
              <input
                type="file"
                hidden
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>

            <Button type="submit" variant="contained">
              Add
            </Button>
          </Box>
        </Paper>
      )}

      {/* ✏️ Edit form */}
      {editId && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Edit Resource</Typography>
          <Box component="form" onSubmit={saveEdit} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="tutorial">Tutorial</MenuItem>
              <MenuItem value="link">Link</MenuItem>
            </TextField>
            <TextField
              label="URL (optional if uploading file)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button variant="outlined" component="label">
              {file ? `File: ${file.name}` : "Upload File"}
              <input
                type="file"
                hidden
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Button variant="outlined" onClick={cancelEdit}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* 📂 Resource list */}
      <Grid container spacing={2}>
        {list.map((r) => (
          <Grid item xs={12} md={6} lg={4} key={r._id}>
            <ResourceCard
              resource={r}
              user={user}
              role={role}
              onEdit={startEdit}
              onDelete={remove}
            />
          </Grid>
        ))}
      </Grid>

      {/* Load More */}
      {hasMore && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button variant="outlined" onClick={() => setPage((prev) => prev + 1)}>
            Load More
          </Button>
        </Box>
      )}

      {list.length === 0 && (
        <Typography>
          {filter === "my"
            ? "You haven’t added any resources yet."
            : "No resources yet."}
        </Typography>
      )}
    </Box>
  );
}
