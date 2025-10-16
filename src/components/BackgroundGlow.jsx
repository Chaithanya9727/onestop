import React from "react";
import { motion } from "framer-motion";

export default function BackgroundGlow() {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      {/* 🔵 Blue-Purple Glow */}
      <motion.div
        animate={{
          x: ["0%", "100%", "0%"],
          y: ["0%", "50%", "0%"],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(102,126,234,0.5), rgba(118,75,162,0))",
          filter: "blur(120px)",
          borderRadius: "50%",
          top: "20%",
          left: "10%",
        }}
      />

      {/* 🟣 Purple-Blue Glow */}
      <motion.div
        animate={{
          x: ["100%", "0%", "100%"],
          y: ["80%", "30%", "80%"],
          scale: [1.2, 0.9, 1.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          background:
            "radial-gradient(circle, rgba(118,75,162,0.5), rgba(102,126,234,0))",
          filter: "blur(120px)",
          borderRadius: "50%",
          bottom: "10%",
          right: "5%",
        }}
      />
    </div>
  );
}
