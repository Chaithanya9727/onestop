import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const {
    _id,
    title,
    subtitle,
    coverImage,
    startDate,
    endDate,
    organizer,
    category,
    status,
  } = event;

  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={() => navigate(`/events/${_id}`)} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="160"
          image={coverImage?.url || "https://via.placeholder.com/640x360?text=Event+Banner"}
          alt={title}
        />
        <CardContent>
          <Stack direction="row" spacing={1} mb={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={category || "other"} />
            <Chip
              size="small"
              color={status === "upcoming" ? "info" : status === "ongoing" ? "success" : "default"}
              label={status?.toUpperCase() || ""}
            />
          </Stack>

          <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {subtitle}
            </Typography>
          )}
          {organizer && (
            <Typography variant="caption" color="text.secondary">By {organizer}</Typography>
          )}

          <Box mt={1}>
            <Typography variant="body2">
              {formatDate(startDate)} — {formatDate(endDate)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      <Box px={2} pb={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={() => navigate(`/events/${_id}`)}>View Details</Button>
      </Box>
    </Card>
  );
}
