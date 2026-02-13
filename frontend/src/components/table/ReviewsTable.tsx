import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import { useReviews } from "../../hooks/useFetch";
import LoadingSpinner from "../LoadingSpinner";
import NoResultsFound from "./NoResultsFound";


const ReviewsTable = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useReviews(rowsPerPage);

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
              <TableCell>Item</TableCell>
              <TableCell>Reviewer</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((review) => {
              return (
                <TableRow key={review.entityId}>
                  <TableCell>{review.food.foodName}</TableCell>
                  <TableCell>{review.user.userName}</TableCell>
                  <TableCell>{review.rating} / 10</TableCell>
                  <TableCell>{review.reviewDate}</TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
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

export default ReviewsTable;