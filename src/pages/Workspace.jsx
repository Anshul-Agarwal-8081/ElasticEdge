import React, { useContext, useState, useMemo } from 'react';
import { ProductContext } from '../context/ProductContext';
import { computeRecommendedPrice, needsRevision, generateTimeSeriesData } from '../utils/pricingLogic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Workspace() {
    const { products } = useContext(ProductContext);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const revisedProducts = useMemo(() => {
        return products.map(p => {
            const recPrice = computeRecommendedPrice(p, 0.3); // default k
            return { ...p, recommendedPrice: recPrice };
        }).filter(p => needsRevision(parseFloat(p['Selling Price']), p.recommendedPrice));
    }, [products]);

    const salesData = useMemo(() => {
        return selectedProduct ? generateTimeSeriesData(200, 150, 30) : [];
    }, [selectedProduct]);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
            <header className="mb-10 border-b border-beige-300 pb-6 flex items-baseline justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-sage-900 tracking-tight">Strategy Workspace</h1>
                    <p className="text-sage-500 font-sans mt-2 tracking-wide font-medium">Identify SKUs drifting &gt;5% from algorithmic target baseline.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-soft border border-beige-500/50 overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap cursor-pointer font-sans">
                        <thead className="bg-[#fcfbf9] text-sage-400 uppercase text-[10px] font-bold tracking-widest border-b border-beige-300">
                            <tr>
                                <th className="px-8 py-5">Product Identifier</th>
                                <th className="px-8 py-5 text-right">Demand Map</th>
                                <th className="px-8 py-5 text-right">Depth</th>
                                <th className="px-8 py-5 text-right text-[#808d81]">Market Baseline</th>
                                <th className="px-8 py-5 text-right text-[#a46565]">Current Price</th>
                                <th className="px-8 py-5 text-right text-[#558455]">Algorithmic Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-beige-300/50 text-sm">
                            {revisedProducts.map((p, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => setSelectedProduct(p)}
                                    className="hover:bg-beige-50/70 transition duration-300 group"
                                >
                                    <td className="px-8 py-6 font-semibold text-sage-900 group-hover:text-sage-700">{p['Product Name']}</td>
                                    <td className="px-8 py-6 text-right text-sage-600">{p['Market Demand']}</td>
                                    <td className="px-8 py-6 text-right text-sage-500 font-mono text-xs">{p['Quantity']}</td>
                                    <td className="px-8 py-6 text-right bg-sage-50/30 font-medium text-[#758f76] font-mono text-sm">${parseFloat(p['Market Price']).toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right bg-[#fdf4f4]/40 font-bold text-[#a46565] font-mono text-sm">${parseFloat(p['Selling Price']).toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right bg-[#f4f8f4]/40 font-bold text-[#558455] font-mono text-sm">${p.recommendedPrice.toFixed(2)}</td>
                                </tr>
                            ))}
                            {revisedProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center flex flex-col items-center justify-center">
                                        <span className="text-4xl mb-4">✨</span>
                                        <span className="text-sage-700 font-serif font-bold text-xl mb-2">Portfolio Optimized</span>
                                        <span className="text-sage-400 font-sans text-sm tracking-wide">All pricing models currently align with algorithmic baselines.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedProduct && (
                <div className="fixed inset-0 bg-[#1a241a]/60 backdrop-blur-md flex items-center justify-center p-6 z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-3xl shadow-soft-lg p-10 w-full max-w-4xl relative border border-beige-300/50">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-6 right-6 text-sage-400 hover:text-sage-900 focus:outline-none transition-colors p-2 rounded-full hover:bg-beige-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <h2 className="text-3xl font-serif font-bold text-sage-900 mb-2">{selectedProduct['Product Name']}</h2>
                        <div className="flex gap-4 mb-8">
                            <span className="text-sage-500 font-sans text-sm tracking-wide font-medium bg-beige-50 px-4 py-1.5 rounded-full border border-beige-200">Historical Volume Context</span>
                            <span className="text-[#a46565] font-sans text-sm tracking-wide font-bold bg-[#fdf4f4] px-4 py-1.5 rounded-full border border-[#f5dede]">Deviation Detected</span>
                        </div>

                        <div className="h-96 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData} margin={{ left: -20, right: 10 }}>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis dataKey="sales" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E1DA', boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08)', fontFamily: 'Inter', fontWeight: 600, padding: '12px 16px' }}
                                        itemStyle={{ color: '#b0a697' }}
                                        labelStyle={{ color: '#948a7b', marginBottom: '4px' }}
                                    />
                                    <Line type="monotone" dataKey="sales" stroke="#b0a697" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#758f76', strokeWidth: 0 }} animationDuration={1000} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
