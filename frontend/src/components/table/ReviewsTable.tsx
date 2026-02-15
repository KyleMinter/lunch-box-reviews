import { MenuItem, MenuList, Popover, TableCell, TableRow } from "@mui/material";
import InfiniteTable from "./InfiniteTable";
import { useReviews } from "../../hooks/useFetch";
import { Review } from "@lunch-box-reviews/shared-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


interface ReviewsTableProps {
  useData?: (rowsPerPage: number) => {
    data: any;
    fetchNextPage: () => Promise<any>;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
  };
  noResultsComponent?: React.ReactNode;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({
  useData = useReviews,
  noResultsComponent
}) => {
  return (
    <InfiniteTable
      useData={useData}
      noResultsComponent={noResultsComponent}
      getRowId={(review: Review) => review.entityId}
      columns={[
        { id: "item", label: "Item" },
        { id: "reviewer", label: "Reviewer" },
        { id: "rating", label: "Rating" },
        { id: "date", label: "Date" },
      ]}
      renderRow={(review: Review) => <ReviewRow review={review} />}
    />
  );
};


interface ReviewRowProps {
  review: Review
}

const ReviewRow: React.FC<ReviewRowProps> = ({ review }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleRowClick = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);

  return (
    <>
      <TableRow
        hover
        sx={{ cursor: 'pointer' }}
        onClick={(e) => handleRowClick(e, review)}
      >
        <TableCell>{review.food.foodName}</TableCell>
        <TableCell>{review.user.userName}</TableCell>
        <TableCell>{review.rating} / 10</TableCell>
        <TableCell>{review.reviewDate}</TableCell>
      </TableRow >
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        disableAutoFocus
        disableEnforceFocus
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              navigate(`/food/${review.food.entityId}`);
              handleClose();
            }}
          >
            View Food
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(`/user/${review.user.entityId}`);
              handleClose();
            }}
          >
            View User
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

export default ReviewsTable;
