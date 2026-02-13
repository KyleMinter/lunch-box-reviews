import { useState } from "react";
import { 
  Avatar,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import LoadingSpinner from "../LoadingSpinner";
import NoResultsFound from "./NoResultsFound";
import { useUsers } from "../../hooks/useFetch";


const UsersTable = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useUsers(rowsPerPage);

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
              <TableCell style={{
                minWidth: 15,
                paddingLeft: 72
              }}>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Account Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((user) => {
              return (
                <TableRow key={user.entityId}>
                  <TableCell>
                    <CardHeader
                      avatar={<Avatar alt={`${user.userName}`} src="logo192.png" />}
                      title={user.userName}
                      sx={{ p: 0, textAlign: 'left' }}
                    />
                  </TableCell>
                  <TableCell>{user.userEmail}</TableCell>
                  <TableCell>{user.created}</TableCell>
                </TableRow>
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

export default UsersTable;