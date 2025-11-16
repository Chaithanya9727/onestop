import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";

export default function EventsList() {
  const { get } = useApi();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await get("/events");
        setEvents(res.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!events.length)
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography>No upcoming events found ⚡</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Upcoming & Active Events
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 4,
                transition: "0.3s",
                "&:hover": { transform: "translateY(-5px)" },
              }}
            >
              {event.coverImage?.url && (
                <CardMedia
                  component="img"
                  height="160"
                  image={event.coverImage.url}
                  alt={event.title}
                />
              )}
              <CardContent>
                <Typography variant="h6" fontWeight={700}>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.subtitle}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={event.category} size="small" />
                  <Chip label={event.location} size="small" variant="outlined" />
                </Stack>
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  onClick={() => navigate(`/events/${event._id}`)}
                  variant="contained"
                  color="primary"
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
