import { FoodItem } from '@lunch-box-reviews/shared-types';
import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

interface FoodInfoProps {
  food: FoodItem;
}

const FoodInfo: React.FC<FoodInfoProps> = ({ food }) => {
  const { description, nutrition } = food.foodAttributes;
  const averageRating = food.numReviews > 0
    ? food.totalRating / food.numReviews : null;

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        spacing={1}
        justifyContent="center"
        divider={<Divider />}
        sx={{ flex: 1, width: '100%' }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h3">{food.foodName}</Typography>
            <Typography variant="subtitle1">{food.foodOrigin}</Typography>
          </Box>
          {averageRating !== null && (
            <Typography
              variant="h5"
              color="primary"
              sx={{ ml: 2 }}
            >
              {averageRating.toFixed(2)}
            </Typography>
          )}
        </Box>

        {(description || nutrition) && (
          <Box>
            {description && (
              <Box >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textDecoration: 'underline' }}
                >
                  Description:
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  {description}
                </Typography>
              </Box>
            )}
            {nutrition && (
              <Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textDecoration: 'underline' }}
                >
                  Nutrition:
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  {nutrition}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default FoodInfo;
