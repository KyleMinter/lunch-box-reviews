import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import HomePage from './Pages/HomePage/HomePage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import LoadingPage from './Pages/LoadingPage/LoadingPage';
import Navbar from './Navigation/Navbar';
import VerifyEmailModal from './Modals/VerifyEmailModal';
import useModal from './Modals/useModal';


const App = () => {
    const [searchParams] = useSearchParams();
    const { isOpen: isVerifyEmailModalOpen, setIsOpen: setIsVerifyEmailModalOpen } = useModal(searchParams.has('verifyEmail'));

    const onClose = () => {
        setIsVerifyEmailModalOpen(false);
    }

    return (
        <>
            <Navbar />
            <PageRoutes />
            <VerifyEmailModal
                shouldCloseOnLossOfFocus={true}
                isOpen={isVerifyEmailModalOpen}
                onClose={onClose}
            />
        </>
    );
}

const PageRoutes = () => {
    const { isLoading } = useAuth0()

    if (isLoading) {
        return (
            <div className="page-layout">
                <LoadingPage />
            </div>
        )
    }

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
