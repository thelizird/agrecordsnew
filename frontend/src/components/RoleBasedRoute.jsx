import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

function RoleBasedRoute({ children, allowedRoles }) {
    const userRole = localStorage.getItem('userRole');

    return (
        <ProtectedRoute>
            {allowedRoles.includes(userRole) ? (
                children
            ) : (
                <Navigate to="/unauthorized" replace />
            )}
        </ProtectedRoute>
    );
}

export default RoleBasedRoute; 