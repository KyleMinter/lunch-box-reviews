import { EntityType, FoodItem, Review, User } from '@lunch-box-reviews/shared-types';
import UsersTable from '../../components/table/UsersTable';
import ReviewsTable from '../../components/table/ReviewsTable';
import FoodTable from '../../components/table/FoodTable';
import { Box, Typography } from '@mui/material';
import useSearchFilters from '../../hooks/useSearchFilters';


const SearchPage = () => {
  const { searchFilters } = useSearchFilters();

  const Table = () => {
    switch (searchFilters.entityType) {
      case EntityType.Review:
        return <ReviewsTable />;
      case EntityType.User:
        return <UsersTable />;
      case EntityType.FoodItem:
        return <FoodTable />;
    }
  };

  return (
    <Box sx={{
      mx: 'auto',
      maxWidth: 950
    }}>
      <Box sx={{
        pt: 3,
        pb: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h4">
          Search Results
        </Typography>
      </Box>
      <Table />
    </Box>
  )
}

export default SearchPage;