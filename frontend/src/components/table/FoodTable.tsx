import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { Fragment,  useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import NoResultsFound from "./NoResultsFound";
import { useFoodItems } from "../../hooks/useFetch";


const FoodTable = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useFoodItems(rowsPerPage);

  const items = data?.pages.flatMap(page => page.items) ?? [];

  const handleNext = async () => {
    if (hasNextPage) {
      await fetchNextPage();
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="user search results table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Average Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((food) => {
              return (
                <Fragment key={food.entityId}>
                  <TableRow>
                    <TableCell>{food.foodName}</TableCell>
                    <TableCell>{food.foodOrigin}</TableCell>
                    <TableCell>{food.totalRating / food.numReviews}</TableCell>
                  </TableRow>
                  {(food.foodAttributes.description || food.foodAttributes.nutrition) && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                            {food.foodAttributes.description && (food.foodAttributes.description)}
                            {food.foodAttributes.description && food.foodAttributes.nutrition && (<br />)}
                            {food.foodAttributes.nutrition && (food.foodAttributes.nutrition)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <NoResultsFound />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={-1}
        rowsPerPage={rowsPerPage}
        page={0}
        onPageChange={handleNext}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
        }}
        labelDisplayedRows={({ from, to}) => `Items: ${from}-${to}`}
        slotProps={{
          actions: {
            nextButton: {
              disabled: !hasNextPage
            }
          }
        }}
      />
      {isFetchingNextPage && <LoadingSpinner />}
    </Paper>
  )
}

export default FoodTable;