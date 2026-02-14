import { User } from "@lunch-box-reviews/shared-types";
import UserInfo from "./UserInfo";
import { Box, Typography } from "@mui/material";
import ReviewsTable from "../../components/table/ReviewsTable";


interface UserPageProps {
  user: User
}

const UserPage: React.FC<UserPageProps> = ({ user }) => {

  return (
    <Box sx={{
      mt: 5,
      mx: { xs: 1, md: "auto" },
      maxWidth: 950
    }}>
      <UserInfo user={user} />
      <Box sx={{
        mt: 3,
      }}>
        <Box sx={{
          pb: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h5">
            User's Reviews
          </Typography>
        </Box>
        <ReviewsTable />
      </Box>
    </Box>
  )
}

export default UserPage;