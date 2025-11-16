import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
  Box,
  Tooltip,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSocket } from "../../socket.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useApi from "../../hooks/useApi.js";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { get, patch } = useApi();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // 🧠 Fetch notifications on mount
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await get("/notifications");
        setNotifications(res || []);
        setUnreadCount(res?.filter((n) => !n.read).length || 0);
      } catch (err) {
        console.error("❌ Notification fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, get]);

  // 🔔 Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket || !user) return;
    socket.on("notification", (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((count) => count + 1);
    });
    return () => socket.off("notification");
  }, [socket, user]);

  const handleMarkAllRead = async () => {
    try {
      await patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("❌ Failed to mark notifications as read:", err);
    }
  };

  const handleItemClick = async (notif) => {
    handleClose();
    if (!notif.read) {
      try {
        await patch(`/notifications/${notif._id}/mark-read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((count) => Math.max(count - 1, 0));
      } catch (err) {
        console.error("❌ Mark read failed:", err);
      }
    }
    if (notif.link) navigate(notif.link);
  };

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <IconButton
          color="inherit"
          onClick={handleOpen}
          sx={{
            color: "#fff",
            position: "relative",
            "&:hover": { transform: "scale(1.1)" },
            transition: "all 0.25s ease",
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            overlap="circular"
          >
            <NotificationsIcon fontSize="medium" />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* 🧾 Notifications Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 450,
            borderRadius: 3,
            boxShadow:
              "0 6px 20px rgba(0,0,0,0.15), 0 0 12px rgba(108,99,255,0.2)",
            p: 1,
          },
        }}
        TransitionComponent={motion.div}
        transitionDuration={300}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              onClick={handleMarkAllRead}
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {loading ? (
          <Box
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet 🎉
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MenuItem
                    onClick={() => handleItemClick(notif)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 0.5,
                      py: 1.2,
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: notif.read
                        ? "transparent"
                        : "rgba(108,99,255,0.08)",
                      "&:hover": {
                        backgroundColor: "rgba(108,99,255,0.15)",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: notif.read ? 500 : 700,
                        color: notif.read ? "text.secondary" : "primary.main",
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.85rem",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.3 }}
                    >
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </MenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </Menu>
    </>
  );
}
