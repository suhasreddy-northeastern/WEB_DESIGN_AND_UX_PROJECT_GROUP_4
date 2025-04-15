import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "../../common/theme/theme";

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  // Try to get saved mode from localStorage first
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  // Get OS preference on first load
  useEffect(() => {
    if (!localStorage.getItem("themeMode")) {
      const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDarkMode ? "dark" : "light");
      localStorage.setItem("themeMode", prefersDarkMode ? "dark" : "light");
    }
  }, []);

  // Create the theme using our function from theme.js
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeContext;