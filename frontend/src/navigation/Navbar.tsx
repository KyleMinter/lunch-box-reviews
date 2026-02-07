import { useNavigate } from 'react-router-dom';
import NavbarMenu from './NavbarMenu';
import Search from '../components/search/Search';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import ReviewsIcon from '@mui/icons-material/Reviews';


const Navbar = () => {
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/');
  }

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="navgiate-to-home"
            onClick={navigateToHome}
          >
            <ReviewsIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Button
              variant='text'
              sx={{ textTransform: 'none' }}
              aria-label="navgiate-to-home"
              onClick={navigateToHome}
            >
              <Typography variant="h6" color="white">
                Lunch Box Reviews
              </Typography>
            </Button>
          </Box>
          <Search />
          <NavbarMenu />
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;