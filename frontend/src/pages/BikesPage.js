import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Rating,
  useTheme,
  alpha,
} from "@mui/material";
import { format } from "date-fns";
import axios from "axios";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SpeedIcon from "@mui/icons-material/Speed";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoadingSpinner from "../components/LoadingSpinner";

const BikesPage = () => {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBike, setSelectedBike] = useState(null);
  const [rentalDialog, setRentalDialog] = useState(false);
  const [rentalData, setRentalData] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    duration: 4,
  });
  const [rentalLoading, setRentalLoading] = useState(false);
  const [rentalError, setRentalError] = useState("");
  const [rentalSuccess, setRentalSuccess] = useState("");
  const theme = useTheme();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/bikes");
        console.log("Bikes API response:", response.data);

        // Check if response has the expected structure
        const bikesData = response.data?.data || response.data || [];
        const bikesArray = Array.isArray(bikesData) ? bikesData : [];

        // Transform the backend data to match frontend expectations
        const transformedBikes = bikesArray.map((bike) => ({
          id: bike.id,
          name: bike.model || bike.name,
          category: bike.brand === "RENTAMOTO" ? "City" : "Other", // You can enhance this logic
          price_per_hour: bike.price_per_hour,
          description:
            bike.description || `${bike.model} - Premium bike rental`,
          image_url:
            bike.image_url ||
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
          available: bike.is_available !== false,
          location:
            bike.latitude && bike.longitude
              ? `${bike.latitude.toFixed(4)}, ${bike.longitude.toFixed(4)}`
              : "Central Station",
          rating: 4.5,
        }));

        setBikes(transformedBikes);
        setFilteredBikes(transformedBikes);
      } catch (error) {
        console.error("Error fetching bikes:", error);
        // Set enhanced sample bikes for demo
        const sampleBikes = [
          {
            id: 1,
            name: "City Cruiser Pro",
            category: "City",
            price_per_hour: 12,
            description:
              "Perfect for city exploration with comfort and style. Features include basket, LED lights, and anti-theft lock.",
            image_url:
              "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Downtown Station",
            rating: 4.5,
          },
          {
            id: 2,
            name: "Mountain Explorer",
            category: "Mountain",
            price_per_hour: 18,
            description:
              "Rugged mountain bike for trail adventures with full suspension and all-terrain tires.",
            image_url:
              "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Trail Head",
            rating: 4.8,
          },
          {
            id: 3,
            name: "Electric Commuter",
            category: "Electric",
            price_per_hour: 25,
            description:
              "Electric bike for effortless commuting with 50-mile range and USB charging port.",
            image_url:
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "City Center",
            rating: 4.7,
          },
          {
            id: 4,
            name: "Road Racer",
            category: "Road",
            price_per_hour: 20,
            description:
              "Lightweight road bike for speed enthusiasts with aerodynamic design.",
            image_url:
              "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
            available: false,
            location: "Sports Center",
            rating: 4.6,
          },
          {
            id: 5,
            name: "Comfort Hybrid",
            category: "Hybrid",
            price_per_hour: 15,
            description:
              "Versatile hybrid bike for all-purpose riding with comfortable upright position.",
            image_url:
              "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Park Entrance",
            rating: 4.3,
          },
          {
            id: 6,
            name: "Urban Folding",
            category: "Folding",
            price_per_hour: 14,
            description:
              "Compact folding bike perfect for urban mobility and easy storage.",
            image_url:
              "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Metro Station",
            rating: 4.2,
          },
          {
            id: 7,
            name: "Thunder Bolt E-Bike",
            category: "Electric",
            price_per_hour: 28,
            description:
              "High-performance electric bike with turbo mode and smart display technology.",
            image_url:
              "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Tech District",
            rating: 4.9,
          },
          {
            id: 8,
            name: "Carbon Racer",
            category: "Road",
            price_per_hour: 26,
            description:
              "Ultra-lightweight carbon fiber road bike with professional-grade components.",
            image_url:
              "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Racing Circuit",
            rating: 4.8,
          },
          {
            id: 9,
            name: "Trail Blazer Pro",
            category: "Mountain",
            price_per_hour: 22,
            description:
              "Professional mountain bike with advanced suspension and rugged durability.",
            image_url:
              "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Mountain Base",
            rating: 4.7,
          },
          {
            id: 10,
            name: "Cargo Master",
            category: "Cargo",
            price_per_hour: 20,
            description:
              "Heavy-duty cargo bike with large front basket and rear rack for deliveries.",
            image_url:
              "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Business District",
            rating: 4.4,
          },
          {
            id: 11,
            name: "Eco Cruiser Electric",
            category: "Electric",
            price_per_hour: 22,
            description:
              "Eco-friendly electric bike with solar charging capability and efficient motor.",
            image_url:
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Green Plaza",
            rating: 4.6,
          },
          {
            id: 12,
            name: "All-Terrain Hybrid",
            category: "Hybrid",
            price_per_hour: 16,
            description:
              "Versatile hybrid bike suitable for both city streets and light trail riding.",
            image_url:
              "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Adventure Center",
            rating: 4.5,
          },
          {
            id: 13,
            name: "Compact Folder Pro",
            category: "Folding",
            price_per_hour: 16,
            description:
              "Premium folding bike with quick-release mechanisms and travel case included.",
            image_url:
              "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Transit Hub",
            rating: 4.3,
          },
          {
            id: 14,
            name: "Speed Demon",
            category: "Road",
            price_per_hour: 24,
            description:
              "Aerodynamic road bike perfect for racing with professional-grade frame geometry.",
            image_url:
              "https://images.unsplash.com/photo-1517654443271-10d02b8fc268?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Cycling Club",
            rating: 4.7,
          },
          {
            id: 15,
            name: "Tandem Explorer",
            category: "Specialty",
            price_per_hour: 30,
            description:
              "Two-person tandem bike for couples and friends with dual braking system.",
            image_url:
              "https://images.unsplash.com/photo-1553978297-833d24758ffa?auto=format&fit=crop&w=500&q=60",
            available: false,
            location: "Romantic Route",
            rating: 4.8,
          },
          {
            id: 16,
            name: "City Commuter Plus",
            category: "City",
            price_per_hour: 10,
            description:
              "Reliable commuter bike with 7-speed gear system and weather-resistant features.",
            image_url:
              "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Commuter Station",
            rating: 4.2,
          },
          {
            id: 17,
            name: "Alpine Adventure",
            category: "Mountain",
            price_per_hour: 25,
            description:
              "Professional-grade mountain bike with carbon fiber frame and hydraulic disc brakes.",
            image_url:
              "https://images.unsplash.com/photo-1544191696-15693072fc33?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Alpine Station",
            rating: 4.9,
          },
          {
            id: 18,
            name: "Metro Glide",
            category: "City",
            price_per_hour: 11,
            description:
              "Lightweight aluminum frame city bike with puncture-resistant tires.",
            image_url:
              "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=500&q=60",
            available: true,
            location: "Metro Plaza",
            rating: 4.1,
          },
        ];
        setBikes(sampleBikes);
        setFilteredBikes(sampleBikes);
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  useEffect(() => {
    // Ensure bikes is always an array before filtering
    if (!Array.isArray(bikes)) {
      console.warn("Bikes is not an array, setting empty array");
      setFilteredBikes([]);
      return;
    }

    let filtered = bikes;

    if (searchTerm) {
      filtered = filtered.filter(
        (bike) =>
          bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bike.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bike.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((bike) => bike.category === selectedCategory);
    }

    setFilteredBikes(filtered);
  }, [searchTerm, selectedCategory, bikes]);

  const handleRentBike = (bike) => {
    setSelectedBike(bike);
    setRentalDialog(true);
    setRentalError("");
    setRentalSuccess("");
  };

  const handleRentalSubmit = async () => {
    setRentalLoading(true);
    setRentalError("");

    try {
      const token = localStorage.getItem("token");
      const rentalDateTime = new Date(
        `${rentalData.startDate}T${rentalData.startTime}`
      );

      await axios.post(
        "http://localhost:3001/rent",
        {
          bikeId: selectedBike.id,
          rentalDate: rentalDateTime.toISOString(),
          durationHours: rentalData.duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRentalSuccess(
        "Bike rented successfully! Check your dashboard for details."
      );
      setTimeout(() => {
        setRentalDialog(false);
        setRentalSuccess("");
      }, 2000);
    } catch (error) {
      setRentalError(
        error.response?.data?.message ||
          "Failed to rent bike. Please try again."
      );
    } finally {
      setRentalLoading(false);
    }
  };

  const categories = [
    "City",
    "Mountain",
    "Electric",
    "Road",
    "Hybrid",
    "Folding",
    "Cargo",
    "Specialty",
  ];

  const totalCost = selectedBike
    ? selectedBike.price_per_hour * rentalData.duration
    : 0;

  if (loading) {
    return <LoadingSpinner message="Loading available bikes..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "text.primary",
            textAlign: "center",
            mb: 2,
          }}
        >
          Available Bikes
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Choose from our premium collection of bikes for your next adventure
        </Typography>

        {/* Filters */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search bikes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                <FilterListIcon />
                <Typography variant="body2">
                  {filteredBikes.length} bikes found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Bikes Grid */}
      {filteredBikes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <DirectionsBikeIcon
            sx={{ fontSize: "4rem", color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            No bikes found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or check back later.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(filteredBikes) &&
            filteredBikes.map((bike) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={bike.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: theme.shadows[12],
                    },
                    opacity: bike.available ? 1 : 0.7,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={bike.image_url}
                    alt={bike.name}
                    sx={{
                      objectFit: "cover",
                      filter: bike.available ? "none" : "grayscale(50%)",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: "bold",
                          color: "text.primary",
                        }}
                      >
                        {bike.name}
                      </Typography>
                      <Chip
                        label={bike.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {bike.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {bike.location}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AttachMoneyIcon
                          sx={{ fontSize: "1rem", color: "primary.main" }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                          ${bike.price_per_hour}/hr
                        </Typography>
                      </Box>
                      {bike.rating && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Rating value={bike.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({bike.rating})
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                      }}
                    >
                      <SpeedIcon
                        sx={{ fontSize: "1rem", color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {bike.available ? "Available Now" : "Currently Rented"}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!bike.available}
                      onClick={() => handleRentBike(bike)}
                      startIcon={<DirectionsBikeIcon />}
                      sx={{
                        py: 1.5,
                        fontWeight: "bold",
                        background: bike.available
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                          : "none",
                        "&:hover": bike.available
                          ? {
                              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            }
                          : {},
                      }}
                    >
                      {bike.available ? "Rent Now" : "Not Available"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Rental Dialog */}
      <Dialog
        open={rentalDialog}
        onClose={() => setRentalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DirectionsBikeIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Rent {selectedBike?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {rentalError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {rentalError}
            </Alert>
          )}
          {rentalSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {rentalSuccess}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={rentalData.startDate}
                onChange={(e) =>
                  setRentalData({ ...rentalData, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: format(new Date(), "yyyy-MM-dd"),
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={rentalData.startTime}
                onChange={(e) =>
                  setRentalData({ ...rentalData, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                value={rentalData.duration}
                onChange={(e) =>
                  setRentalData({
                    ...rentalData,
                    duration: parseInt(e.target.value) || 1,
                  })
                }
                inputProps={{ min: 1, max: 24 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Rental Summary */}
          <Paper
            sx={{
              p: 3,
              mt: 3,
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Rental Summary
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Bike:</Typography>
              <Typography fontWeight="medium">{selectedBike?.name}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Price per hour:</Typography>
              <Typography fontWeight="medium">
                ${selectedBike?.price_per_hour}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Duration:</Typography>
              <Typography fontWeight="medium">
                {rentalData.duration} hours
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Total Cost:
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "primary.main" }}
              >
                ${totalCost}
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setRentalDialog(false)}
            disabled={rentalLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRentalSubmit}
            variant="contained"
            disabled={rentalLoading}
            sx={{
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {rentalLoading ? "Processing..." : `Confirm Rental ($${totalCost})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BikesPage;
