import { useState } from "react";
import {
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import CloseIcon from "@mui/icons-material/Close";
import './styles.css'

export default function ResourceCard({ resource, user, role, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  // ✅ check file types
  const isImage = (url) => url?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isPdf = (url) => url?.match(/\.pdf$/i);
  const isDoc = (url) => url?.match(/\.(doc|docx|ppt|pptx)$/i);

  // ✅ Decide button label + icon
  const getButtonLabel = () => {
    if (isImage(resource.url)) return "View Image";
    if (isPdf(resource.url)) return "View PDF";
    if (isDoc(resource.url)) return "Open Document";
    if (resource.type === "link") return "Visit Link";
    return "Open Resource";
  };

  const getButtonIcon = () => {
    if (isPdf(resource.url)) return <PictureAsPdfIcon fontSize="small" sx={{ mr: 0.5 }} />;
    if (isDoc(resource.url)) return <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />;
    if (resource.type === "link") return <InsertLinkIcon fontSize="small" sx={{ mr: 0.5 }} />;
    return null;
  };

  // ✅ For embedded Google Docs viewer
  const getEmbedUrl = () => {
    if (isPdf(resource.url) || isDoc(resource.url)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(resource.url)}&embedded=true`;
    }
    return resource.url;
  };

  return (
    <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Image preview */}
      {isImage(resource.url) && (
        <img
          src={resource.url}
          alt={resource.title}
          style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }}
        />
      )}

      {/* Title */}
      <Typography variant="h6">{resource.title}</Typography>

      {/* Description */}
      {resource.description && (
        <Typography variant="body2" color="text.secondary">
          {resource.description}
        </Typography>
      )}

      {/* Type chip */}
      {resource.type && (
        <Chip
          label={resource.type}
          size="small"
          color={
            resource.type === "note"
              ? "primary"
              : resource.type === "tutorial"
              ? "success"
              : "info"
          }
          sx={{ width: "fit-content" }}
        />
      )}

      {/* Open resource */}
      {resource.url && (
        <Button
          size="small"
          sx={{ alignSelf: "flex-start" }}
          startIcon={getButtonIcon()}
          onClick={() => {
            if (isPdf(resource.url) || isDoc(resource.url)) {
              setOpen(true); // open in modal
            } else {
              window.open(resource.url, "_blank", "noopener,noreferrer");
            }
          }}
        >
          {getButtonLabel()}
        </Button>
      )}

      {/* Created By */}
      {resource.user && resource.user.name && (
        <Typography variant="caption" color="text.secondary">
          Uploaded by {resource.user.name}
        </Typography>
      )}

      {/* Actions */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {user && (resource.user?._id === user._id || role === "admin") && (
          <Button
            color="primary"
            variant="outlined"
            size="small"
            onClick={() => onEdit(resource)}
          >
            Edit
          </Button>
        )}

        {role === "admin" && (
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => onDelete(resource._id)}
          >
            Delete
          </Button>
        )}
      </Stack>

      {/* ✅ Modal for PDF/Docs preview */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1 }}>
          <Typography variant="subtitle1">{resource.title}</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <DialogContent sx={{ p: 0, height: "80vh" }}>
          <iframe
            src={getEmbedUrl()}
            title="Document Viewer"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
