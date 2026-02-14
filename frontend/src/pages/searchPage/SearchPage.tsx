import { EntityType } from '@lunch-box-reviews/shared-types';
import UsersTable from '../../components/table/UsersTable';
import ReviewsTable from '../../components/table/ReviewsTable';
import FoodTable from '../../components/table/FoodTable';
import { Box, Typography } from '@mui/material';
import useSearchState from '../../hooks/useSearchState';


const SearchPage = () => {
  const { searchFilters } = useSearchState();

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
      mt: 3,
      mx: 'auto',
      maxWidth: 950
    }}>
      <Box sx={{
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