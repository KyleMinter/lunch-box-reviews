import { useEffect, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../LoadingSpinner";
import NoResultsFound from "./NoResultsFound";
import { useUsers } from "../../hooks/useFetch";


const UsersTable = () => {
  const queryClient = useQueryClient();

  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useUsers(rowsPerPage);

  const page = data?.pages[pageIndex];
  const items = page?.items ?? [];

  useEffect(() => {
    setPageIndex(0);
    queryClient.removeQueries({ queryKey: ['users'] });
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
                key="userAvatarName"
                align="left"
                style={{ minWidth: 15, paddingLeft: 72 }}
              >
                Name
              </TableCell>
              <TableCell
                key="userEmail"
                align="left"
                style={{ minWidth: 15 }}
              >
                Email
              </TableCell>
              <TableCell
                key="accountCreated"
                align="left"
                style={{ minWidth: 15 }}
              >
                Account Created
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((user) => {
              return (
                <TableRow key={user.entityId}>
                  <TableCell key={`${user.entityId}-avatar-name`} align="center">
                    <CardHeader
                      avatar={<Avatar alt={`${user.userName}`} src="logo192.png" />}
                      title={user.userName}
                      sx={{ p: 0, textAlign: 'left' }}
                    />
                  </TableCell>
                  <TableCell key={`${user.entityId}-email`} align="left">
                    {user.userEmail}
                  </TableCell>
                  <TableCell key={`${user.entityId}-created`} align="left">
                    {user.created}
                  </TableCell>
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

export default UsersTable;