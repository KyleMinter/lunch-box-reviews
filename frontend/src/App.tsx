import './App.css';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './navigation/Navbar';
import usePopupElement from './hooks/usePopupElement';
import ProfilePage from './pages/ProfilePage';
import VerifyEmailModal from './components/modal/VerifyEmailModal';
import AuthErrorModal from './components/modal/AuthErrorModal';
import SearchPage from './pages/searchPage/SearchPage';
import './pages/pages.css';
import SearchProvider from './utils/search/SearchProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuth from './hooks/useAuth';
import AuthGuard from './utils/auth/AuthGuard';
import Auth0ProviderWithNavigate from './utils/auth/Auth0ProviderWithNavigate';
import AuthProvider from './utils/auth/AuthProvider';
import LoadingSpinner from './components/LoadingSpinner';
import { Box } from '@mui/material';


const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen: isVerifyEmailModalOpen, setIsOpen: setIsVerifyEmailModalOpen } = usePopupElement(searchParams.has('verifyEmail'));
  const { isOpen: isAuthErrorModalOpen, setIsOpen: setIsAuthErrorModalOpen } = usePopupElement(searchParams.has('authError'));

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000 // Stale time 5 minutes to reduce refetching.
      }
    }
  });

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
      <Auth0ProviderWithNavigate>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <SearchProvider>
              <Navbar />
              <PageRoutes />
            </SearchProvider>
          </QueryClientProvider>
        </AuthProvider>
      </Auth0ProviderWithNavigate>
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

  if (isLoadingAuth) {
    return (
      <Box sx={{ mt: 5 }}>
        <LoadingSpinner />
      </Box>
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
