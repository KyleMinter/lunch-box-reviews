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
import { useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import NoResultsFound from "./NoResultsFound";
import { useFoodItems } from "../../hooks/useFetch";


const FoodTable = () => {
  const queryClient = useQueryClient();

  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useFoodItems(rowsPerPage);

  const page = data?.pages[pageIndex];
  const items = page?.items ?? [];

  useEffect(() => {
      setPageIndex(0);
      queryClient.removeQueries({ queryKey: ['foods'] });
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
                key="foodName"
                align="left"
                style={{ minWidth: 15 }}
              >
                Name
              </TableCell>
              <TableCell
                key="foodOrigin"
                align="left"
                style={{ minWidth: 15 }}
              >
                Location
              </TableCell>
              <TableCell
                key="averageRating"
                align="left"
                style={{ minWidth: 15 }}
              >
                Average Rating
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((food) => {
              return (
                <Fragment key={food.entityId}>
                  <TableRow>
                    <TableCell key={`${food.entityId}-name`} align="left">
                      {food.foodName}
                    </TableCell>
                    <TableCell key={`${food.entityId}-origin`} align="left">
                      {food.foodOrigin}
                    </TableCell>
                    <TableCell key={`${food.entityId}-averageRating`} align="left">
                      {food.totalRating / food.numReviews}
                    </TableCell>
                  </TableRow>
                  {(food.foodAttributes.description || food.foodAttributes.nutrition) && (
                    <TableRow>
                      <TableCell key={`${food.entityId}-attributes`} align="left" colSpan={3}>
                        <Box sx={{ pl: 2 }}>
                          {food.foodAttributes.description && (
                            <Typography key={`${food.entityId}-description`} variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                              {food.foodAttributes.description}
                            </Typography>
                          )}
                          {food.foodAttributes.nutrition && (
                            <Typography key={`${food.entityId}-nutrition`} variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                              {food.foodAttributes.nutrition}
                            </Typography>
                          )}
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

export default FoodTable;