import './App.css';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import HomePage from './Pages/HomePage/HomePage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import LoadingPage from './Pages/LoadingPage/LoadingPage';
import Navbar from './Navigation/Navbar';
import VerifyEmailModal from './Modals/VerifyEmailModal';
import usePopupElement from './Hooks/usePopupElement';
import AuthGuard from './Auth/AuthGuard';
import { UserPermission } from '@lunch-box-reviews/shared-types';
import AdminPage from './Pages/AdminPage/AdminPage';
import ProfilePage from './Pages/ProfilePage/PagePage';
import AuthErrorModal from './Modals/AuthErrorModal';
import useAuth from './Auth/useAuth';


const App = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isOpen: isVerifyEmailModalOpen, setIsOpen: setIsVerifyEmailModalOpen } = usePopupElement(searchParams.has('verifyEmail'));
    const { isOpen: isAuthErrorModalOpen, setIsOpen: setIsAuthErrorModalOpen } = usePopupElement(searchParams.has('authError'));

    const onVerifyEmailModalClose = () => {
        setIsVerifyEmailModalOpen(false);
        searchParams.delete('verifyEmail');
        setSearchParams(searchParams)
    }

    const onAuthErrorModalClose = () => {
        setIsAuthErrorModalOpen(false);
        searchParams.delete('authError');
        setSearchParams(searchParams);
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
            <AuthErrorModal
                closeOnLossOfFocus={true}
                isOpen={isAuthErrorModalOpen}
                onClose={onAuthErrorModalClose}
            />
        </>
    );
}

const PageRoutes = () => {
    const { isLoading } = useAuth()

    if (isLoading) {
        return (
            <LoadingPage />
        )
    }

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
                path="/profile"
                element={<AuthGuard Component={ProfilePage} />}
            />
            <Route
                path="/admin"
                element={
                    <AuthGuard
                        Component={AdminPage}
                        permission={UserPermission.adminFoodItemPermissions}
                    />
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
