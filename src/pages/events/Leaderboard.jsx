import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
  Alert,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { get } = useApi();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [meta, setMeta] = useState({ totalParticipants: 0, totalSubmissions: 0 });

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await get(`/events/${eventId}/leaderboard`);
      const { leaderboard, totalParticipants, totalSubmissions } = res;
      setRows(
        leaderboard.map((r, i) => ({
          id: i + 1,
          rank: r.rank || "—",
          name: r.name,
          email: r.email,
          teamName: r.teamName,
          finalScore: r.finalScore,
          feedback: r.feedback,
          submittedAt: r.submittedAt,
          lastUpdated: r.lastUpdated,
        }))
      );
      setMeta({ totalParticipants, totalSubmissions });
    } catch (e) {
      console.error("Leaderboard load error:", e);
      setErr(e?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const columns = [
    {
      field: "rank",
      headerName: "Rank",
      minWidth: 90,
      renderCell: (params) => {
        const rank = params.value;
        if (rank === "—") return <Chip label="N/A" size="small" />;
        const color = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "default";
        const chipColor =
          color === "gold"
            ? "#FFD700"
            : color === "silver"
            ? "#C0C0C0"
            : color === "bronze"
            ? "#CD7F32"
            : "";
        return (
          <Chip
            size="small"
            label={rank}
            sx={{
              backgroundColor: chipColor || "transparent",
              fontWeight: 700,
              color: chipColor ? "#000" : "inherit",
            }}
          />
        );
      },
    },
    { field: "name", headerName: "Participant", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "teamName", headerName: "Team", flex: 1, minWidth: 180 },
    {
      field: "finalScore",
      headerName: "Score",
      minWidth: 120,
      renderCell: (params) => {
        const score = params.value;
        if (score == null)
          return <Chip label="—" size="small" variant="outlined" />;
        const color =
          score >= 90 ? "success" : score >= 75 ? "info" : score >= 50 ? "warning" : "error";
        return (
          <Chip
            size="small"
            label={score}
            color={color}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: "feedback",
      headerName: "Feedback",
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) =>
        params.value ? (
          <Tooltip title={params.value}>
            <Typography
              noWrap
              sx={{ fontSize: 13, color: "text.secondary" }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography sx={{ color: "text.disabled", fontSize: 13 }}>—</Typography>
        ),
    },
    {
      field: "submittedAt",
      headerName: "Submitted At",
      minWidth: 180,
      valueGetter: (p) =>
        p.value ? new Date(p.value).toLocaleString() : "—",
    },
  ];

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Tooltip title="Back">
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={800}>
          Event Leaderboard
        </Typography>
        <Box flexGrow={1} />
        <Tooltip title="Refresh">
          <IconButton onClick={load}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {err && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {loading ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={10}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={3} mb={2}>
              <Chip
                label={`Participants: ${meta.totalParticipants}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Submissions: ${meta.totalSubmissions}`}
                color="success"
                variant="outlined"
              />
            </Stack>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ width: "100%" }}>
                <DataGrid
                  autoHeight
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[10]}
                  disableColumnMenu
                  disableRowSelectionOnClick
                  getRowId={(r) => r.id}
                />
              </div>
            </motion.div>
          </>
        )}
      </Paper>
    </Box>
  );
}
