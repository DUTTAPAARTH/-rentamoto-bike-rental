import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import LoadingSpinner from "../components/LoadingSpinner";

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRentals, setRecentRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch user stats
        const statsResponse = await axios.get(
          "http://localhost:3001/my-bookings/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(statsResponse.data);

        // Fetch recent rentals
        const rentalsResponse = await axios.get(
          "http://localhost:3001/my-bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRecentRentals(rentalsResponse.data.slice(0, 5)); // Show latest 5
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values if API fails
        setStats({
          totalRentals: 0,
          totalSpent: 0,
          averageRating: 0,
          totalHours: 0,
        });
        setRecentRentals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const statCards = [
    {
      title: "Total Rentals",
      value: stats?.totalRentals || 0,
      icon: (
        <DirectionsBikeIcon sx={{ fontSize: "2rem", color: "primary.main" }} />
      ),
      color: "primary",
      trend: "+12%",
    },
    {
      title: "Hours Ridden",
      value: `${stats?.totalHours || 0}h`,
      icon: <AccessTimeIcon sx={{ fontSize: "2rem", color: "success.main" }} />,
      color: "success",
      trend: "+8%",
    },
    {
      title: "Total Spent",
      value: `$${stats?.totalSpent || 0}`,
      icon: (
        <MonetizationOnIcon sx={{ fontSize: "2rem", color: "warning.main" }} />
      ),
      color: "warning",
      trend: "+15%",
    },
    {
      title: "Avg Rating",
      value: `${stats?.averageRating || 0}/5`,
      icon: <StarIcon sx={{ fontSize: "2rem", color: "error.main" }} />,
      color: "error",
      trend: "+5%",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 1,
              }}
            >
              Welcome back, {user?.name || user?.email}!
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ready for your next adventure?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                component={Link}
                to="/bikes"
                startIcon={<DirectionsBikeIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  },
                }}
              >
                Browse Bikes
              </Button>
              {isAdmin && (
                <Button
                  variant="outlined"
                  component={Link}
                  to="/admin"
                  startIcon={<TrendingUpIcon />}
                >
                  Admin Panel
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  {stat.icon}
                  <Chip
                    label={stat.trend}
                    color={stat.color}
                    size="small"
                    icon={<TrendingUpIcon />}
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  color={stat.color}
                  sx={{
                    mt: 2,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette[stat.color].main, 0.1),
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Rentals */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <DirectionsBikeIcon color="primary" />
              Recent Rentals
            </Typography>
            {recentRentals.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                }}
              >
                <DirectionsBikeIcon
                  sx={{ fontSize: "4rem", opacity: 0.3, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  No rentals yet
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Start your journey by renting your first bike!
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/bikes"
                  startIcon={<DirectionsBikeIcon />}
                >
                  Browse Bikes
                </Button>
              </Box>
            ) : (
              <Box>
                {recentRentals.map((rental) => (
                  <Card
                    key={rental.id}
                    sx={{
                      mb: 2,
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                      },
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", mb: 1 }}
                          >
                            {rental.bike_name || "Bike Rental"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Rented on:{" "}
                            {new Date(rental.rental_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {rental.duration_hours}h • Total: $
                            {rental.total_price}
                          </Typography>
                        </Box>
                        <Chip
                          label={rental.status || "Completed"}
                          color={
                            rental.status === "active" ? "success" : "default"
                          }
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/rentals"
                  sx={{ mt: 2 }}
                >
                  View All Rentals
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 3,
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/bikes"
                startIcon={<DirectionsBikeIcon />}
                sx={{
                  py: 2,
                  justifyContent: "flex-start",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                Rent a Bike
              </Button>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/rentals"
                startIcon={<AccessTimeIcon />}
                sx={{ py: 2, justifyContent: "flex-start" }}
              >
                View My Rentals
              </Button>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/profile"
                startIcon={<PersonIcon />}
                sx={{ py: 2, justifyContent: "flex-start" }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>

          {/* Profile Summary */}
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 3,
              }}
            >
              Profile Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "Recently"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Account Type
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {isAdmin ? "Administrator" : "Regular User"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Total Rentals
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {stats?.totalRentals || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
