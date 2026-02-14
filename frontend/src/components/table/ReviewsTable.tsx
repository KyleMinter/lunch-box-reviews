import { TableCell, TableRow } from "@mui/material";
import InfiniteTable from "./InfiniteTable";
import { useReviews } from "../../hooks/useFetch";
import { Review } from "@lunch-box-reviews/shared-types";

const ReviewsTable = () => {
  return (
    <InfiniteTable
      useData={useReviews}
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
