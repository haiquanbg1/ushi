'use client';

import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { analyticsAPI } from '@/lib/api';

function DashboardSection() {
    const [revenue, setRevenue] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [comboShare, setComboShare] = useState([]);
    const [revenueVsOrders, setRevenueVsOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [
                revenueRes,
                bestSellersRes,
                comboShareRes,
                revenueVsOrdersRes
            ] = await Promise.all([
                analyticsAPI.getRevenueByMonth(6),
                analyticsAPI.getBestSellingItems(10),
                analyticsAPI.getComboShare(),
                analyticsAPI.getRevenueVsOrders(6)
            ]);

            setRevenue(revenueRes.data?.data || []);
            setBestSellers(bestSellersRes.data?.data || []);
            setComboShare(comboShareRes.data?.data || []);
            setRevenueVsOrders(revenueVsOrdersRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to empty data
            setRevenue([]);
            setBestSellers([]);
            setComboShare([]);
            setRevenueVsOrders([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-400">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + nút làm mới */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">
                    Tổng quan kinh doanh
                </h2>
                <button
                    onClick={fetchDashboardData}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                    Làm mới dữ liệu
                </button>
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Doanh thu theo tháng">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={revenue.length > 0 ? revenue : []}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <XAxis
                                    dataKey="month"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#0b0f19',
                                        border: '1px solid #1f2937',
                                        color: '#e5e7eb'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#60a5fa"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Món bán chạy">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={bestSellers.length > 0 ? bestSellers : []}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#0b0f19',
                                        border: '1px solid #1f2937',
                                        color: '#e5e7eb'
                                    }}
                                />
                                <Bar
                                    dataKey="sold"
                                    fill="#34d399"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Tỷ lệ combo (%)">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={comboShare.length > 0 ? comboShare : []}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {comboShare.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'][
                                                index % 4
                                                ]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#0b0f19',
                                        border: '1px solid #1f2937',
                                        color: '#e5e7eb'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Doanh thu & số đơn">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={
                                    revenueVsOrders.length > 0
                                        ? revenueVsOrders
                                        : []
                                }
                            >
                                <XAxis
                                    dataKey="month"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#0b0f19',
                                        border: '1px solid #1f2937',
                                        color: '#e5e7eb'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="revenue"
                                    fill="#60a5fa"
                                    radius={[8, 8, 0, 0]}
                                />
                                <Bar
                                    dataKey="orders"
                                    fill="#fbbf24"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
            </div>
            {children}
        </section>
    );
}

export default DashboardSection;
