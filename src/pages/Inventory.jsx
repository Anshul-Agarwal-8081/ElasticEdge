import React, { useContext, useState } from 'react';
import { ProductContext } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
    const { products, updateProductPrice, addProduct, deleteProduct, recordDailySales, replenishStock } = useContext(ProductContext);
    const navigate = useNavigate();
    const [editingPriceUser, setEditingPriceUser] = useState(null);
    const [tempPrice, setTempPrice] = useState('');
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [logMode, setLogMode] = useState('sale'); // 'sale' or 'replenish'
    const [dailyEntry, setDailyEntry] = useState({ productName: '', units: '' });
    const [newProduct, setNewProduct] = useState({
        'Product Name': '', 'Cost Price': '', 'Selling Price': '', 'Market Price': '', 'Market Demand': '', 'Quantity': '', 'Days in Inventory': '0'
    });

    const handleSimulate = (product) => {
        navigate('/simulation', { state: { product } });
    };

    const handlePriceEditSubmit = (productName) => {
        if (tempPrice && !isNaN(tempPrice)) {
            updateProductPrice(productName, parseFloat(tempPrice));
        }
        setEditingPriceUser(null);
        setTempPrice('');
    };

    const handleAddNewProductSubmit = () => {
        if (!newProduct['Product Name'] || !newProduct['Cost Price'] || !newProduct['Selling Price']) return;
        addProduct(newProduct);
        setIsAddingMode(false);
        setNewProduct({
            'Product Name': '', 'Cost Price': '', 'Selling Price': '', 'Market Price': '', 'Market Demand': '', 'Quantity': '', 'Days in Inventory': '0'
        });
    };

    const handleRecordDaily = (e) => {
        e.preventDefault();
        const product = products.find(p => p['Product Name'] === dailyEntry.productName);
        if (!product || !dailyEntry.units) return;

        if (logMode === 'sale') {
            const currentPrice = parseFloat(product['Selling Price']);
            const calculatedRevenue = parseInt(dailyEntry.units) * currentPrice;
            recordDailySales(dailyEntry.productName, dailyEntry.units, calculatedRevenue);
            alert(`Recorded ${dailyEntry.units} sales for ${product['Product Name']}. Stock subtracted.`);
        } else {
            replenishStock(dailyEntry.productName, dailyEntry.units);
            alert(`Replenished ${dailyEntry.units} units for ${product['Product Name']}. Stock added.`);
        }

        setDailyEntry({ productName: '', units: '' });
    };

    const selectedProduct = products.find(p => p['Product Name'] === dailyEntry.productName);

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto font-sans">
            <header className="mb-10 border-b border-beige-300 pb-6 flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-sage-900 tracking-tight">Product Catalog</h1>
                    <p className="text-sage-500 font-sans mt-2 tracking-wide font-medium">Analyze and simulate individual SKUs within your portfolio.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAddingMode(!isAddingMode)}
                        className="bg-sage-700 hover:bg-sage-600 text-white px-5 py-2.5 rounded-xl shadow-soft font-semibold transition text-sm flex items-center gap-2"
                    >
                        {isAddingMode ? 'Cancel' : '+ Add SKU'}
                    </button>
                    <div className="text-sm font-semibold text-sage-500 bg-white px-4 py-2.5 border border-beige-300 rounded-xl shadow-soft flex items-center">
                        {products.length} Active SKUs
                    </div>
                </div>
            </header>

            {/* Enhanced Entry Form: Sales + Replenish */}
            <div className={`bg-white p-8 rounded-2xl shadow-soft border transition-all duration-500 mb-10 ${logMode === 'sale' ? 'border-beige-500/50' : 'border-blue-200 bg-blue-50/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-sage-800 flex items-center gap-2">
                        Inventory Ledger
                        <span className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${logMode === 'sale' ? 'bg-sage-100 text-sage-700' : 'bg-blue-100 text-blue-700'}`}>
                            {logMode === 'sale' ? 'Sales Update' : 'Stock Replenish'}
                        </span>
                    </h2>
                    <div className="flex bg-beige-100 p-1 rounded-xl border border-beige-200">
                        <button
                            onClick={() => setLogMode('sale')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${logMode === 'sale' ? 'bg-white text-sage-800 shadow-sm' : 'text-sage-400'}`}
                        >
                            Sold (-)
                        </button>
                        <button
                            onClick={() => setLogMode('replenish')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${logMode === 'replenish' ? 'bg-blue-600 text-white shadow-sm' : 'text-sage-400'}`}
                        >
                            Added (+)
                        </button>
                    </div>
                </div>

                <form onSubmit={handleRecordDaily} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="text-xs font-bold text-sage-400 uppercase tracking-widest mb-2 block ml-1">Identify SKU</label>
                        <select
                            value={dailyEntry.productName}
                            onChange={e => setDailyEntry({ ...dailyEntry, productName: e.target.value })}
                            className="w-full p-4 rounded-xl border border-beige-300 bg-beige-50 text-sm focus:ring-2 ring-sage-500 outline-none transition"
                        >
                            <option value="">Select SKU to Update</option>
                            {products.map(p => <option key={p['Product Name']} value={p['Product Name']}>{p['Product Name']}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-sage-400 uppercase tracking-widest mb-2 block ml-1">{logMode === 'sale' ? 'Quantity Sold' : 'Refill Amount'}</label>
                        <input
                            type="number" placeholder={logMode === 'sale' ? "Units sold today..." : "Quantity to add..."}
                            value={dailyEntry.units} onChange={e => setDailyEntry({ ...dailyEntry, units: e.target.value })}
                            className="w-full p-4 rounded-xl border border-beige-300 text-sm focus:ring-2 ring-sage-500 outline-none transition placeholder-sage-300"
                        />
                    </div>
                    <button className={`font-bold rounded-xl transition shadow-md text-sm py-4 h-[54px] flex items-center justify-center gap-2 group ${logMode === 'sale' ? 'bg-sage-600 hover:bg-sage-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        {logMode === 'sale' ? (
                            <><svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Log Sales</>
                        ) : (
                            <><svg className="w-4 h-4 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Update Stock</>
                        )}
                    </button>

                    {selectedProduct && dailyEntry.units && (
                        <div className={`md:col-span-3 text-xs font-semibold mt-2 p-3 rounded-lg border animate-fade-in ${logMode === 'sale' ? 'bg-sage-50 text-sage-600 border-sage-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {logMode === 'sale' ? (
                                <>Update Impact: {selectedProduct['Quantity']} → <span className="text-sage-800 font-bold">{Math.max(0, parseInt(selectedProduct['Quantity']) - parseInt(dailyEntry.units))}</span> units | Revenue Potential: <span className="text-sage-800 font-bold">${(parseInt(dailyEntry.units) * parseFloat(selectedProduct['Selling Price'])).toFixed(2)}</span></>
                            ) : (
                                <>Update Impact: {selectedProduct['Quantity']} → <span className="text-blue-800 font-bold">{parseInt(selectedProduct['Quantity']) + parseInt(dailyEntry.units)}</span> units | SKU age will be reset to 0 days.</>
                            )}
                        </div>
                    )}
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-beige-500/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap font-sans">
                        <thead className="bg-beige-50 text-sage-500 uppercase text-[10px] font-bold tracking-widest border-b border-beige-300">
                            <tr>
                                <th className="px-6 py-5">Product Identifier</th>
                                <th className="px-6 py-5 text-right">Cost Basis</th>
                                <th className="px-6 py-5 text-right">Inventory Depth</th>
                                <th className="px-6 py-5 text-right">Market Average</th>
                                <th className="px-6 py-5 text-right">Demand Index</th>
                                <th className="px-6 py-5 text-right">Selling Price</th>
                                <th className="px-6 py-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-beige-300/50 text-sm">
                            {isAddingMode && (
                                <tr className="bg-sage-50 transition duration-300 border-b-2 border-sage-200">
                                    <td className="px-6 py-4">
                                        <input type="text" placeholder="SKU Name" className="w-full px-4 py-2 rounded-lg border border-beige-300 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                                            value={newProduct['Product Name']} onChange={e => setNewProduct({ ...newProduct, 'Product Name': e.target.value })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" placeholder="Cost" className="w-24 float-right px-4 py-2 rounded-lg border border-beige-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sage-400"
                                            value={newProduct['Cost Price']} onChange={e => setNewProduct({ ...newProduct, 'Cost Price': e.target.value })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" placeholder="Qty" className="w-24 float-right px-4 py-2 rounded-lg border border-beige-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sage-400"
                                            value={newProduct['Quantity']} onChange={e => setNewProduct({ ...newProduct, 'Quantity': e.target.value })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" placeholder="Market" className="w-24 float-right px-4 py-2 rounded-lg border border-beige-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sage-400"
                                            value={newProduct['Market Price']} onChange={e => setNewProduct({ ...newProduct, 'Market Price': e.target.value })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" step="0.1" placeholder="Demand" className="w-24 float-right px-4 py-2 rounded-lg border border-beige-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sage-400"
                                            value={newProduct['Market Demand']} onChange={e => setNewProduct({ ...newProduct, 'Market Demand': e.target.value })} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" placeholder="Price" className="w-24 float-right px-4 py-2 rounded-lg border border-beige-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sage-400 font-bold text-sage-800"
                                            value={newProduct['Selling Price']} onChange={e => setNewProduct({ ...newProduct, 'Selling Price': e.target.value })} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={handleAddNewProductSubmit} className="bg-sage-600 text-white px-5 py-2 rounded-lg text-xs font-bold transition hover:bg-sage-700 shadow-sm">Confirm</button>
                                    </td>
                                </tr>
                            )}

                            {products.map((product, idx) => (
                                <tr key={idx} className="hover:bg-beige-50/60 transition duration-300 group">
                                    <td className="px-6 py-6 font-semibold text-sage-900 group-hover:text-sage-700">{product['Product Name']}</td>
                                    <td className="px-6 py-6 text-right text-sage-500 font-opensans text-sm font-medium">${parseFloat(product['Cost Price'] || 0).toFixed(2)}</td>
                                    <td className="px-6 py-6 text-right text-sage-600">
                                        <span className="bg-beige-200 px-3 py-1 rounded-lg text-xs font-bold border border-beige-300 font-opensans">{product['Quantity'] || 0}</span>
                                    </td>
                                    <td className="px-6 py-6 text-right text-sage-500 font-opensans text-sm font-medium">${parseFloat(product['Market Price'] || 0).toFixed(2)}</td>
                                    <td className="px-6 py-6 text-right">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-opensans ${parseFloat(product['Market Demand']) > 0.7 ? 'bg-[#f4f8f4] border-[#dcebdc] text-[#558455]' : parseFloat(product['Market Demand']) < 0.4 ? 'bg-[#fdf4f4] border-[#f5dede] text-[#a46565]' : 'bg-beige-100 border-beige-300 text-sage-600'}`}>
                                            {parseFloat(product['Market Demand'] || 0).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right font-bold text-sage-800 font-opensans text-sm cursor-pointer hover:bg-beige-100/50 rounded transition"
                                        onClick={() => {
                                            setEditingPriceUser(product['Product Name']);
                                            setTempPrice(product['Selling Price']);
                                        }}>
                                        {editingPriceUser === product['Product Name'] ? (
                                            <div className="flex flex-col items-end gap-1" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sage-500 font-opensans">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-24 px-2 py-1 border border-sage-400 rounded text-right focus:outline-none focus:ring-2 focus:ring-sage-500 font-opensans bg-white shadow-inner"
                                                        value={tempPrice}
                                                        autoFocus
                                                        onChange={(e) => setTempPrice(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handlePriceEditSubmit(product['Product Name'])}
                                                        onBlur={() => handlePriceEditSubmit(product['Product Name'])}
                                                    />
                                                </div>
                                                <div className="text-[9px] font-bold text-sage-500 bg-sage-50 px-2 py-0.5 rounded border border-sage-200 animate-pulse">
                                                    Suggested: ${computeRecommendedPrice(product, 0.3).toFixed(2)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="border-b border-dashed border-sage-300 hover:border-sage-600 px-1 py-0.5 font-opensans" title="Click to edit">${parseFloat(product['Selling Price'] || 0).toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleSimulate(product)}
                                                className="bg-white border border-sage-700 text-sage-700 hover:bg-sage-700 hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition duration-300"
                                            >
                                                Analyze
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product['Product Name'])}
                                                className="bg-[#fcfbf9] border border-[#f5dede] text-[#a46565] hover:bg-[#fdf4f4] px-3 py-1.5 rounded-full text-xs font-bold transition duration-300"
                                            >
                                                Del
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
