import { Box, Collapse, IconButton, TableCell, TableRow, Typography } from "@mui/material";
import { useFoodItems } from "../../hooks/useFetch";
import InfiniteTable from "./InfiniteTable";
import { FoodItem } from "@lunch-box-reviews/shared-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


const FoodTable = () => {
  return (
    <InfiniteTable
      useData={useFoodItems}
      getRowId={(food: FoodItem) => food.entityId}
      columns={[
        { id: "", label: "" },
        { id: "name", label: "Name" },
        { id: "origin", label: "Location" },
        { id: "rating", label: "Average Rating" },
      ]}
      renderRow={(food: FoodItem) => (
        <FoodRow food={food} />
      )}
    />
  )
}

interface FoodRowProps {
  food: FoodItem
}

const FoodRow: React.FC<FoodRowProps> = ({ food }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { description, nutrition } = food.foodAttributes
  const hasExtraContent = Boolean(description || nutrition);

  return (
    <>
      <TableRow
        hover
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          navigate(`/food/${food.entityId}`)
        }}
      >
        <TableCell width={48} sx={{ p: 0, textAlign: 'center' }}>
          {hasExtraContent ? (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open)
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          ) : (
            <Box sx={{ height: 24 }} />
          )}
        </TableCell>
        <TableCell>{food.foodName}</TableCell>
        <TableCell>{food.foodOrigin}</TableCell>
        <TableCell>
          {food.totalRating / food.numReviews}
        </TableCell>
      </TableRow>

      {hasExtraContent && (
        <TableRow>
          <TableCell 
            colSpan={4}
            sx={{
              py: 0,
              px: 0,
              borderBottom: open ? undefined : 0
            }}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{
                px: 2,
                py: 2,
                bgcolor: 'grey.50',
                borderLeft: 3,
                borderColor: 'grey.300'
              }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  {description}
                  {description && nutrition && <br />}
                  {nutrition}
                </Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default FoodTable;