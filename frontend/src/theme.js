import { createTheme } from "@mui/material/styles";

// RENTAMOTO Color Palette: Electric Blue + White + Charcoal
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007BFF", // Electric Blue
      light: "#4DA3FF",
      dark: "#0056CC",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#363636", // Charcoal
      light: "#5A5A5A",
      dark: "#1F1F1F",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#363636", // Charcoal for text
      secondary: "#666666",
    },
    success: {
      main: "#28A745",
      light: "#5CBB5C",
      dark: "#1E7E34",
    },
    warning: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#F57C00",
    },
    error: {
      main: "#DC3545",
      light: "#EF5350",
      dark: "#C62828",
    },
    info: {
      main: "#007BFF", // Same as primary
      light: "#4DA3FF",
      dark: "#0056CC",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      color: "#363636",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      color: "#363636",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#363636",
    },
    h4: {
      fontWeight: 500,
      fontSize: "1.25rem",
      color: "#363636",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.125rem",
      color: "#363636",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
      color: "#363636",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 123, 255, 0.3)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #007BFF 0%, #0056CC 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #0056CC 0%, #004499 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #007BFF 0%, #0056CC 100%)",
          boxShadow: "0 2px 12px rgba(0, 123, 255, 0.15)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#007BFF",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#007BFF",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
