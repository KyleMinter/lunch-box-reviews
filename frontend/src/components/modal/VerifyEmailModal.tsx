import Modal from "./Modal";


interface VerifyEmailModalProps {
    closeOnLossOfFocus: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ closeOnLossOfFocus = false, isOpen, onClose }) => {
    const modalSize = {
        width: '600px',
        height: '300px'
    };

    return (
        <Modal
            title="Verify Email"
            description="Email verification required."
            modalSize={modalSize}
            closeOnLossOfFocus={closeOnLossOfFocus}
            isOpen={isOpen}
            onClose={onClose}
        >
            <p>You must verify your email before logging in.</p>
            <button>Send verification email</button>
        </Modal>
    )
}

export default VerifyEmailModal;