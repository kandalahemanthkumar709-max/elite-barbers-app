import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token } = useSelector((state) => state.auth);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (allowedRoles && !allowedRoles.includes(decoded.role)) {
            // User is logged in but doesn't have the right role
            return <Navigate to="/" replace />;
        }
    } catch {
        // Token is malformed
        return <Navigate to="/login" replace />;
    }

    return children;
};
