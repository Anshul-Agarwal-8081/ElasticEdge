import React, { useContext, useMemo } from 'react';
import { ProductContext } from '../context/ProductContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateTimeSeriesData } from '../utils/pricingLogic';

export default function Dashboard() {
    const { products } = useContext(ProductContext);

    // Generate some global synthetic data for dashboard
    const revenueData = useMemo(() => generateTimeSeriesData(50000, 100, 30), []);
    const salesData = useMemo(() => generateTimeSeriesData(200, 100, 30), []);

    const totalRevenue = products.reduce((acc, curr) => {
        return acc + (parseFloat(curr['Selling Price']) * parseInt(curr['Quantity']));
    }, 0);

    const reEvalProducts = products.filter(p => {
        const demand = parseFloat(p['Market Demand']);
        const stock = parseInt(p['Quantity']);
        const days = parseInt(p['Days in Inventory']);
        return demand > 0.7 && stock > 50 && days > 30;
    });

    const statusCounts = products.reduce((acc, curr) => {
        const sp = parseFloat(curr['Selling Price']);
        const cp = parseFloat(curr['Cost Price']);
        if (sp > cp) acc.profit++;
        else if (sp < cp) acc.loss++;
        else acc.breakeven++;
        return acc;
    }, { profit: 0, loss: 0, breakeven: 0 });

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col items-start border-b border-beige-300 pb-6">
                <h1 className="text-4xl font-serif font-bold text-sage-900 tracking-tight">Strategy Overview</h1>
                <p className="text-sage-500 font-sans mt-2 tracking-wide font-medium">Real-time macro analysis of your dynamic pricing configuration.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 flex flex-col justify-between hover:shadow-soft-lg transition duration-300 group">
                    <h2 className="text-sage-400 font-bold uppercase text-xs tracking-widest mb-3 group-hover:text-sage-500 transition">Estimated Revenue Edge</h2>
                    <p className="text-5xl font-serif font-bold text-sage-800">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 flex flex-col justify-between hover:shadow-soft-lg transition duration-300 group">
                    <div className="flex justify-between items-start">
                        <h2 className="text-sage-400 font-bold uppercase text-xs tracking-widest mb-3 group-hover:text-amber-600/70 transition">High Priority Review</h2>
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse hidden group-hover:block"></div>
                    </div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-5xl font-serif font-bold text-sage-800">{reEvalProducts.length}</span>
                        <span className="text-sage-500 ml-3 text-sm font-semibold tracking-wide">SKUs</span>
                    </div>
                    <p className="text-xs text-sage-500 mt-4 bg-beige-100 p-3 rounded-xl border border-beige-300/50 font-medium">Flagged parameters: Demand &gt;0.7, Depth &gt;50, Age &gt;30d</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 hover:shadow-soft-lg transition duration-300 flex flex-col">
                    <h2 className="text-sage-400 font-bold uppercase text-xs tracking-widest mb-5">Portfolio Margin Allocation</h2>
                    <div className="flex justify-between items-center bg-sage-50 p-3 rounded-xl mb-3 border border-sage-200">
                        <span className="text-sage-700 font-bold text-sm">Profit Index</span>
                        <span className="bg-white text-sage-800 px-4 py-1 rounded-full text-sm font-bold shadow-sm">{statusCounts.profit}</span>
                    </div>
                    <div className="flex justify-between items-center bg-beige-200/50 p-3 rounded-xl mb-3 border border-beige-300">
                        <span className="text-sage-600 font-bold text-sm">Break-even</span>
                        <span className="bg-white text-sage-700 px-4 py-1 rounded-full text-sm font-bold shadow-sm">{statusCounts.breakeven}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#fcf9f9] p-3 rounded-xl border border-[#efebeb]">
                        <span className="text-[#a07474] font-bold text-sm">Loss State</span>
                        <span className="bg-white text-[#8c5e5e] px-4 py-1 rounded-full text-sm font-bold shadow-sm border border-[#f5ecec]">{statusCounts.loss}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50">
                    <h2 className="text-xl font-serif font-bold mb-6 text-sage-800">Revenue Velocity (30 Days)</h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis dataKey="revenue" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={(tick) => `$${tick / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08)', fontFamily: 'Inter', fontWeight: 600 }}
                                    itemStyle={{ color: '#3B4D3C' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#758f76" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#3B4D3C', strokeWidth: 0 }} animationDuration={1000} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50">
                    <h2 className="text-xl font-serif font-bold mb-6 text-sage-800">Unit Distribution (30 Days)</h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis dataKey="sales" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08)', fontFamily: 'Inter', fontWeight: 600 }}
                                    itemStyle={{ color: '#b0a697' }}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#b0a697" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#948a7b', strokeWidth: 0 }} animationDuration={1000} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
