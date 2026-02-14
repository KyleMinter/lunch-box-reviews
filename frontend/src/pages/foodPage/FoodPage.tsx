import { EntityType, FoodItem } from "@lunch-box-reviews/shared-types";
import { Box, Typography } from "@mui/material";
import ReviewsTable from "../../components/table/ReviewsTable";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useFood, useReviewsFromFood } from "../../hooks/useFetch";
import FoodInfo from "./FoodInfo";


interface FoodPageProps {
  food?: FoodItem
}

const FoodPage: React.FC<FoodPageProps> = ({ food: initialFood }) => {
  const { foodId } = useParams<{ foodId: string }>();
  const { data: fetchedFood, isLoading } = useFood(
    initialFood ? undefined : foodId
  );

  const food = initialFood ?? fetchedFood;

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!food) {
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
          This food does not exist
        </Typography>
      </Box>
    )
  }

  const useFoodReviews = (rowsPerPage: number) =>
    useReviewsFromFood(food.entityId, rowsPerPage);

  return (
    <Box sx={{
      mt: 5,
      mx: { xs: 1, md: "auto" },
      maxWidth: 950
    }}>
      <FoodInfo food={food} />
      <Box sx={{
        mt: 3,
      }}>
        <Box sx={{
          pb: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h5">
            Food Reviews
          </Typography>
        </Box>
        <ReviewsTable
          useData={useFoodReviews}
          noResultsComponent={
            <Box>
              <Typography variant="body1">
                No results found
              </Typography>
              <Typography variant="body2">
                No reviews have been submitted for this food
              </Typography>
            </Box>
          }
        />
      </Box>
    </Box>
  )
}

export default FoodPage;