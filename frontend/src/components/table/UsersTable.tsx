import { User } from "@lunch-box-reviews/shared-types";
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


interface UsersTableProps {
  users: User[]
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
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
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell key={`${index}-avatar-name`} align="center">
                      <CardHeader
                        avatar={<Avatar alt={`${user.userName}`} src="logo192.png" />}
                        title={user.userName}
                        sx={{ p: 0, textAlign: 'left' }}
                      />
                    </TableCell>
                    <TableCell key={`${index}-email`} align="left">
                      {user.userEmail}
                    </TableCell>
                    <TableCell key={`${index}-accountCreated`} align="left">
                      {user.accountCreated}
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

export default UsersTable;