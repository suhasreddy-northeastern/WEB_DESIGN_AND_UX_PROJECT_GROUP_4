// components/common/ScrollAndFocusHandler.js
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollAndFocusHandler() {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip first load
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus(); // ⬅️ Accessibility fix
      window.scrollTo(0, 0); // ⬅️ Optional scroll reset
    }
  }, [location]);

  return null;
}
