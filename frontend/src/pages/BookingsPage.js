import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  useTheme,
  alpha,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LoadingSpinner from "../components/LoadingSpinner";

const BookingsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const theme = useTheme();

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/my-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRentals(response.data);
      } catch (error) {
        console.error("Error fetching rentals:", error);
        // Sample data for demo
        setRentals([
          {
            id: 1,
            bike_name: "City Cruiser Pro",
            rental_date: new Date().toISOString(),
            duration_hours: 4,
            total_price: 48,
            status: "completed",
            location: "Downtown Station",
          },
          {
            id: 2,
            bike_name: "Mountain Explorer",
            rental_date: new Date(Date.now() - 86400000).toISOString(),
            duration_hours: 6,
            total_price: 108,
            status: "completed",
            location: "Trail Head",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const handleReview = (rental) => {
    setSelectedRental(rental);
    setReviewDialog(true);
    setReview({ rating: 5, comment: "" });
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/bookings/${selectedRental.id}/review`,
        review,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setRentals(
        rentals.map((rental) =>
          rental.id === selectedRental.id
            ? {
                ...rental,
                user_rating: review.rating,
                user_review: review.comment,
              }
            : rental
        )
      );

      setReviewDialog(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bookings..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "text.primary",
          textAlign: "center",
          mb: 4,
        }}
      >
        My Bookings
      </Typography>

      {rentals.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <DirectionsBikeIcon
            sx={{ fontSize: "4rem", color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start your cycling adventure by booking your first bike!
          </Typography>
          <Button variant="contained" href="/bikes">
            Browse Bikes
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rentals.map((rental) => (
            <Grid item xs={12} key={rental.id}>
              <Card
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <DirectionsBikeIcon
                          sx={{ fontSize: "2rem", color: "primary.main" }}
                        />
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bold", color: "text.primary" }}
                        >
                          {rental.bike_name}
                        </Typography>
                        <Chip
                          label={rental.status}
                          color={getStatusColor(rental.status)}
                          variant="outlined"
                        />
                      </Box>

                      <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: "1rem", color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Rental Date
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="medium">
                            {format(new Date(rental.rental_date), "PPP p")}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: "1rem", color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="medium">
                            {rental.duration_hours} hours
                          </Typography>
                        </Grid>
                      </Grid>

                      {rental.location && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Pick-up Location: {rental.location}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: "center",
                          background: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <AttachMoneyIcon sx={{ color: "primary.main" }} />
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: "bold", color: "primary.main" }}
                          >
                            ${rental.total_price}
                          </Typography>
                        </Box>

                        {rental.status === "completed" &&
                          !rental.user_rating && (
                            <Button
                              variant="contained"
                              startIcon={<RateReviewIcon />}
                              onClick={() => handleReview(rental)}
                              sx={{
                                mt: 2,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              }}
                            >
                              Rate & Review
                            </Button>
                          )}

                        {rental.user_rating && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Your Rating
                            </Typography>
                            <Rating value={rental.user_rating} readOnly />
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Rate Your Experience
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" gutterBottom>
            How was your ride with {selectedRental?.bike_name}?
          </Typography>

          <Box sx={{ textAlign: "center", my: 3 }}>
            <Rating
              size="large"
              value={review.rating}
              onChange={(event, newValue) => {
                setReview({ ...review, rating: newValue });
              }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review (Optional)"
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            placeholder="Share your experience with other riders..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={submitReview}
            variant="contained"
            sx={{
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingsPage;
