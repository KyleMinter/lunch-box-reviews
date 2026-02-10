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
import { useEffect, useState } from "react";
import { useReviews } from "../../hooks/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../LoadingSpinner";
import NoResultsFound from "./NoResultsFound";


const ReviewsTable = () => {
  const queryClient = useQueryClient();

  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useReviews(rowsPerPage);

  const page = data?.pages[pageIndex];
  const items = page?.items ?? [];

  useEffect(() => {
    setPageIndex(0);
    queryClient.removeQueries({ queryKey: ['reviews'] });
  }, [rowsPerPage, queryClient]);

  const handleChangePage = async (_event: unknown, newPageIndex: number) => {
    // Only allow forward navigation by 1.
    if (newPageIndex > pageIndex) {
      if (newPageIndex === (data?.pages.length ?? 1) - 1) {
        if (hasNextPage) {
          await fetchNextPage();
        }
      }
      setPageIndex(newPageIndex);
    }

    // Backwards navigation is always safe.
    if (newPageIndex < pageIndex) {
      setPageIndex(newPageIndex);
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="user search results table">
          <TableHead>
            <TableRow>
              <TableCell
                key="foodItem"
                align="left"
                style={{ minWidth: 15 }}
              >
                Item
              </TableCell>
              <TableCell
                key="user"
                align="left"
                style={{ minWidth: 15 }}
              >
                Reviewer
              </TableCell>
              <TableCell
                key="rating"
                align="left"
                style={{ minWidth: 15 }}
              >
                Rating
              </TableCell>
              <TableCell
                key="date"
                align="left"
                style={{ minWidth: 15 }}
              >
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((review) => {
              return (
                <TableRow key={review.entityId}>
                  <TableCell key={`${review.entityId}-food`} align="left">
                    {review.food.foodName}
                  </TableCell>
                  <TableCell key={`${review.entityId}-user`} align="left">
                    {review.user.userName}
                  </TableCell>
                  <TableCell key={`${review.entityId}-rating`} align="left">
                    {review.rating} / 10
                  </TableCell>
                  <TableCell key={`${review.entityId}-date`} align="left">
                    {review.reviewDate}
                  </TableCell>
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
        count={2}
        rowsPerPage={rowsPerPage}
        page={pageIndex}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        slotProps={{
          actions: {
            nextButton: {
              disabled: !hasNextPage && pageIndex === (data?.pages.length ?? 1) - 1
            }
          }
        }}
      />
      {isFetchingNextPage && <LoadingSpinner />}
    </Paper>
  )
}

export default ReviewsTable;