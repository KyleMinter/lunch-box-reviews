import { User } from "@lunch-box-reviews/shared-types";
import UserInfo from "./UserInfo/UserInfo";
import '../Pages.css';


interface UserPageProps {
    user: User
}

const UserPage: React.FC<UserPageProps> = ({ user }) => {

    return (
        <div className="page-layout">
            <UserInfo user={user}/>
            <div>
                more user content
            </div>
        </div>
    )
}

export default UserPage;