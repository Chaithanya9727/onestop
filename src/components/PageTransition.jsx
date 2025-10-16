// src/components/PageTransition.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)", y: 15 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)", y: -20 }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1], // Apple's smooth cubic-bezier
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
