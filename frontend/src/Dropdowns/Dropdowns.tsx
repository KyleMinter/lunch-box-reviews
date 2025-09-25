import useOutsideClick from '../Hooks/useOutsideClick';
import usePopupElement from '../Hooks/usePopupElement';
import './Dropdown.css';


interface DropdownProps {
    minWidth?: string;
    marginTop?: string
    alignment?: string;
    parent: React.ReactElement;
    children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
    minWidth = '100px',
    marginTop,
    alignment = undefined,
    parent,
    children
}) => {
    const { isOpen, setIsOpen, toggle } = usePopupElement();
    const ref = useOutsideClick(() => setIsOpen(false));

    const dropdownStyle: {
        display: string;
        minWidth: string;
        marginTop?: string;
        right?: number;
        left?: number
    } = {
        display: isOpen ? 'block' : 'none',
        minWidth: minWidth,
        marginTop: marginTop
    };

    if (alignment === 'right')
        dropdownStyle.right = 0;
    else if (alignment === 'left')
        dropdownStyle.left = 0;

    return (
        <div className="dropdown" ref={ref}>
            <div onClick={toggle}>{parent}</div>
            <div className="dropdown-content" style={dropdownStyle} >
                {children}
            </div>
        </div>
    );
}

export default Dropdown;