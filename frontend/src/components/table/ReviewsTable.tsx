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
                key="qualityRating"
                align="left"
                style={{ minWidth: 15 }}
              >
                Quality Rating
              </TableCell>
              <TableCell
                key="quantityRating"
                align="left"
                style={{ minWidth: 15 }}
              >
                Quantity Rating
              </TableCell>
              <TableCell
                key="overallRating"
                align="left"
                style={{ minWidth: 15 }}
              >
                Overall Rating
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
                      {review.foodID}
                    </TableCell>
                    <TableCell key={`${index}-user`} align="left">
                      {review.userID}
                    </TableCell>
                    <TableCell key={`${index}-quality`} align="left">
                      {review.quality}
                    </TableCell>
                    <TableCell key={`${index}-quantity`} align="left">
                      {review.quantity}
                    </TableCell>
                    <TableCell key={`${index}-overall`} align="left">
                      {review.rating}
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