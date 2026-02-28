import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
    const { products } = useContext(ProductContext);
    const navigate = useNavigate();

    const handleSimulate = (product) => {
        navigate('/simulation', { state: { product } });
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            <header className="mb-10 border-b border-beige-300 pb-6 flex items-baseline justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-sage-900 tracking-tight">Product Catalog</h1>
                    <p className="text-sage-500 font-sans mt-2 tracking-wide font-medium">Analyze and simulate individual SKUs within your portfolio.</p>
                </div>
                <div className="text-sm font-semibold text-sage-500 bg-white px-4 py-2 border border-beige-300 rounded-xl shadow-sm">
                    {products.length} Active SKUs
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-soft border border-beige-500/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap font-sans">
                        <thead className="bg-beige-50 text-sage-500 uppercase text-[10px] font-bold tracking-widest border-b border-beige-300">
                            <tr>
                                <th className="px-8 py-5">Product Identifier</th>
                                <th className="px-8 py-5 text-right">Cost Basis</th>
                                <th className="px-8 py-5 text-right">Inventory Depth</th>
                                <th className="px-8 py-5 text-right">Market Average</th>
                                <th className="px-8 py-5 text-right">Demand Index</th>
                                <th className="px-8 py-5 text-right">Selling Price</th>
                                <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-beige-300/50 text-sm">
                            {products.map((product, idx) => (
                                <tr key={idx} className="hover:bg-beige-50/60 transition duration-300 group">
                                    <td className="px-8 py-6 font-semibold text-sage-900 group-hover:text-sage-700">{product['Product Name']}</td>
                                    <td className="px-8 py-6 text-right text-sage-500 font-mono text-xs">${parseFloat(product['Cost Price']).toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right text-sage-600">
                                        <span className="bg-beige-200 px-3 py-1 rounded-lg text-xs font-bold border border-beige-300">{product['Quantity']}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right text-sage-500 font-mono text-xs">${parseFloat(product['Market Price']).toFixed(2)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${parseFloat(product['Market Demand']) > 0.7 ? 'bg-[#f4f8f4] border-[#dcebdc] text-[#558455]' : parseFloat(product['Market Demand']) < 0.4 ? 'bg-[#fdf4f4] border-[#f5dede] text-[#a46565]' : 'bg-beige-100 border-beige-300 text-sage-600'}`}>
                                            {parseFloat(product['Market Demand']).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-bold text-sage-800 font-mono text-sm">${parseFloat(product['Selling Price']).toFixed(2)}</td>
                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => handleSimulate(product)}
                                            className="bg-white border border-sage-700 text-sage-700 hover:bg-sage-700 hover:text-white px-5 py-2 rounded-full text-xs font-bold transition duration-300 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2"
                                        >
                                            Analyze
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-16 text-center text-sage-400 font-medium tracking-wide">
                                        Initializing ledger. Waiting for product ingestion...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
