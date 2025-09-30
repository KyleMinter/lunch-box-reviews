import { User } from "@lunch-box-reviews/shared-types";
import { useNavigate } from "react-router-dom";
import './table.css';


interface UsersTableProps {
    users: User[]
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
    return (
        <table className="table">
            <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "46%"}} />
                <col style={{ width: "46%"}} />
            </colgroup>
            <thead>
                <tr>
                    <th/>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => {
                    return (
                        <UserEntry user={user} />
                    )
                })}
            </tbody>
        </table>
    )
}

interface UserEntryProps {
    user: User
}

const UserEntry: React.FC<UserEntryProps> = ({ user }) => {
    const navigate = useNavigate();

    const onRowClick = () => {
        navigate(`/home?row=${user.entityID}`);
    };

    const userPictureStyle = {
        display: 'block',
        width: '75%',
        clipPath: 'circle()',
        margin: '8px'
    }

    return (
        <tr className="table-row" onClick={onRowClick}>
            <td><img style={userPictureStyle} src="logo192.png" alt="" /></td>
            <td>{user.userName}</td>
            <td>{user.userEmail}</td>
        </tr>
    )
}

export default UsersTable;