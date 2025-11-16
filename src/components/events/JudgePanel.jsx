import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Paper, Stack, Typography, TextField, MenuItem, Button
} from "@mui/material";
import useApi from "../../hooks/useApi";
import SubmissionTable from "../../components/events/SubmissionTable";

export default function JudgePanel() {
  const { id } = useParams(); // eventId
  const { get, post } = useApi();

  const [event, setEvent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [round, setRound] = useState("");

  const load = async () => {
    const ev = await get(`/events/${id}`);
    setEvent(ev);
    const subs = await get(`/events/${id}/submissions`);
    setSubmissions(subs.submissions || []);
  };

  useEffect(() => {
    load().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filtered = round ? submissions.filter((s) => String(s.round) === String(round)) : submissions;

  const handleScore = async (_submission, payload) => {
    await post(`/events/${id}/evaluate`, payload);
    await load();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
          <Typography variant="h4" fontWeight={800}>Judge Panel — {event?.title || ""}</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Filter by Round"
              select
              value={round}
              onChange={(e) => setRound(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="1">Round 1</MenuItem>
              <MenuItem value="2">Round 2</MenuItem>
              <MenuItem value="3">Round 3</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={() => setRound("")}>Clear</Button>
          </Stack>
        </Stack>

        <SubmissionTable submissions={filtered} onScore={handleScore} />
      </Paper>
    </Container>
  );
}
