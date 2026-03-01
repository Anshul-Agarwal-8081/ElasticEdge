import React, { createContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../supabaseClient';
import { getMarketSignals, calculateActualDemand } from '../utils/marketAi';

export const ProductContext = createContext();

const MOCK_DATA = [
    { "Product Name": "Widget A", "Cost Price": "10", "Selling Price": "15", "Market Price": "14", "Market Demand": "0.8", "Days in Inventory": "20", "Quantity": "100" },
    { "Product Name": "Gizmo B", "Cost Price": "20", "Selling Price": "30", "Market Price": "25", "Market Demand": "0.6", "Days in Inventory": "45", "Quantity": "60" },
    { "Product Name": "Thingamajig C", "Cost Price": "5", "Selling Price": "4", "Market Price": "6", "Market Demand": "0.3", "Days in Inventory": "60", "Quantity": "200" },
    { "Product Name": "Doo-dad D", "Cost Price": "50", "Selling Price": "75", "Market Price": "70", "Market Demand": "0.9", "Days in Inventory": "10", "Quantity": "30" }
];

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('products');
        return saved ? JSON.parse(saved) : [];
    });
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [intelAnalysis, setIntelAnalysis] = useState({});
    const [dailyActuals, setDailyActuals] = useState(() => {
        const saved = localStorage.getItem('dailyActuals');
        return saved ? JSON.parse(saved) : {};
    });

    // Persist and Sync Effect
    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('dailyActuals', JSON.stringify(dailyActuals));

        if (user && user.email && !loading) {
            syncToSupabase(user.email, user.password, products, dailyActuals);
        }
    }, [products, user, loading, dailyActuals]);

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    const syncToSupabase = async (email, password, inventory, actuals) => {
        if (!supabase) return;

        setSyncing(true);
        try {
            const payload = {
                user_email: email,
                inventory_data: inventory,
                daily_actuals: actuals,
                updated_at: new Date()
            };
            if (password) payload.password = password;

            const { error } = await supabase
                .from('user_products')
                .upsert(payload, { onConflict: 'user_email' });
            if (error) throw error;
        } catch (err) {
            console.error("SQL Sync Error:", err.message);
        } finally {
            setSyncing(false);
        }
    };

    const fetchFromSupabase = async (email) => {
        if (!supabase) return null;
        try {
            const { data, error } = await supabase
                .from('user_products')
                .select('inventory_data, password, daily_actuals')
                .eq('user_email', email)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (err) {
            console.error("SQL Fetch Error:", err.message);
            return null;
        }
    };

    const fetchFromSheet = async (url) => {
        setLoading(true);
        try {
            const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) throw new Error("Invalid Spreadsheet URL format.");
            const sheetId = match[1];
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

            const response = await fetch(csvUrl);
            const csvText = await response.text();

            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.data && results.data.length > 0) {
                            setProducts(results.data);
                            resolve(results.data);
                        } else {
                            const d = products.length === 0 ? MOCK_DATA : products;
                            setProducts(d);
                            resolve(d);
                        }
                        setLoading(false);
                    },
                    error: (err) => {
                        console.error(err);
                        const d = products.length === 0 ? MOCK_DATA : products;
                        setProducts(d);
                        setLoading(false);
                        resolve(null);
                    }
                });
            });
        } catch (err) {
            console.error(err);
            if (products.length === 0) setProducts(MOCK_DATA);
            setLoading(false);
            return null;
        }
    };

    const login = async (userData, sheetUrl, password, isLoginMode) => {
        setLoading(true);
        try {
            const cloudResponse = await fetchFromSupabase(userData.email);

            if (cloudResponse) {
                if (isLoginMode) {
                    if (cloudResponse.password && cloudResponse.password !== password) {
                        throw new Error("Incorrect password. Please try again.");
                    }
                }
                if (cloudResponse.inventory_data && cloudResponse.inventory_data.length > 0) {
                    setProducts(cloudResponse.inventory_data);
                }
                if (cloudResponse.daily_actuals) {
                    setDailyActuals(cloudResponse.daily_actuals);
                }
            } else if (sheetUrl) {
                await fetchFromSheet(sheetUrl);
            } else {
                setProducts(MOCK_DATA);
            }

            const activeUser = { ...userData, password };
            setUser(activeUser);

            if (!isLoginMode) {
                await syncToSupabase(userData.email, password, products, dailyActuals);
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setProducts([]);
        setDailyActuals({});
        localStorage.removeItem('user');
        localStorage.removeItem('products');
        localStorage.removeItem('dailyActuals');
    };

    const updateProductPrice = (productName, newPrice) => {
        setProducts(prev => prev.map(p =>
            p['Product Name'] === productName ? { ...p, 'Selling Price': newPrice.toString() } : p
        ));
    };

    const runMarketIntelligenceScan = async () => {
        setSyncing(true);
        const newProducts = [...products];
        const analyses = { ...intelAnalysis };

        for (let i = 0; i < newProducts.length; i++) {
            const p = newProducts[i];
            const signals = await getMarketSignals(p['Product Name']);
            const newDemand = calculateActualDemand(p, signals.interestScore);

            newProducts[i] = { ...p, 'Market Demand': newDemand };
            analyses[p['Product Name']] = signals;
        }

        setProducts(newProducts);
        setIntelAnalysis(analyses);
        setSyncing(false);
    };

    const recordDailySales = (productName, units, revenue) => {
        const today = new Date().toISOString().split('T')[0];

        // Update Actuals Log
        setDailyActuals(prev => ({
            ...prev,
            [productName]: {
                ...(prev[productName] || {}),
                [today]: { units: parseInt(units), revenue: parseFloat(revenue) }
            }
        }));

        // Update Inventory Depth (Quantity)
        setProducts(prev => prev.map(p => {
            if (p['Product Name'] === productName) {
                const currentQty = parseInt(p['Quantity'] || 0);
                const newQty = Math.max(0, currentQty - parseInt(units));
                return { ...p, 'Quantity': newQty.toString() };
            }
            return p;
        }));
    };

    const replenishStock = (productName, units) => {
        setProducts(prev => prev.map(p => {
            if (p['Product Name'] === productName) {
                const currentQty = parseInt(p['Quantity'] || 0);
                const newQty = currentQty + parseInt(units);
                return { ...p, 'Quantity': newQty.toString(), 'Days in Inventory': '0' }; // Reset inventory age on replenishment
            }
            return p;
        }));
    };

    const addProduct = (newProduct) => {
        setProducts(prev => [...prev, newProduct]);
    };

    const deleteProduct = (productName) => {
        setProducts(prev => prev.filter(p => p['Product Name'] !== productName));
        setDailyActuals(prev => {
            const next = { ...prev };
            delete next[productName];
            return next;
        });
    };

    return (
        <ProductContext.Provider value={{
            products, user, loading, syncing, intelAnalysis, dailyActuals,
            login, logout, updateProductPrice, addProduct, deleteProduct, runMarketIntelligenceScan, recordDailySales, replenishStock
        }}>
            {children}
        </ProductContext.Provider>
    );
};
