import {Routes, BrowserRouter, Route, Navigate} from 'react-router-dom';
import Login from './Forms/LoginForm';
import MainPage from './MainPage';
import { RequireToken } from './Auth';
import RegisterForm from './Forms/RegisterForm';
import { useState, useEffect } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem("auth_token");
        if (authToken) {
            setIsAuthenticated(true);
        }
    }, []);
  
    return (
        <div className ="App">
            <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                {!isAuthenticated && <Route path="/*" element={<Navigate to="/login" />} />}
                <Route path="/users" element={<RequireToken><MainPage /></RequireToken>} />
                <Route path="/registration" element={<RegisterForm />} />
            </Routes>
            </BrowserRouter>
        </div>
    );
}
  
export default App;
