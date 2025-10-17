// src/pages/BecomeMentor.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * 🧭 BecomeMentor.jsx
 * ----------------------------------------------------------------
 * This is a compatibility redirect component.
 * It automatically redirects any old links or bookmarks
 * pointing to "/become-mentor" → to the new route "/apply-for-mentor".
 * 
 * This avoids duplicate code and ensures that the user always sees
 * the latest mentor application page (ApplyForMentor.jsx).
 * ----------------------------------------------------------------
 */

export default function BecomeMentor() {
  const location = useLocation();

  // Preserve any query parameters (like ?ref=menu)
  const search = location.search || "";

  // Redirect user to the new ApplyForMentor page
  return <Navigate to={`/apply-for-mentor${search}`} replace />;
}
