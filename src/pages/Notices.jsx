import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Grid,
  Chip,
  Stack,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import useApi from "../hooks/useApi";
// import "../styles.css";

export default function Notices() {
  const { role, token } = useAuth();
  const { get, post, del, put } = useApi();

  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [pinned, setPinned] = useState(false);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterAudience, setFilterAudience] = useState("all");
  const [showPinned, setShowPinned] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAudience, setEditAudience] = useState("all");
  const [editPinned, setEditPinned] = useState(false);
  const [editFile, setEditFile] = useState(null);

  const isAdminOrSuper = ["admin", "superadmin"].includes(role?.toLowerCase());

  const load = async (reset = false) => {
    try {
      setLoading(true);
      const data = await get(
        `/notices?search=${search}&audience=${filterAudience}&pinned=${showPinned}&page=${page}&limit=6`
      );
      setList(reset ? data.notices : [...list, ...data.notices]);
      setHasMore(page < data.pages);
    } catch {
      setErr("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterAudience, showPinned]);

  useEffect(() => {
    load(page === 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const uploadFile = async (fileObj) => {
    if (!fileObj) return null;
    const formData = new FormData();
    formData.append("file", fileObj);
    const res = await fetch("http://localhost:5000/api/resources/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      let attachmentUrl = null;
      if (file) attachmentUrl = await uploadFile(file);
      await post("/notices", { title, body, audience, pinned, attachment: attachmentUrl });
      setTitle("");
      setBody("");
      setAudience("all");
      setPinned(false);
      setFile(null);
      setSuccess("Notice created ✅");
      setPage(1);
      load(true);
    } catch {
      setErr("Create failed (admins only)");
    }
  };

  const startEdit = (notice) => {
    setEditId(notice._id);
    setEditTitle(notice.title);
    setEditBody(notice.body);
    setEditAudience(notice.audience);
    setEditPinned(notice.pinned);
    setEditFile(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditBody("");
    setEditAudience("all");
    setEditPinned(false);
    setEditFile(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      let attachmentUrl = null;
      if (editFile) attachmentUrl = await uploadFile(editFile);
      const updated = await put(`/notices/${editId}`, {
        title: editTitle,
        body: editBody,
        audience: editAudience,
        pinned: editPinned,
        attachment: attachmentUrl || undefined,
      });
      setList((prev) => prev.map((n) => (n._id === editId ? updated : n)));
      setSuccess("Notice updated ✅");
      cancelEdit();
    } catch {
      setErr("Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await del(`/notices/${id}`);
      setList((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert("Delete failed (admin only)");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        📢 Notices
      </Typography>
      {err && <Alert severity="error">{err}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* Admin + SuperAdmin can create */}
      {isAdminOrSuper && !editId && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Add Notice</Typography>
          <Box component="form" onSubmit={create} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <TextField
              label="Body"
              multiline
              minRows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            <TextField
              select
              label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="candidates">candidates</MenuItem>
              <MenuItem value="guests">Guests</MenuItem>
              <MenuItem value="admins">Admins</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Checkbox checked={pinned} onChange={(e) => setPinned(e.target.checked)} />}
              label="Pin this notice"
            />
            <Button variant="outlined" component="label">
              {file ? `Selected: ${file.name}` : "Attach File"}
              <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
            </Button>
            <Button type="submit" variant="contained">
              Publish
            </Button>
          </Box>
        </Paper>
      )}

      {/* filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField label="Search notices" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
          <TextField
            select
            label="Audience"
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="candidates">candidates</MenuItem>
            <MenuItem value="guests">Guests</MenuItem>
            <MenuItem value="admins">Admins</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={showPinned} onChange={(e) => setShowPinned(e.target.checked)} />}
            label="Show only pinned"
          />
        </Stack>
      </Paper>

      {loading && page === 1 ? (
        <Box sx={{ textAlign: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {list.map((n) => (
            <Grid item xs={12} md={6} key={n._id}>
              <Paper sx={{ p: 2 }}>
                {editId === n._id ? (
                  <Box component="form" onSubmit={saveEdit} sx={{ display: "grid", gap: 2 }}>
                    <TextField label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                    <TextField
                      label="Body"
                      multiline
                      minRows={3}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      required
                    />
                    <TextField
                      select
                      label="Audience"
                      value={editAudience}
                      onChange={(e) => setEditAudience(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="candidates">candidates</MenuItem>
                      <MenuItem value="guests">Guests</MenuItem>
                      <MenuItem value="admins">Admins</MenuItem>
                    </TextField>
                    <FormControlLabel
                      control={<Checkbox checked={editPinned} onChange={(e) => setEditPinned(e.target.checked)} />}
                      label="Pin this notice"
                    />
                    <Button variant="outlined" component="label">
                      {editFile ? `Selected: ${editFile.name}` : "Replace Attachment"}
                      <input type="file" hidden onChange={(e) => setEditFile(e.target.files[0])} />
                    </Button>
                    <Stack direction="row" spacing={2}>
                      <Button type="submit" variant="contained">
                        Save
                      </Button>
                      <Button onClick={cancelEdit}>Cancel</Button>
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{n.title}</Typography>
                      <Stack direction="row" spacing={1}>
                        {n.pinned && <Chip label="Pinned" size="small" color="warning" />}
                        <Chip label={n.audience} size="small" variant="outlined" />
                      </Stack>
                    </Stack>
                    <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>{n.body}</Typography>
                    {n.attachment && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        href={n.attachment}
                        target="_blank"
                      >
                        Open Attachment
                      </Button>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {new Date(n.createdAt).toLocaleString()}
                      {n.createdBy?.name ? ` • by ${n.createdBy.name}` : ""}
                    </Typography>

                    {isAdminOrSuper && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button color="primary" onClick={() => startEdit(n)}>
                          Edit
                        </Button>
                        <Button color="error" onClick={() => remove(n._id)}>
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {hasMore && !loading && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button variant="outlined" onClick={() => setPage((p) => p + 1)}>
            Load More
          </Button>
        </Box>
      )}
      {!loading && list.length === 0 && <Typography>No notices found.</Typography>}
    </Box>
  );
}
