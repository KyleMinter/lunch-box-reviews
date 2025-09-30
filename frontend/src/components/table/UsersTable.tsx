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
                    <th className="table-header-no-left-border" style={{ paddingLeft: 0 }} />
                    <th className="table-header-no-left-border">
                        Name
                    </th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, index) => {
                    return (
                        <UserEntry key={index} user={user} />
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
        <tr
            className="table-row-hover"
            onClick={onRowClick}
        >
            <td style={{ paddingLeft: 0 }}>
                <img style={userPictureStyle} src="logo192.png" alt="" />
            </td>
            <td>{user.userName}</td>
            <td>{user.userEmail}</td>
        </tr>
    )
}

export default UsersTable;