import { Box, CircularProgress } from "@mui/material";

const LoadingSpinner = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
      <CircularProgress size={20} />
    </Box>
  );
}

export default LoadingSpinner;