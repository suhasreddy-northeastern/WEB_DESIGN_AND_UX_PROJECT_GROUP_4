// import { useEffect } from "react";
// import { useLocation } from "react-router-dom";

// function ScrollAndFocusHandler() {
//   const location = useLocation();

//   useEffect(() => {
//     const main = document.getElementById("main-content");
//     if (main) {
//       main.focus();
//     }

//     window.scrollTo(0, 0); // optional scroll reset
//   }, [location]);

//   return null;
// }

// export default ScrollAndFocusHandler;

// ScrollAndFocusHandler.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollAndFocusHandler() {
  const location = useLocation();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) {
      // Focus on main content area after navigation
      main.focus({ preventScroll: true });
    }

    // Optional scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

export default ScrollAndFocusHandler;
