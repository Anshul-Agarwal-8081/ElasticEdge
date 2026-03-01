import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { computeRecommendedPrice, generateTimeSeriesData } from '../utils/pricingLogic';
import { ProductContext } from '../context/ProductContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Simulation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { updateProductPrice, dailyActuals } = useContext(ProductContext);
    const [product, setProduct] = useState(location.state?.product || null);
    const [kFactor, setKFactor] = useState(0.3); // default K
    const [recommendedPrice, setRecommendedPrice] = useState(0);

    useEffect(() => {
        if (!product) {
            navigate('/inventory');
            return;
        }
        const rp = computeRecommendedPrice(product, kFactor);
        setRecommendedPrice(rp);
    }, [product, kFactor, navigate]);

    const { simRevenue, simSales } = useMemo(() => {
        if (!product) return { simRevenue: [], simSales: [] };
        const demand = parseFloat(product['Market Demand']);
        const expectedSales = demand * 100 * (1 - (kFactor * 0.5));
        const projectedRevenue = expectedSales * recommendedPrice;
        const history = dailyActuals[product['Product Name']];

        return {
            simRevenue: generateTimeSeriesData(projectedRevenue, expectedSales, 31, history),
            simSales: generateTimeSeriesData(expectedSales, expectedSales, 31, history)
        };
    }, [product, recommendedPrice, kFactor, dailyActuals]);

    if (!product) return null;

    const currentPrice = parseFloat(product['Selling Price']);
    const costPrice = parseFloat(product['Cost Price']);
    let profitMargin = recommendedPrice - costPrice;

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            <div className="flex justify-between items-baseline mb-10 border-b border-beige-300 pb-6">
                <div>
                    <button onClick={() => navigate('/inventory')} className="text-sage-500 hover:text-sage-800 font-sans text-sm tracking-wide font-bold mb-4 group flex items-center transition duration-300">
                        <svg className="w-5 h-5 mr-1.5 transform group-hover:-translate-x-1.5 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                        Return to Ledger
                    </button>
                    <h1 className="text-4xl font-serif font-bold text-sage-900 tracking-tight">Market Simulation</h1>
                    <p className="text-sage-600 font-sans mt-2 tracking-wide font-medium flex items-center gap-2">
                        Targeting: <span className="text-sage-800 font-bold bg-beige-200 px-3 py-1 rounded-xl border border-beige-300 text-sm shadow-sm">{product['Product Name']}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 flex flex-col h-full font-sans">
                        <h2 className="text-xl font-serif font-bold mb-6 text-sage-900 tracking-tight">Algorithm Parameters</h2>

                        <div className="mb-8 space-y-1">
                            <div className="flex justify-between py-3 border-b border-beige-200/60">
                                <span className="text-sage-400 font-semibold text-sm uppercase tracking-wider">Current Mark</span>
                                <span className="font-bold text-sage-700 font-opensans">${currentPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-beige-200/60">
                                <span className="text-sage-400 font-semibold text-sm uppercase tracking-wider">Market Avg</span>
                                <span className="font-bold text-sage-700 font-opensans">${parseFloat(product['Market Price']).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-beige-200/60">
                                <span className="text-sage-400 font-semibold text-sm uppercase tracking-wider">Cost Basis</span>
                                <span className="font-bold text-sage-700 font-opensans">${costPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-sage-400 font-semibold text-sm uppercase tracking-wider">Demand Idx</span>
                                <span className={`font-bold font-opensans ${parseFloat(product['Market Demand']) > 0.6 ? 'text-[#558455]' : 'text-[#a46565]'}`}>
                                    {product['Market Demand']}
                                </span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <label className="flex justify-between items-center text-sage-800 font-bold mb-4 tracking-wide text-sm">
                                Action Threshold K
                                <span className="text-sage-500 bg-beige-100 px-3 py-1 rounded-lg border border-beige-300 text-xs font-opensans">{kFactor.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="0.5"
                                step="0.05"
                                value={kFactor}
                                onChange={e => setKFactor(parseFloat(e.target.value))}
                                className="w-full accent-sage-600 cursor-pointer"
                            />
                            <p className="text-xs text-sage-400 mt-4 leading-relaxed font-medium">Modulates algorithmic aggression. Higher values penalize overpricing relative to market demand.</p>
                        </div>

                        <div className="mt-auto relative z-10 p-6 rounded-2xl bg-[#f2f4f2] border border-[#dcebdc] text-center shadow-inner overflow-hidden">
                            {/* decorative backdrop */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl opacity-40 -mr-10 -mt-10 pointer-events-none"></div>

                            <h3 className="text-[#658a65] font-bold uppercase text-xs tracking-widest mb-3 relative z-10">Optimal Target Price</h3>
                            <p className="text-6xl font-serif font-bold text-[#3B4D3C] mb-4 relative z-10 font-opensans">${recommendedPrice.toFixed(2)}</p>
                            <div className="flex justify-center relative z-10">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border font-opensans ${profitMargin > 0 ? 'bg-white text-[#5f875f] border-[#dcebdc]' : 'bg-[#fdf4f4] text-[#a46565] border-[#f5dede]'}`}>
                                    Margin: ${profitMargin.toFixed(2)} /unit
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                updateProductPrice(product['Product Name'], recommendedPrice);
                                alert(`Configuration synced. ${product['Product Name']} updated to $${recommendedPrice.toFixed(2)}`);
                                navigate('/inventory');
                            }}
                            className="w-full mt-6 bg-sage-800 hover:bg-sage-600 text-beige-50 font-bold text-sm tracking-widest uppercase py-4 px-6 rounded-xl shadow-soft transition duration-300"
                        >
                            Commit Strategy
                        </button>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50">
                        <h2 className="text-xl font-serif font-bold mb-8 text-sage-900">Projected Value Capture (30 Days)</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={simRevenue} margin={{ left: 0, right: 10, bottom: 20, top: 10 }}>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} dy={10} label={{ value: 'Timeline (Days)', position: 'insideBottom', offset: -10, fill: '#948a7b', fontSize: 12, fontWeight: 600 }} />
                                    <YAxis dataKey="revenue" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} tickFormatter={(tick) => `$${tick / 1000}k`} label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', offset: 15, fill: '#948a7b', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08)', fontFamily: 'Inter', fontWeight: 600 }}
                                        itemStyle={{ color: '#3B4D3C' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#758f76" strokeWidth={4} dot={(props) => props.payload.isActual ? <circle cx={props.cx} cy={props.cy} r={6} fill="#3B4D3C" stroke="white" strokeWidth={2} /> : false} activeDot={{ r: 8 }} animationDuration={1000} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50">
                        <h2 className="text-xl font-serif font-bold mb-8 text-sage-900">Projected Volume (31 Days)</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={simSales} margin={{ left: 0, right: 10, bottom: 20, top: 10 }}>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} dy={10} label={{ value: 'Timeline (Days)', position: 'insideBottom', offset: -10, fill: '#948a7b', fontSize: 12, fontWeight: 600 }} />
                                    <YAxis dataKey="sales" tick={{ fill: '#948a7b', fontSize: 13, fontFamily: 'Inter' }} tickLine={false} axisLine={false} label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', offset: 15, fill: '#948a7b', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.08)', fontFamily: 'Inter', fontWeight: 600 }}
                                        itemStyle={{ color: '#b0a697' }}
                                    />
                                    <Line type="monotone" dataKey="sales" stroke="#b0a697" strokeWidth={4} dot={(props) => props.payload.isActual ? <circle cx={props.cx} cy={props.cy} r={6} fill="#948a7b" stroke="white" strokeWidth={2} /> : false} activeDot={{ r: 8 }} animationDuration={1000} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
