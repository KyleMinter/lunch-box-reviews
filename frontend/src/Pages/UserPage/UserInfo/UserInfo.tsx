import { User, UserPermission } from "@lunch-box-reviews/shared-types";
import useAuth from "../../../Auth/useAuth";
import './UserInfo.css';


interface UserInfoProps {
    user: User
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
    const { user: loggedInUser } = useAuth();
    const showAdminUserElements = loggedInUser && loggedInUser.userPermissions.includes(UserPermission.adminUserPermissions);

    return (
        <div className="user-info-container">
            <img
                src="logo192.png"
                alt="Profile"
            />
            <div className="user-info-details-container">
                <div className="user-info-details">
                    <div>
                        <h1>{user.userName}</h1>
                        <p>{user.userEmail}</p>
                    </div>
                    {(showAdminUserElements || loggedInUser === user) ? <button>Edit</button> : null}
                    
                </div>

                {showAdminUserElements  ?
                <div className="user-permissions-container">
                    {user.userPermissions.map((perm, index, array) => {
                        const lastElement = (index === array.length - 1);
                        return (<UserPermissionDisplay permission={perm} last={lastElement}/>);
                    })}
                </div> : null}
            </div>
        </div>
    )
}

interface UserPermissionDisplayProps {
    permission: UserPermission
    last: boolean
}

const UserPermissionDisplay: React.FC<UserPermissionDisplayProps> = ({ permission, last }) => {
    let permissionName = ''
    switch (permission) {
        case UserPermission.adminFoodItemPermissions:
            permissionName = 'Admin Food Permissions';
            break;
        case UserPermission.adminReviewPermissions:
            permissionName = 'Admin Review Permissions';
            break;
        case UserPermission.adminMenuInstancePermissions:
            permissionName = 'Admin Menu Permissions';
            break;
        case UserPermission.adminUserPermissions:
            permissionName = 'Admin User Permissions';
            break;
        case UserPermission.userReviewPermissions:
            permissionName = 'User Review Permissions';
            break;
        default:
            return null;
    }

    const commaSeparator = last ? '' : ', ';

    return (
        <div className="user-permission">
            <span className='user-permission-bubble'>{permissionName}</span>{commaSeparator}
        </div>
    )
}


export default UserInfo;