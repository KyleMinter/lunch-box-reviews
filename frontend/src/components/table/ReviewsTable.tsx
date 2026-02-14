import { TableCell, TableRow } from "@mui/material";
import InfiniteTable from "./InfiniteTable";
import { useReviews } from "../../hooks/useFetch";
import { Review } from "@lunch-box-reviews/shared-types";


interface ReviewsTableProps {
  useData?: (rowsPerPage: number) => {
    data: any;
    fetchNextPage: () => Promise<any>;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
  }
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({
  useData = useReviews
}) => {
  return (
    <InfiniteTable
      useData={useData}
      getRowId={(review: Review) => review.entityId}
      columns={[
        { id: "item", label: "Item" },
        { id: "reviewer", label: "Reviewer" },
        { id: "rating", label: "Rating" },
        { id: "date", label: "Date" },
      ]}
      renderRow={(review: Review) => (
        <TableRow>
          <TableCell>{review.food.foodName}</TableCell>
          <TableCell>{review.user.userName}</TableCell>
          <TableCell>{review.rating} / 10</TableCell>
          <TableCell>{review.reviewDate}</TableCell>
        </TableRow>
      )}
    />
  );
};

export default ReviewsTable;
