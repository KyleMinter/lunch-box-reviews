import { Fragment, useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import NoResultsFound from "./NoResultsFound";

interface InfiniteTableProps<T> {
  useData: (rowsPerPage: number) => {
    data: any;
    fetchNextPage: () => Promise<any>;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
  };
  columns: { id: string; label: string }[];
  getRowId: (row: T) => string | number;
  renderRow: (row: T) => React.ReactNode;
};

function InfiniteTable<T>({
  useData,
  columns,
  getRowId,
  renderRow,
}: InfiniteTableProps<T>) {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useData(rowsPerPage);

  const items: T[] = data?.pages.flatMap((p: any) => p.items) ?? [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.id}>{c.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => (
              <Fragment key={getRowId(item)}>
                {renderRow(item)}
              </Fragment>
            ))}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
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
        onPageChange={async () => {
          if (hasNextPage) await fetchNextPage();
        }}
        onRowsPerPageChange={(e) =>
          setRowsPerPage(Number(e.target.value))
        }
        labelDisplayedRows={({ from, to}) => `Items: ${from}-${to}`}
        slotProps={{
          actions: {
            nextButton: { disabled: !hasNextPage },
          },
        }}
      />

      {isFetchingNextPage && <LoadingSpinner />}
    </Paper>
  );
}

export default InfiniteTable;