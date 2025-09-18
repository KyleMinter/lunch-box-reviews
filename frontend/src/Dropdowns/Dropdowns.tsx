import './Dropdown.css';


interface DropdownProps {
    minWidth?: string;
    alignment?: string;
    parent: React.ReactElement;
    children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
    minWidth = '100px',
    alignment = undefined,
    parent,
    children
}) => {

    interface DropdownStyle {
        minWidth: string;
        right?: number;
        left?: number;
    }

    const dropdownContentStyle: DropdownStyle = {
        minWidth: minWidth,
    }

    switch (alignment) {
        case 'right':
            dropdownContentStyle.right = 0;
            break;
        case 'left':
            dropdownContentStyle.left = 0;
            break;
    }


    return (
        <div className="dropdown">
            {parent}
            <div className="dropdown-content" style={dropdownContentStyle} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

export default Dropdown;