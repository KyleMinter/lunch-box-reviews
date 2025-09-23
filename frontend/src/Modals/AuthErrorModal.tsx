import Modal from "./Modal";


interface AuthErrorModalProps {
    closeOnLossOfFocus: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const AuthErrorModal: React.FC<AuthErrorModalProps> = ({ closeOnLossOfFocus = false, isOpen, onClose }) => {
    const modalSize = {
        width: '600px',
        height: '300px'
    };

    return (
        <Modal
            title="Authentication Error"
            description="There was an error that occurred during authentication."
            modalSize={modalSize}
            closeOnLossOfFocus={closeOnLossOfFocus}
            isOpen={isOpen}
            onClose={onClose}
        >
            <p>Please try logging in again at a later time.</p>
            <p>Notify the developer if this error continues to occur.</p>
        </Modal>
    )
}

export default AuthErrorModal;