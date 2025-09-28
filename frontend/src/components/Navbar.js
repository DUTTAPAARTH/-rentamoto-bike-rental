import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/");
  };

  const isActivePage = (path) => location.pathname === path;

  return (
    <AppBar
      position="static"
      sx={{
        background: `linear-gradient(135deg, ${
          theme.palette.primary.main
        } 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
        boxShadow: theme.shadows[4],
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        {/* Logo and Brand */}
        <DirectionsBikeIcon sx={{ mr: 2, fontSize: "2rem", color: "white" }} />
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            textDecoration: "none",
            color: "white",
            letterSpacing: 1,
            "&:hover": {
              textDecoration: "none",
              opacity: 0.9,
            },
          }}
        >
          RENTAMOTO
        </Typography>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!user ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                variant={isActivePage("/login") ? "outlined" : "text"}
                sx={{
                  borderColor: isActivePage("/login") ? "white" : "transparent",
                  color: "white",
                  fontWeight: "medium",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    borderColor: "white",
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/signup"
                variant={isActivePage("/signup") ? "outlined" : "text"}
                sx={{
                  borderColor: isActivePage("/signup")
                    ? "white"
                    : "transparent",
                  color: "white",
                  fontWeight: "medium",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    borderColor: "white",
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/bikes"
                startIcon={<DirectionsBikeIcon />}
                variant={isActivePage("/bikes") ? "outlined" : "text"}
                sx={{
                  borderColor: isActivePage("/bikes") ? "white" : "transparent",
                  color: "white",
                  fontWeight: "medium",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    borderColor: "white",
                  },
                }}
              >
                Bikes
              </Button>

              {/* User Profile Menu */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{
                  ml: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: "white",
                    width: 36,
                    height: 36,
                    fontSize: "1rem",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  mt: 1,
                  "& .MuiPaper-root": {
                    minWidth: 200,
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.name || user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/dashboard");
                  }}
                  sx={{ py: 1.5 }}
                >
                  <DashboardIcon sx={{ mr: 2, fontSize: "1.2rem" }} />
                  Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/profile");
                  }}
                  sx={{ py: 1.5 }}
                >
                  <AccountCircleIcon sx={{ mr: 2, fontSize: "1.2rem" }} />
                  Profile
                </MenuItem>
                {isAdmin && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate("/admin");
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <AdminPanelSettingsIcon
                      sx={{ mr: 2, fontSize: "1.2rem" }}
                    />
                    Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem
                  onClick={handleLogout}
                  sx={{ py: 1.5, color: "error.main" }}
                >
                  <LogoutIcon sx={{ mr: 2, fontSize: "1.2rem" }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
