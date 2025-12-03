'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // CHỜ loading xong mới check
        if (loading) return;

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
                    router.push('/login'); // Thêm fallback
                    break;
            }
        }
    }, [isAuthenticated, loading, user, requiredRole, router]);

    // Show loading cho đến khi auth check xong
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    // Không render gì nếu chưa authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Không render gì nếu role không đúng
    if (requiredRole && user?.role?.roleName !== requiredRole) {
        return null;
    }

    return children;
};

export default ProtectedRoute;