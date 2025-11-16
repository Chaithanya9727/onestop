import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";

export default function MyRegistrations() {
  const { get } = useApi();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get("/events/registrations/me");
      setRows(data.registrations || []);
      showToast("✅ Loaded your registrations successfully", "success");
    } catch (err) {
      console.error("MyRegistrations error:", err);
      showToast("❌ Failed to load your registrations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  const renderStatus = (r) => {
    switch (r.submissionStatus) {
      case "submitted":
        return <Chip label="Submitted" color="success" size="small" />;
      case "reviewed":
        return <Chip label="Reviewed" color="info" size="small" />;
      case "not_submitted":
      default:
        return <Chip label="Not Submitted" color="warning" size="small" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {/* Title Bar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h4" fontWeight={800}>
              🎟️ My Event Registrations
            </Typography>
            <Button variant="outlined" onClick={load}>
              Refresh
            </Button>
          </Stack>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Event</strong></TableCell>
                  <TableCell><strong>Dates</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Registered At</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(rows || []).map((r, idx) => (
                  <motion.tr
                    key={r.eventId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Event Title */}
                    <TableCell>{r.title || "—"}</TableCell>

                    {/* Dates */}
                    <TableCell>
                      {fmt(r.startDate)} – {fmt(r.endDate)}
                    </TableCell>

                    {/* Submission Status */}
                    <TableCell>{renderStatus(r)}</TableCell>

                    {/* Registered At */}
                    <TableCell>{fmt(r.registeredAt)}</TableCell>

                    {/* Action Buttons */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {/* Open Event */}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/events/${r.eventId}`)}
                        >
                          Open
                        </Button>

                        {/* Submit Entry */}
                        {r.submissionStatus === "not_submitted" && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              navigate(`/events/submit/${r.eventId}`)
                            }
                          >
                            Submit Entry
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </motion.tr>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">
                        You haven’t registered for any events yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>
    </motion.div>
  );
}
