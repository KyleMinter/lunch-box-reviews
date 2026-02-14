import { TableCell, TableRow, Typography } from "@mui/material";
import { useFoodItems } from "../../hooks/useFetch";
import InfiniteTable from "./InfiniteTable";
import { FoodItem } from "@lunch-box-reviews/shared-types";


const FoodTable = () => {
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
            <TableRow>
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
