import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";


const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      pt: 2,
      textAlign: 'center',
      borderTop: 1,
      borderColor: 'divider'
    }}>
      <Typography variant="h6">
        Page not found
      </Typography>
      <Typography variant="subtitle1">
        Click the button below to navigate back to the home page
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => navigate('/')}
      >
        Home
      </Button>
    </Box>
  );
}

export default NotFoundPage;