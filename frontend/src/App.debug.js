import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, Typography, Container } from "@mui/material";
import theme from "./theme";

function App() {
  console.log("App component rendering...");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h1" color="primary" gutterBottom>
            RENTAMOTO
          </Typography>
          <Typography variant="h4" gutterBottom>
            Debug Version - Testing Basic Rendering
          </Typography>
          <Typography variant="body1">
            If you can see this, the basic React app is working! 🎉
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
