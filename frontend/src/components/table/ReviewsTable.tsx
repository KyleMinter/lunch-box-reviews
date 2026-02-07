import { Review } from "@lunch-box-reviews/shared-types";
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


interface ReviewsTableProps {
  reviews: Review[]
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
                key="Rating"
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
            {reviews
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((review, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell key={`${index}-food`} align="left">
                      {review.food.foodName}
                    </TableCell>
                    <TableCell key={`${index}-user`} align="left">
                      {review.user.userName}
                    </TableCell>
                    <TableCell key={`${index}-rating`} align="left">
                      {review.rating} / 10
                    </TableCell>
                    <TableCell key={`${index}-date`} align="left">
                      {review.reviewDate}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={2}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default ReviewsTable;