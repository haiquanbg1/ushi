'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import TableManagement from '@/components/staff/TableManagement';
import OrderTracking from '@/components/staff/OrderTracking';
import PaymentConfirmation from '@/components/staff/PaymentConfirmation';

export default function StaffPage() {
    const [activeTab, setActiveTab] = useState('tables');
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute requiredRole="Staff">
            {/* Header đổi sang orange-500 */}
            <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white py-4 mb-8 shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Ushi Mania</h1>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <span className="text-sm">
                                    Xin chào,{' '}
                                    <span className="font-semibold">
                                        {user.username || user.email}
                                    </span>
                                </span>
                            )}
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-xl bg-white/90 text-orange-600 font-semibold
                     hover:bg-white transition shadow-sm"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex space-x-1 mb-6">
                    <button
                        onClick={() => setActiveTab('tables')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'tables'
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Quản lý Bàn
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'orders'
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Theo dõi Đơn hàng
                    </button>
                </div>

                {activeTab === 'tables' && <TableManagement />}
                {activeTab === 'orders' && <OrderTracking />}
                {/* {activeTab === 'payments' && <PaymentConfirmation />} */}
            </div>
        </ProtectedRoute>
    );
}
