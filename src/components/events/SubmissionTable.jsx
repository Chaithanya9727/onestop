import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Stack, Link, Tooltip
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

/**
 * SubmissionTable
 * Props:
 * - submissions: Array<Submission>
 * - onScore: (submission, { score, feedback, round, userId }) => Promise
 */
export default function SubmissionTable({ submissions, onScore }) {
  const [drafts, setDrafts] = useState({}); // {submissionId: {score, feedback}}

  const set = (id, k, v) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Participant</TableCell>
          <TableCell>Round</TableCell>
          <TableCell>Link / File</TableCell>
          <TableCell align="right">Score</TableCell>
          <TableCell>Feedback</TableCell>
          <TableCell align="center">Save</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {submissions.map((s) => (
          <TableRow key={s._id}>
            <TableCell>
              {s.user?.name || "—"} <br />
              <small>{s.user?.email || "—"}</small>
            </TableCell>
            <TableCell>{s.round}</TableCell>
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {s.submissionLink && (
                  <Tooltip title="Open submission link">
                    <Link href={s.submissionLink} target="_blank" rel="noreferrer" underline="hover">
                      Link <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
                    </Link>
                  </Tooltip>
                )}
                {s.submissionFile?.url && (
                  <Tooltip title="Open uploaded file">
                    <Link href={s.submissionFile.url} target="_blank" rel="noreferrer" underline="hover">
                      File <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
                    </Link>
                  </Tooltip>
                )}
              </Stack>
            </TableCell>
            <TableCell align="right" style={{ width: 120 }}>
              <TextField
                size="small"
                type="number"
                value={drafts[s._id]?.score ?? (s.score ?? "")}
                onChange={(e) => set(s._id, "score", e.target.value)}
              />
            </TableCell>
            <TableCell style={{ width: 300 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Optional"
                value={drafts[s._id]?.feedback ?? (s.feedback ?? "")}
                onChange={(e) => set(s._id, "feedback", e.target.value)}
              />
            </TableCell>
            <TableCell align="center" style={{ width: 80 }}>
              <IconButton
                color="primary"
                onClick={() =>
                  onScore(s, {
                    score: Number(drafts[s._id]?.score ?? s.score ?? 0),
                    feedback: drafts[s._id]?.feedback ?? s.feedback ?? "",
                    round: s.round,
                    userId: s.user?._id,
                  })
                }
              >
                <CheckIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}

        {submissions.length === 0 && (
          <TableRow>
            <TableCell colSpan={6}>
              <Stack alignItems="center" py={3}>No submissions yet.</Stack>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
