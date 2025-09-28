import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  alpha,
  Tab,
  Tabs,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [bikes, setBikes] = useState([]);
  const [users, setUsers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bikeDialog, setBikeDialog] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [bikeData, setBikeData] = useState({
    name: "",
    category: "",
    price_per_hour: "",
    description: "",
    image_url: "",
    location: "",
    available: true,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, bikesRes, usersRes, rentalsRes] = await Promise.all([
        axios.get("http://localhost:3001/revenue", { headers }),
        axios.get("http://localhost:3001/bikes", { headers }),
        axios.get("http://localhost:3001/bookings/users", { headers }),
        axios.get("http://localhost:3001/bookings", { headers }),
      ]);

      setStats(statsRes.data);
      setBikes(bikesRes.data);
      setUsers(usersRes.data);
      setRentals(rentalsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // Set demo data
      setStats({
        totalBikes: 15,
        totalUsers: 234,
        totalRentals: 456,
        totalRevenue: 12450,
      });
      setBikes([
        {
          id: 1,
          name: "City Cruiser Pro",
          category: "City",
          price_per_hour: 12,
          available: true,
          location: "Downtown",
        },
      ]);
      setUsers([
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          is_admin: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setRentals([
        {
          id: 1,
          user_name: "John Doe",
          bike_name: "City Cruiser Pro",
          rental_date: new Date().toISOString(),
          total_price: 48,
          status: "completed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBikeSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = editingBike
        ? `http://localhost:3001/bikes/${editingBike.id}`
        : "http://localhost:3001/bikes";

      const method = editingBike ? "put" : "post";

      await axios[method](url, bikeData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`Bike ${editingBike ? "updated" : "added"} successfully!`);
      setBikeDialog(false);
      fetchAdminData();
      resetBikeForm();
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteBike = async (bikeId) => {
    if (!window.confirm("Are you sure you want to delete this bike?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/bikes/${bikeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Bike deleted successfully!");
      fetchAdminData();
    } catch (error) {
      setError(error.response?.data?.message || "Delete failed");
    }
  };

  const resetBikeForm = () => {
    setBikeData({
      name: "",
      category: "",
      price_per_hour: "",
      description: "",
      image_url: "",
      location: "",
      available: true,
    });
    setEditingBike(null);
  };

  const openBikeDialog = (bike = null) => {
    if (bike) {
      setEditingBike(bike);
      setBikeData({ ...bike });
    } else {
      resetBikeForm();
    }
    setBikeDialog(true);
    setMessage("");
    setError("");
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  const statCards = [
    {
      title: "Total Bikes",
      value: stats?.totalBikes || 0,
      icon: (
        <DirectionsBikeIcon
          sx={{ fontSize: "2.5rem", color: "primary.main" }}
        />
      ),
      color: "primary",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <PeopleIcon sx={{ fontSize: "2.5rem", color: "success.main" }} />,
      color: "success",
    },
    {
      title: "Total Rentals",
      value: stats?.totalRentals || 0,
      icon: (
        <TrendingUpIcon sx={{ fontSize: "2.5rem", color: "warning.main" }} />
      ),
      color: "warning",
    },
    {
      title: "Revenue",
      value: `$${stats?.totalRevenue || 0}`,
      icon: (
        <AttachMoneyIcon sx={{ fontSize: "2.5rem", color: "error.main" }} />
      ),
      color: "error",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        Admin Dashboard
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                p: 3,
                textAlign: "center",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette[stat.color].main,
                  0.1
                )} 0%, ${alpha(theme.palette[stat.color].main, 0.05)} 100%)`,
                border: `1px solid ${alpha(
                  theme.palette[stat.color].main,
                  0.2
                )}`,
              }}
            >
              <Box sx={{ mb: 2 }}>{stat.icon}</Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", mb: 1, color: `${stat.color}.main` }}
              >
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {stat.title}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Bikes Management" />
          <Tab label="Users" />
          <Tab label="Rentals" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Bikes Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openBikeDialog()}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                Add Bike
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price/Hour</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bikes.map((bike) => (
                    <TableRow key={bike.id}>
                      <TableCell>{bike.name}</TableCell>
                      <TableCell>{bike.category}</TableCell>
                      <TableCell>${bike.price_per_hour}</TableCell>
                      <TableCell>{bike.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={bike.available ? "Available" : "Rented"}
                          color={bike.available ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => openBikeDialog(bike)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteBike(bike.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
              Users Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Member Since</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_admin ? "Admin" : "User"}
                          color={user.is_admin ? "primary" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "PPP")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
              Recent Rentals
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Bike</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell>{rental.user_name}</TableCell>
                      <TableCell>{rental.bike_name}</TableCell>
                      <TableCell>
                        {format(new Date(rental.rental_date), "PPP")}
                      </TableCell>
                      <TableCell>${rental.total_price}</TableCell>
                      <TableCell>
                        <Chip
                          label={rental.status}
                          color={
                            rental.status === "completed"
                              ? "success"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Bike Dialog */}
      <Dialog
        open={bikeDialog}
        onClose={() => setBikeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingBike ? "Edit Bike" : "Add New Bike"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bike Name"
                value={bikeData.name}
                onChange={(e) =>
                  setBikeData({ ...bikeData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={bikeData.category}
                  label="Category"
                  onChange={(e) =>
                    setBikeData({ ...bikeData, category: e.target.value })
                  }
                >
                  <MenuItem value="City">City</MenuItem>
                  <MenuItem value="Mountain">Mountain</MenuItem>
                  <MenuItem value="Electric">Electric</MenuItem>
                  <MenuItem value="Road">Road</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Hour"
                type="number"
                value={bikeData.price_per_hour}
                onChange={(e) =>
                  setBikeData({ ...bikeData, price_per_hour: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={bikeData.description}
                onChange={(e) =>
                  setBikeData({ ...bikeData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={bikeData.image_url}
                onChange={(e) =>
                  setBikeData({ ...bikeData, image_url: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={bikeData.location}
                onChange={(e) =>
                  setBikeData({ ...bikeData, location: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBikeDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBikeSubmit}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {editingBike ? "Update" : "Add"} Bike
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
