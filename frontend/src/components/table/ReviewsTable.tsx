import { Box, IconButton, MenuItem, MenuList, Popover, TableCell, TableRow } from "@mui/material";
import InfiniteTable from "./InfiniteTable";
import { useDeleteReview, useReviews } from "../../hooks/api/useReviewsApi";
import { Review } from "@lunch-box-reviews/shared-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatDateISO } from "../../utils/utils";
import DeleteIcon from '@mui/icons-material/Delete';


interface ReviewsTableProps {
  useData?: (rowsPerPage: number) => {
    data: any;
    fetchNextPage: () => Promise<any>;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
  };
  noResultsComponent?: React.ReactNode;
  loggedInUserId?: string;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({
  useData = useReviews,
  noResultsComponent,
  loggedInUserId
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
        { id: "action", label: "" }
      ]}
      renderRow={(review: Review) => (
        <ReviewRow
          review={review}
          loggedInUserId={loggedInUserId}
        />
      )}
    />
  );
};


interface ReviewRowProps {
  review: Review;
  loggedInUserId?: string;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ review, loggedInUserId }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const deleteReview = useDeleteReview();

  const handleRowClick = (event: React.MouseEvent<HTMLElement>, review: Review) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteReview.mutate(review.entityId)
  }

  const open = Boolean(anchorEl);
  const isOwnReview = loggedInUserId === review.user.entityId;

  const formattedDate = formatDateISO(review.reviewDate);

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
        <TableCell>{formattedDate}</TableCell>
        <TableCell width={48} sx={{ p: 0, pr: 3, textAlign: 'center' }}>
          {isOwnReview ? (
            <IconButton
              aria-label="delete"
              size="small"
              onClick={handleDelete}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          ): (
            <Box sx={{ height: 24 }} />
          )}
        </TableCell>
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
