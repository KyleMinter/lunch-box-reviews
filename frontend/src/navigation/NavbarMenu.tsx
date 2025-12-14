import { useState } from "react";
import { useNavigate } from "react-router-dom"
import useAuth from "../auth/useAuth";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

function NavbarMenu() {
  const { login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (menuItem?: string) => {
    if (menuItem === 'home') {
      navigate('/');
    } else if (menuItem === 'profile') {
      navigate('/profile');
    } else if (menuItem === 'auth') {
      if (!isAuthenticated) {
        login();
      } else {
        logout();
      }
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="navbar-menu-button"
        variant="contained"
        aria-controls={open ? 'navbar-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {open ? <MenuOpenIcon /> : <MenuIcon />}
      </Button>
      <Menu
        id="navbar-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
          paper: {
            style: {
              transform: 'translateY(20px)'
            }
          }
        }}
      >
        <MenuItem onClick={() => handleClose('home')}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText>Home</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleClose('profile')}>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleClose('auth')}>
          <ListItemIcon>
            {!isAuthenticated ? <LoginIcon /> : <LogoutIcon />}
          </ListItemIcon>
          <ListItemText>
            {!isAuthenticated ? 'Login' : 'Logout'}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default NavbarMenu;