import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";


const AuthErrorPage = () => {
  const navigate = useNavigate();
  return (
    <Stack
      spacing={2}
      divider={<Divider />}
      sx={{
        pt: 2,
        textAlign: 'center',
        maxWidth: 'sm',
        mx: 'auto'
      }}
    >
      <Typography variant="h6">
        Authentication Error
      </Typography>
      <Box>
        <Typography variant="subtitle1">
          There was an error that occurred during authentication
        </Typography>
        <Typography variant="subtitle2">
          Please try logging in again at a later time
        </Typography>
      </Box>

      <Box>
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
    </Stack>
  );
}

export default AuthErrorPage;