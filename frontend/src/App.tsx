import './App.css';
import { Route, Routes, useSearchParams } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import Navbar from './navigation/Navbar';
import usePopupElement from './hooks/usePopupElement';
import ProfilePage from './pages/userPage/ProfilePage';
import SearchPage from './pages/searchPage/SearchPage';
import SearchProvider from './utils/search/SearchProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuth from './hooks/useAuth';
import AuthGuard from './utils/auth/AuthGuard';
import Auth0ProviderWithNavigate from './utils/auth/Auth0ProviderWithNavigate';
import AuthProvider from './utils/auth/AuthProvider';
import LoadingSpinner from './components/LoadingSpinner';
import { Box } from '@mui/material';
import UserPage from './pages/userPage/UserPage';
import FoodPage from './pages/foodPage/FoodPage';
import { SnackbarProvider } from 'notistack';
import NotFoundPage from './pages/NotFoundPage';
import AuthErrorPage from './pages/AuthErrorPage';
import VerifyEmailPage from './pages/VerifyEmailPage';


const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000 // Stale time 5 minutes to reduce refetching.
      }
    }
  });

  return (
    <>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
      >
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
      </SnackbarProvider>
    </>
  );
}

const PageRoutes = () => {
  const { isLoading: isLoadingAuth } = useAuth();

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
      <Route path="/user/:userId" element={<UserPage />} />
      <Route path="/food/:foodId" element={<FoodPage />} />
      <Route path="/authError" element={<AuthErrorPage />} />
      <Route path="/verifyEmail" element={<VerifyEmailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
