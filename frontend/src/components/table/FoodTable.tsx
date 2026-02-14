import { TableCell, TableRow } from "@mui/material";
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
      renderRow={(food: FoodItem) => (
        <>
          <TableRow>
            <TableCell>{food.foodName}</TableCell>
            <TableCell>{food.foodOrigin}</TableCell>
            <TableCell>
              {food.totalRating / food.numReviews}
            </TableCell>
          </TableRow>

          {(food.foodAttributes.description || food.foodAttributes.nutrition) && (
            <TableRow>
              <TableCell colSpan={3}>
                {food.foodAttributes.description}
                {food.foodAttributes.nutrition}
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    />
  )
}

export default FoodTable;
