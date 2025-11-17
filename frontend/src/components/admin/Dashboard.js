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
    const [KPI, setKPI] = useState([]);
    const [revenueVsOrders, setRevenueVsOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [revenueRes, bestSellersRes, comboShareRes, kpisRes, revenueVsOrdersRes] = await Promise.all([
                analyticsAPI.getRevenueByMonth(6),
                analyticsAPI.getBestSellingItems(10),
                analyticsAPI.getComboShare(),
                analyticsAPI.getKPIs(),
                analyticsAPI.getRevenueVsOrders(6)
            ]);

            setRevenue(revenueRes.data?.data || []);
            setBestSellers(bestSellersRes.data?.data || []);
            setComboShare(comboShareRes.data?.data || []);
            setKPI(kpisRes.data?.data || []);
            setRevenueVsOrders(revenueVsOrdersRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to empty data
            setRevenue([]);
            setBestSellers([]);
            setComboShare([]);
            setKPI([]);
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
            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {KPI.length > 0 ? KPI.map((k) => (
                    <div key={k.title} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <div className="text-sm text-slate-400">{k.title}</div>
                        <div className="mt-1 text-2xl font-semibold">{k.value}</div>
                        <div className={`mt-2 text-xs ${k.state === 'good' ? 'text-emerald-400' : k.state === 'warn' ? 'text-amber-400' : 'text-slate-400'
                            }`}>{k.trend}</div>
                    </div>
                )) : (
                    <div className="col-span-4 text-center py-8 text-slate-400">
                        Chưa có dữ liệu
                    </div>
                )}
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Revenue by Month" right={
                    <button onClick={fetchDashboardData} className="text-xs text-slate-400 hover:text-slate-200">
                        🔄 Refresh
                    </button>
                }>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenue.length > 0 ? revenue : []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid #1f2937', color: '#e5e7eb' }} />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Best Selling Items">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bestSellers.length > 0 ? bestSellers : []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid #1f2937', color: '#e5e7eb' }} />
                                <Bar dataKey="sold" fill="#34d399" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Combo Share (%)">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={comboShare.length > 0 ? comboShare : []} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name">
                                    {comboShare.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid #1f2937', color: '#e5e7eb' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Revenue vs Orders">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueVsOrders.length > 0 ? revenueVsOrders : []}>
                                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid #1f2937', color: '#e5e7eb' }} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="orders" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function Card({ title, children, right }) {
    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
                {right}
            </div>
            {children}
        </section>
    );
}

export default DashboardSection;