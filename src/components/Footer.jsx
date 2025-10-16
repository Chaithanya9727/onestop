import React from "react";
import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 2,
        px: 1,
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        position: "relative",
        bottom: 0,
        width: "100%",
        borderTop: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} OneStop Hub •{" "}
        <Link href="/contact" underline="hover" color="primary">
          Contact Us
        </Link>
      </Typography>
    </Box>
  );
}
