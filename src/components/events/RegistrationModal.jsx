import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, IconButton, Typography
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function RegistrationModal({ open, onClose, onSubmit, maxTeamSize = 1 }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);

  const canAdd = 1 + members.length < maxTeamSize;

  const addMember = () =>
    setMembers((m) => [...m, { name: "", email: "" }]);

  const updateMember = (idx, key, val) =>
    setMembers((m) => m.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));

  const removeMember = (idx) =>
    setMembers((m) => m.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    onSubmit({ teamName: teamName.trim(), members: members.filter(x => x.name || x.email) });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Register for Event</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {maxTeamSize > 1 && (
            <TextField
              label="Team Name (optional)"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
            />
          )}

          <Typography variant="subtitle2" color="text.secondary">
            Members (you are already counted). Max team size: {maxTeamSize}
          </Typography>

          {members.map((m, idx) => (
            <Stack direction="row" spacing={1} key={idx}>
              <TextField
                label="Name"
                value={m.name}
                onChange={(e) => updateMember(idx, "name", e.target.value)}
                fullWidth
              />
              <TextField
                label="Email"
                value={m.email}
                onChange={(e) => updateMember(idx, "email", e.target.value)}
                fullWidth
              />
              <IconButton onClick={() => removeMember(idx)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}

          <Stack direction="row" spacing={1}>
            <Button onClick={addMember} disabled={!canAdd} variant="outlined">
              Add Member
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Register</Button>
      </DialogActions>
    </Dialog>
  );
}
