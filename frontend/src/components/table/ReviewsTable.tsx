import { Review } from "@lunch-box-reviews/shared-types";
import { Link } from "react-router-dom";
import './table.css';


interface ReviewsTableProps {
    reviews: Review[]
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews }) => {
    return (
        <table className="table">
            <colgroup>
                <col style={{ width: "24%" }} />
                <col style={{ width: "24%"}} />
                <col style={{ width: "8%"}} />
                <col style={{ width: "8.5%"}} />
                <col style={{ width: "7.5%"}} />
                <col style={{ width: "15%"}} />
                <col style={{ width: "13%"}} />
            </colgroup>
            <thead>
                <tr>
                    <th rowSpan={2} className="table-header-no-left-border">
                        Food Item
                    </th>
                    <th rowSpan={2}>
                        Submitted By
                    </th>
                    <th colSpan={3} className="table-colspan-header">
                        Review Ratings
                    </th>
                    <th colSpan={2} className="table-colspan-header">
                        Menu
                    </th>
                </tr>
                <tr className="table-subheaders">
                    <th>Quality</th>
                    <th>Quantity</th>
                    <th>Overall</th>
                    <th>Location</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {reviews.map((review, index) => {
                    return (
                        <ReviewEntry key={index} review={review} />
                    )
                })}
            </tbody>
        </table>
    )
}

interface ReviewEntryProps {
    review: Review
}

const ReviewEntry: React.FC<ReviewEntryProps> = ({ review }) => {
    return (
        <tr>
            <td>
                <Link to={`/?food=${review.foodID}`}>
                    {review.foodID}
                </Link>
            </td>

            <td>
                <Link to={`/?user=${review.userID}`}>
                    {review.userID}
                </Link>
            </td>

            <td>{review.quality}</td>
            <td>{review.quantity}</td>
            <td>{review.rating}</td>
            
            <td>
                <Link to={`/?menu=${review.menuID}`}>
                    {review.menuID}
                </Link>
            </td>
            
            <td>
                <Link to={`/?menu=${review.menuID}`}>
                    {review.menuID}
                </Link>
            </td>
        </tr>
    )
}

export default ReviewsTable;