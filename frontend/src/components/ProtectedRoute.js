'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (requiredRole && user?.role?.roleName !== requiredRole) {
                // Redirect based on user role
                switch (user?.role?.roleName) {
                    case 'Admin':
                        router.push('/admin');
                        break;
                    case 'Staff':
                        router.push('/staff');
                        break;
                    default:
                        break;
                }
            }
        }
    }, [isAuthenticated, loading, user, requiredRole, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    if (!isAuthenticated || (requiredRole && user?.role.roleName !== requiredRole)) {
        return null;
    }

    return children;
};

export default ProtectedRoute;