import { EntityType, FoodItem, Review, User } from '@lunch-box-reviews/shared-types';
import UsersTable from '../../components/table/UsersTable';
import ReviewsTable from '../../components/table/ReviewsTable';
import FoodTable from '../../components/table/FoodTable';
import useSearchResults from '../../hooks/useSearchResults';
import { Box, Typography } from '@mui/material';


const SearchPage = () => {
  const { searchResults } = useSearchResults();

  const Table = () => {
    switch (searchResults && searchResults[0].entityType) {
      case EntityType.Review:
        return <ReviewsTable reviews={searchResults as Review[]} />;
      case EntityType.User:
        return <UsersTable users={searchResults as User[]} />;
      case EntityType.FoodItem:
        return <FoodTable foodItems={searchResults as FoodItem[]} />;
    }

    return (
      <Box sx={{
        pt: 2,
        textAlign: 'center',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6">
          No results found
        </Typography>
        <Typography variant="subtitle1">
          Adjust your selected filters for more results
        </Typography>
      </Box>
    );
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