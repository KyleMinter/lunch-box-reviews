import { FoodItem } from "@lunch-box-reviews/shared-types";
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
import { Fragment, useState } from "react";


interface FoodTableProps {
  foodItems: FoodItem[]
}

const FoodTable: React.FC<FoodTableProps> = ({ foodItems }) => {
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
            {foodItems
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((food, index) => {
                return (
                  <Fragment key={index}>
                    <TableRow>
                      <TableCell key={`${index}-name`} align="left">
                        {food.foodName}
                      </TableCell>
                      <TableCell key={`${index}-origin`} align="left">
                        {food.foodOrigin}
                      </TableCell>
                      <TableCell key={`${index}-averageRating`} align="left">
                        {food.totalRating / food.numReviews}
                      </TableCell>
                    </TableRow>
                    {(food.foodAttributes.description || food.foodAttributes.nutrition) && (
                      <TableRow>
                        <TableCell key={`${index}-attributes`} align="left" colSpan={3}>
                          <Box sx={{ pl: 2 }}>
                            {food.foodAttributes.description && (
                              <Typography key={`${index}-description`} variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                {food.foodAttributes.description}
                              </Typography>
                            )}
                            {food.foodAttributes.nutrition && (
                              <Typography key={`${index}-nutrition`} variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
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

export default FoodTable;