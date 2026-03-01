import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ProductContext } from '../context/ProductContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateTimeSeriesData, computeRecommendedPrice } from '../utils/pricingLogic';
import { getAiMarketContext } from '../utils/marketAi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
    const { products, runMarketIntelligenceScan, intelAnalysis, syncing, dailyActuals } = useContext(ProductContext);
    const [aiInsight, setAiInsight] = useState("Scan market trends to generate AI insights...");

    const reviewProducts = useMemo(() => {
        return products.filter(p => {
            const demand = parseFloat(p['Market Demand']);
            const actuals = dailyActuals[p['Product Name']] || {};
            const history = Object.values(actuals);
            // Demand is good (>0.6) but sales are stagnant (e.g. less than 5 units in last 20 records)
            // or if no records exist but demand is high and quantity is high (untested SKU)
            const totalSales = history.reduce((acc, curr) => acc + (curr.units || 0), 0);
            return demand > 0.6 && totalSales < 5;
        });
    }, [products, dailyActuals]);

    const topProduct = useMemo(() => [...products].sort((a, b) => parseFloat(b['Market Demand']) - parseFloat(a['Market Demand']))[0], [products]);

    const revenueData = useMemo(() => {
        const prod = topProduct;
        if (!prod) return generateTimeSeriesData(50000, 100, 31);
        const demand = parseFloat(prod['Market Demand']) || 0;
        const price = parseFloat(prod['Selling Price']) || 1;
        const history = dailyActuals[prod['Product Name']];
        return generateTimeSeriesData(demand * 100 * price, demand * 100, 31, history);
    }, [topProduct, dailyActuals]);

    const salesData = useMemo(() => {
        const prod = topProduct;
        if (!prod) return generateTimeSeriesData(200, 100, 31);
        const demand = parseFloat(prod['Market Demand']) || 0;
        const history = dailyActuals[prod['Product Name']];
        return generateTimeSeriesData(0, demand * 150, 31, history);
    }, [topProduct, dailyActuals]);

    const totalRevenue = products.reduce((acc, curr) => {
        return acc + (parseFloat(curr['Selling Price']) * (parseInt(curr['Quantity']) || 0));
    }, 0);

    const reEvalProducts = products.filter(p => {
        const demand = parseFloat(p['Market Demand']);
        const stock = parseInt(p['Quantity']);
        const days = parseInt(p['Days in Inventory']);
        return demand > 0.7 && stock > 50 && days > 30;
    });

    useEffect(() => {
        const fetchInsight = async () => {
            if (products.length > 0) {
                const prod = topProduct;
                const insight = await getAiMarketContext(prod['Product Name'], prod['Market Demand']);
                setAiInsight(insight);
            } else {
                setAiInsight("No data detected. Please add inventory to begin AI analysis.");
            }
        };
        fetchInsight();
    }, [intelAnalysis, products, topProduct]);

    const statusCounts = products.reduce((acc, curr) => {
        const sp = parseFloat(curr['Selling Price']);
        const cp = parseFloat(curr['Cost Price']);
        if (sp > cp) acc.profit++;
        else if (sp < cp) acc.loss++;
        else acc.breakeven++;
        return acc;
    }, { profit: 0, loss: 0, breakeven: 0 });



    const generatePDFReport = () => {
        try {
            const doc = new jsPDF();
            doc.setFont('times', 'bold');
            doc.setFontSize(20);
            doc.text('Performance & Projection Report', 14, 22);

            doc.setFont('times', 'normal');
            doc.setFontSize(11);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

            const reportData = products.map(product => {
                const demand = parseFloat(product['Market Demand']) || 0;
                const recPrice = computeRecommendedPrice(product, 0.3);
                const currentPrice = parseFloat(product['Selling Price']);
                const priceRatio = currentPrice > 0 ? recPrice / currentPrice : 1;

                const history = dailyActuals[product['Product Name']];
                const expectedDailySales = demand * 100 * priceRatio;
                const series = generateTimeSeriesData(expectedDailySales * currentPrice, expectedDailySales, 30, history);

                const totalSales = series.reduce((acc, curr) => acc + curr.sales, 0);
                const totalRev = series.reduce((acc, curr) => acc + curr.revenue, 0);

                return {
                    productName: product['Product Name'],
                    currentPrice: currentPrice.toFixed(2),
                    demand: demand.toFixed(2),
                    totalSales,
                    totalRev,
                    isMixed: series.some(d => d.isActual)
                };
            });

            autoTable(doc, {
                startY: 40,
                head: [["Product", "Price", "Demand", "30D Sales (Incl. Actuals)", "30D Revenue"]],
                body: reportData.map(d => [d.productName, `$${d.currentPrice}`, d.demand, d.totalSales.toLocaleString(), `$${d.totalRev.toLocaleString()}`]),
                theme: 'grid',
                headStyles: { fillColor: [59, 77, 60] }
            });

            doc.save('Strategy_Actuals_Report.pdf');
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarketScan = async () => {
        setAiInsight("Analyzing global market signals and consumption patterns...");
        await runMarketIntelligenceScan();
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto font-sans">
            <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end border-b border-beige-300 pb-6 gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-sage-900 tracking-tight">Strategy Overview</h1>
                    <p className="text-sage-500 font-sans mt-2 tracking-wide font-medium">Real-time macro analysis of your dynamic pricing configuration.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleMarketScan} disabled={syncing} className="bg-white hover:bg-beige-50 text-sage-800 font-semibold py-2.5 px-6 rounded-xl shadow-soft border border-beige-300 transition duration-300 flex items-center gap-2 text-sm">
                        <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        {syncing ? 'Analyzing...' : 'Scan Market Intel'}
                    </button>
                    <button onClick={generatePDFReport} className="bg-sage-700 hover:bg-sage-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-soft border border-sage-800 transition duration-300 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export Report
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 flex flex-col justify-between hover:shadow-soft-lg transition duration-300 group">
                    <h2 className="text-sage-400 font-bold uppercase text-[10px] tracking-widest mb-3 group-hover:text-sage-500 transition">Estimated Revenue Edge</h2>
                    <p className="text-4xl font-serif font-bold text-sage-800">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>

                {/* Stagnant Review Card */}
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-[#f5dede] flex flex-col hover:border-[#a46565] transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-[#a46565]/10 group-hover:bg-[#a46565]/20 transition"></div>
                    <h2 className="text-[#a46565] font-bold uppercase text-[10px] tracking-widest mb-4">Stock Stagnation Alert</h2>
                    <div className="flex-1 space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                        {reviewProducts.length > 0 ? reviewProducts.map(p => (
                            <div key={p['Product Name']} className="flex justify-between items-center text-xs font-bold border-b border-[#a46565]/10 pb-2 last:border-0">
                                <span className="text-sage-700 truncate mr-2">{p['Product Name']}</span>
                                <span className="text-[#a46565] whitespace-nowrap bg-[#fcf9f9] px-2 py-0.5 rounded-full border border-[#f5dede]">Low Velocity</span>
                            </div>
                        )) : (
                            <p className="text-xs text-sage-400 italic font-medium mt-2">No stagnation detected. Stock velocity optimal.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 hover:shadow-soft-lg transition duration-300 flex flex-col">
                    <h2 className="text-sage-400 font-bold uppercase text-[10px] tracking-widest mb-5">Portfolio Health</h2>
                    <div className="flex justify-between items-center bg-sage-50 p-3 rounded-xl mb-3 border border-sage-200">
                        <span className="text-sage-700 font-bold text-[11px]">Profit Index</span>
                        <span className="bg-white text-sage-800 px-4 py-1 rounded-full text-[11px] font-bold shadow-sm">{statusCounts.profit}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#fcf9f9] p-3 rounded-xl border border-[#efebeb]">
                        <span className="text-[#a07474] font-bold text-[11px]">Loss State</span>
                        <span className="bg-white text-[#8c5e5e] px-4 py-1 rounded-full text-[11px] font-bold shadow-sm">{statusCounts.loss}</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-serif font-bold text-sage-800">Revenue Velocity</h2>
                        <span className="text-[10px] font-bold text-sage-400 uppercase tracking-tighter">Merging Actuals + Projections</span>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis tick={{ fill: '#948a7b', fontSize: 13 }} tickLine={false} axisLine={false} tickFormatter={(tick) => `$${tick / 1000}k`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#758f76" strokeWidth={4} dot={(props) => props.payload.isActual ? <circle cx={props.cx} cy={props.cy} r={6} fill="#3B4D3C" stroke="white" strokeWidth={2} /> : false} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-soft border border-beige-500/50 transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-serif font-bold text-sage-800">Unit Distribution</h2>
                        <span className="text-[10px] font-bold text-sage-400 uppercase tracking-tighter">Day 31 Tracking Live</span>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="4 4" stroke="#E5E1DA" vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: '#948a7b', fontSize: 13 }} tickLine={false} axisLine={false} dy={10} />
                                <YAxis tick={{ fill: '#948a7b', fontSize: 13 }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                                <Line type="monotone" dataKey="sales" stroke="#b0a697" strokeWidth={4} dot={(props) => props.payload.isActual ? <circle cx={props.cx} cy={props.cy} r={6} fill="#948a7b" stroke="white" strokeWidth={2} /> : false} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
