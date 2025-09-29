import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const HomePage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const features = [
    {
      icon: (
        <DirectionsBikeIcon sx={{ fontSize: "3rem", color: "primary.main" }} />
      ),
      title: "Premium Bikes",
      description:
        "High-quality bikes for every adventure, from city cruising to mountain trails.",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: "3rem", color: "primary.main" }} />,
      title: "Quick Booking",
      description:
        "Book your perfect bike in seconds with our streamlined rental process.",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: "3rem", color: "primary.main" }} />,
      title: "Secure & Safe",
      description:
        "All bikes are regularly maintained and include comprehensive insurance coverage.",
    },
    {
      icon: (
        <SupportAgentIcon sx={{ fontSize: "3rem", color: "primary.main" }} />
      ),
      title: "24/7 Support",
      description:
        "Round-the-clock customer support for all your rental needs and emergencies.",
    },
    {
      icon: (
        <LocalFloristIcon sx={{ fontSize: "3rem", color: "primary.main" }} />
      ),
      title: "Eco-Friendly",
      description:
        "Reduce your carbon footprint with sustainable transportation solutions.",
    },
    {
      icon: (
        <AttachMoneyIcon sx={{ fontSize: "3rem", color: "primary.main" }} />
      ),
      title: "Best Prices",
      description:
        "Competitive rates with flexible rental periods to suit your budget.",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.9
          )} 0%, ${alpha(
            theme.palette.primary.dark,
            0.8
          )} 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300"><path fill="%23ffffff" fill-opacity="0.05" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  mb: 3,
                }}
              >
                RENTAMOTO
              </Typography>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  opacity: 0.95,
                  lineHeight: 1.6,
                  mb: 4,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                Premium bike rentals for every journey. Explore the city,
                conquer trails, or simply enjoy the ride with our top-quality
                fleet.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {!user ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/signup"
                      sx={{
                        bgcolor: "white",
                        color: "primary.main",
                        fontWeight: "bold",
                        px: 4,
                        py: 1.5,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[8],
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/login"
                      sx={{
                        borderColor: "white",
                        color: "white",
                        fontWeight: "bold",
                        px: 4,
                        py: 1.5,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.common.white, 0.1),
                          borderColor: "white",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/bikes"
                    startIcon={<DirectionsBikeIcon />}
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      fontWeight: "bold",
                      px: 4,
                      py: 1.5,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.common.white, 0.9),
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[8],
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Browse Bikes
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "text.primary",
            mb: 2,
          }}
        >
          Why Choose RENTAMOTO?
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: "600px", mx: "auto" }}
        >
          Experience the ultimate bike rental service with premium features
          designed for your comfort and convenience.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "text.primary" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Paper
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.secondary.main,
            0.9
          )} 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 100%)`,
          py: 8,
          color: "white",
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 3,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Ready to Start Your Adventure?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.95,
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Join thousands of satisfied customers who trust RENTAMOTO for
              their cycling needs. Book your perfect bike today and experience
              the freedom of the road.
            </Typography>
            {!user && (
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/signup"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  fontWeight: "bold",
                  px: 5,
                  py: 2,
                  fontSize: "1.1rem",
                  "&:hover": {
                    bgcolor: "primary.dark",
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[8],
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Join RENTAMOTO Today
              </Button>
            )}
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default HomePage;
