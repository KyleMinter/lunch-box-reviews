import {
  Avatar,
  CardHeader,
  TableCell,
  TableRow,
} from "@mui/material";
import InfiniteTable from "./InfiniteTable";
import { useUsers } from "../../hooks/useFetch";
import { User } from "@auth0/auth0-react";

const UsersTable = () => {
  return (
    <InfiniteTable
      useData={useUsers}
      getRowId={(user: User) => user.entityId}
      columns={[
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "created", label: "Account Created" },
      ]}
      renderRow={(user: User) => (
        <TableRow>
          <TableCell
            sx={{
              minWidth: 15,
              paddingLeft: 9, // roughly equivalent to 72px spacing
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  alt={user.userName}
                  src="logo192.png"
                />
              }
              title={user.userName}
              sx={{ p: 0, textAlign: "left" }}
            />
          </TableCell>

          <TableCell>{user.userEmail}</TableCell>

          <TableCell>{user.created}</TableCell>
        </TableRow>
      )}
    />
  );
};

export default UsersTable;
