import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import HomePage from './Pages/HomePage/HomePage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import LoadingPage from './Pages/LoadingPage/LoadingPage';
import Navbar from './Navigation/Navbar';
import VerifyEmailModal from './Modals/VerifyEmailModal';
import usePopupElement from './Hooks/usePopupElement';


const App = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isOpen: isVerifyEmailModalOpen, setIsOpen: setIsVerifyEmailModalOpen } = usePopupElement(searchParams.has('verifyEmail'));

    const onVerifyEmailModalClose = () => {
        setIsVerifyEmailModalOpen(false);
        searchParams.delete('verifyEmail');
        setSearchParams(searchParams)
    }

    return (
        <>
            <Navbar />
            <PageRoutes />
            <VerifyEmailModal
                closeOnLossOfFocus={true}
                isOpen={isVerifyEmailModalOpen}
                onClose={onVerifyEmailModalClose}
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
