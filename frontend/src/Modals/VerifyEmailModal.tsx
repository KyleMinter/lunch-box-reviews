import Modal from "./Modal";


interface VerifyEmailModalProps {
    shouldCloseOnLossOfFocus: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ shouldCloseOnLossOfFocus, isOpen, onClose }) => {
    return (
        <Modal
            title="Verify Email"
            description="You must verify your email before logging in."
            shouldCloseOnLossOfFocus={shouldCloseOnLossOfFocus}
            isOpen={isOpen}
            onClose={onClose}
        >
            <button>Send verification email</button>
        </Modal>
    )
}

export default VerifyEmailModal;