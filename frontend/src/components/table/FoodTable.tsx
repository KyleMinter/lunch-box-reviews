import { TableCell, TableRow, Typography } from "@mui/material";
import { useFoodItems } from "../../hooks/useFetch";
import InfiniteTable from "./InfiniteTable";
import { FoodItem } from "@lunch-box-reviews/shared-types";
import { useNavigate } from "react-router-dom";


const FoodTable = () => {
  const navigate = useNavigate();

  return (
    <InfiniteTable
      useData={useFoodItems}
      getRowId={(food: FoodItem) => food.entityId}
      columns={[
        { id: "name", label: "Name" },
        { id: "origin", label: "Location" },
        { id: "rating", label: "Average Rating" },
      ]}
      renderRow={(food: FoodItem) => {
        const { description, nutrition } = food.foodAttributes
        return (
          <>
            <TableRow
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
                "&:hover + tr td": {
                  outline: "1px solid",
                  outlineColor: "grey.300",
                  outlineOffset: -2,
                  backgroundColor: "inherit",
                },
              }}
              onClick={() => {
                navigate(`/food/${food.entityId}`)
              }}
            >
              <TableCell>{food.foodName}</TableCell>
              <TableCell>{food.foodOrigin}</TableCell>
              <TableCell>
                {food.totalRating / food.numReviews}
              </TableCell>
            </TableRow>

            {(description || nutrition) && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                    {description}
                    {description && nutrition && <br />}
                    {nutrition}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </>
        )
      }}
    />
  )
}

export default FoodTable;
