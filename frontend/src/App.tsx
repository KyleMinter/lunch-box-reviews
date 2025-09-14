import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './Pages/HomePage/HomePage';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import LoadingPage from './Pages/LoadingPage/LoadingPage';
import VerifyEmailPage from './Pages/VerifyEmailPage/VerifyEmailPage';


const App = () => {
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
            <Route path="/verifyEmail" element={<VerifyEmailPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
