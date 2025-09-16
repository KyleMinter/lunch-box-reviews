import ReactDOM from 'react-dom';


interface ModalProps {
    title: string;
    description: string;
    isOpen: boolean;
    onClose: () => void;
    shouldCloseOnLossOfFocus: boolean;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, description, shouldCloseOnLossOfFocus, isOpen, onClose, children }) => {
    const backdropStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)'
    }

    const modalContainerStyle = {
        width: '50%',
        height: '75%',
        zIndex: 1,
        margin: 'auto'
    }

    if (!isOpen)
        return null;

    return ReactDOM.createPortal(
        <div className="modal-backdrop" style={backdropStyle} onClick={shouldCloseOnLossOfFocus ? () => onClose() : undefined}>
            <div className="modal-container" style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onClose()}>Close</button>
                <h1>{title}</h1>
                <p>{description}</p>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>,
    document.body);
}

export default Modal;