import ReactDOM from 'react-dom';
import './Modal.css';


interface ModalProps {
    title: string;
    description: string;
    modalSize?: ModalSize;
    closeOnLossOfFocus: boolean;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

interface ModalSize {
    width: string,
    height: string
}

const defaultModalSize: ModalSize = {
    width: '50%',
    height: '75%'
};

const Modal: React.FC<ModalProps> = ({
    title,
    description,
    modalSize = defaultModalSize,
    closeOnLossOfFocus,
    isOpen,
    onClose,
    children
}) => {
    if (!isOpen)
        return null;

    return ReactDOM.createPortal(
        <div className="modal-backdrop" onClick={closeOnLossOfFocus ? () => onClose() : undefined}>
            <div className="modal-container" style={modalSize} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                    <button onClick={() => onClose()}>Close</button>
                </div>
                <hr />
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>,
    document.body);
}

export default Modal;