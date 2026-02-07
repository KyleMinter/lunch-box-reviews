import { User } from "@lunch-box-reviews/shared-types";
import './userInfo.css';
import { Box, Typography } from "@mui/material";


interface UserInfoProps {
  user: User
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        padding: 1,
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Box sx={{ width: '192px' }}>
        <img src="logo192.png" alt="Profile" />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          paddingX: 5,
          paddingY: 3,
        }}
      >
        <Box sx={{
          borderBottom: 1,
          borderColor: 'divider',
          marginBottom: 1,
          paddingBottom: 1
        }}>
        <Typography variant="h3">
          {user.userName}
        </Typography>
        <Typography variant="subtitle1">
          {user.userEmail}
        </Typography>
        </Box>
        <Typography variant="caption">
          Account Created: 02/07/2026
        </Typography>
      </Box>
    </Box>
  )
}


export default UserInfo;