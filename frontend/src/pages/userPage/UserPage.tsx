import UserInfo from "./UserInfo";
import { Box, Typography } from "@mui/material";
import ReviewsTable from "../../components/table/ReviewsTable";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useReviewsFromUser, useUser } from "../../hooks/useFetch";


interface UserPageProps {
  userId?: string
}

const UserPage: React.FC<UserPageProps> = ({ userId: loggedInUserId }) => {
  const params = useParams<{ userId: string }>();
  const userId = params.userId ?? loggedInUserId;
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Box sx={{
        mt: 5,
        mx: { xs: 1, md: "auto" },
        maxWidth: 950,
        textAlign: 'center'
      }}>
        <Typography variant="h6">
          Error
        </Typography>
        <Typography variant="subtitle1">
          This user does not exist
        </Typography>
      </Box>
    )
  }

  const useUserReviews = (rowsPerPage: number) =>
    useReviewsFromUser(user.entityId, rowsPerPage);

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
        <ReviewsTable
          useData={useUserReviews}
          noResultsComponent={
            <Box>
              <Typography variant="body1">
                No results found
              </Typography>
              <Typography variant="body2">
                This user has not submitted any reviews
              </Typography>
            </Box>
          }
        />
      </Box>
    </Box>
  )
}

export default UserPage;