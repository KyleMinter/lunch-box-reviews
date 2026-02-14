import { User } from '@lunch-box-reviews/shared-types';
import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface UserInfoProps {
  user: User;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'center', md: 'stretch' }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: 192 },
            display: 'flex',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            alt={user.userName}
            src={user.userPicture}
            sx={{ maxWidth: '100%', height: 'auto' }}
          />
        </Box>
        <Divider
          orientation={isMdUp ? 'vertical' : 'horizontal'}
          flexItem
          sx={{
            mx: isMdUp ? 2 : 0,
            my: isMdUp ? 0 : 1,
          }}
        />
        <Stack
          spacing={1}
          justifyContent="center"
          divider={<Divider />}
          sx={{ flex: 1, width: '100%' }}
        >
          <Box>
            <Typography variant="h3">{user.userName}</Typography>
            <Typography variant="subtitle1">{user.userEmail}</Typography>
          </Box>

          <Typography variant="caption">
            Account Created: {user.created}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default UserInfo;
