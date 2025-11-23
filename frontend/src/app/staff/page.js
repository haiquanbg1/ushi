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
            <div className="bg-gray-800 text-white py-4 mb-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Ushi Mania</h1>
                        <div className="flex items-center space-x-4">
                            <button onClick={logout} className="btn btn-danger">
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
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Quản lý Bàn
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'orders'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Theo dõi Đơn hàng
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 rounded-lg ${activeTab === 'payments'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Xác nhận Thanh toán
                    </button> */}
                </div>

                {activeTab === 'tables' && <TableManagement />}
                {activeTab === 'orders' && <OrderTracking />}
                {/* {activeTab === 'payments' && <PaymentConfirmation />} */}
            </div>
        </ProtectedRoute>
    );
}
