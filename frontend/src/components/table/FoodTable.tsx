import { FoodItem } from "@lunch-box-reviews/shared-types";
import './table.css';


interface FoodTableProps {
    foodItems: FoodItem[]
}

const FoodTable: React.FC<FoodTableProps> = ({ foodItems }) => {
    return (
        <table className="table">
            <colgroup>
                <col style={{ width: "42%" }} />
                <col style={{ width: "42%"}} />
                <col style={{ width: "16%"}} />
            </colgroup>
            <thead>
                <tr>
                    <th className="table-header-no-left-border">
                        Name
                    </th>
                    <th>Origin</th>
                    <th>Average Rating</th>
                </tr>
            </thead>
            <tbody>
                {foodItems.map((food, index) => {
                    return (
                        <FoodEntry key={index} food={food} />
                    )
                })}
            </tbody>
        </table>
    )
}

interface FoodEntryProps {
    food: FoodItem
}

const FoodEntry: React.FC<FoodEntryProps> = ({ food }) => {

    const attributes = food.foodAttributes;    

    return (
        <>
        <tr>
            <td>{food.foodName}</td>
            <td>{food.foodOrigin}</td>
            <td>{food.totalRating / food.numReviews}</td>
            
            
        </tr>
        {
            attributes.description || attributes.nutrition
            ? (
                <tr>
                    <td colSpan={3}>
                        <p className="table-row-subtext">
                            {
                                attributes.description ?
                                attributes.description
                                : ''
                            }
                            <br />
                            {
                                attributes.nutrition ?
                                <span>
                                    {attributes.nutrition}
                                </span>
                                : ''
                            }
                        </p>
                    </td>
                </tr>
            ) :
            null
        }
        </>
    )
}

export default FoodTable;