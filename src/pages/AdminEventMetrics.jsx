import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Stack,
  Chip,
  Divider,
  Button,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import useApi from "../hooks/useApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";

const COLORS = [
  "#6c63ff",
  "#ff4081",
  "#00bcd4",
  "#ffc107",
  "#4caf50",
  "#9c27b0",
];

export default function AdminEventMetrics() {
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await get("/events/admin/metrics");
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [reloadKey]);

  const handleRefresh = () => setReloadKey((k) => k + 1);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Typography variant="h6" align="center" color="text.secondary" mt={10}>
        ⚠️ Failed to load metrics.
      </Typography>
    );
  }

  const chartData =
    metrics.byCategory?.map((c) => ({
      name: c._id || "Other",
      value: c.count,
    })) || [];

  const barData = chartData.map((c) => ({
    name: c.name,
    Events: c.value,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Container sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "linear-gradient(145deg, #f7f9fc, #eef1f6)",
            boxShadow:
              "0 4px 30px rgba(108,99,255,0.1), 0 0 10px rgba(255,64,129,0.1)",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: "linear-gradient(90deg, #6c63ff, #ff4081)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📊 Event Analytics
            </Typography>

            <Tooltip title="Reload metrics">
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  background: "linear-gradient(135deg, #6c63ff, #ff4081)",
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #7a6aff, #ff5b95)",
                  },
                }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            mb={4}
            alignItems="center"
          >
            <Chip
              label={`Total Events: ${metrics.total || 0}`}
              color="primary"
              sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
            />
            {metrics.byCategory?.map((c) => (
              <Chip
                key={c._id}
                label={`${c._id}: ${c.count}`}
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              mt: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={1}
                color="text.secondary"
              >
                Event Distribution by Category
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">
                  No data available to display.
                </Typography>
              )}
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={1}
                color="text.secondary"
              >
                Event Counts by Category
              </Typography>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <ReTooltip />
                    <Bar
                      dataKey="Events"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#ff4081" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">
                  No data available for chart.
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
}
