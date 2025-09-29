import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, Typography, Container } from "@mui/material";
import theme from "./theme";

// Simple HomePage component without auth
const SimpleHomePage = () => {
  return (
    <Container>
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h1" sx={{ color: "primary.main", mb: 4 }}>
          🚲 RENTAMOTO
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Premium Bike Rentals
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Your bike rental system is working! Environment is loading...
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          API URL: {process.env.REACT_APP_API_URL || "Not set"}
        </Typography>
      </Box>
    </Container>
  );
};

function App() {
  console.log("🚀 RENTAMOTO App starting...");
  console.log("API URL:", process.env.REACT_APP_API_URL);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Box sx={{ flex: 1, backgroundColor: "background.default" }}>
            <Routes>
              <Route path="/" element={<SimpleHomePage />} />
              <Route path="*" element={<SimpleHomePage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
