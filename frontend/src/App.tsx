import './App.css';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingPage from './pages/LoadingPage';
import Navbar from './navigation/Navbar';
import usePopupElement from './hooks/usePopupElement';
import AuthGuard from './auth/AuthGuard';
import ProfilePage from './pages/ProfilePage';
import VerifyEmailModal from './components/modal/VerifyEmailModal';
import AuthErrorModal from './components/modal/AuthErrorModal';
import useAuth from './auth/useAuth';
import SearchPage from './pages/searchPage/SearchPage';
import './pages/pages.css';
import SearchProvider from './utils/search/SearchProvider';
import useSearchResults from './hooks/useSearchResults';


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
            <SearchProvider>
                <Navbar />
                <PageRoutes />
            </SearchProvider>
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
    const { isLoading: isLoadingAuth } = useAuth()
    const { isLoading: isLoadingSearch } = useSearchResults();

    if (isLoadingAuth || isLoadingSearch) {
        return (
            <LoadingPage />
        )
    }

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
                path="/profile"
                element={<AuthGuard Component={ProfilePage} />}
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
