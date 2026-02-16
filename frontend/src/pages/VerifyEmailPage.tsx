import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";


const VerifyEmailPage = () => {
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
        Verify Email
      </Typography>
      <Box>
        <Typography variant="subtitle1">
          Email verification required
        </Typography>
        <Typography variant="subtitle2">
          You must verify your email before logging in
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

export default VerifyEmailPage;