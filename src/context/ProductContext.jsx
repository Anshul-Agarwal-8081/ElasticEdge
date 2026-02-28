import React, { createContext, useState, useEffect } from 'react';
import Tabletop from 'tabletop';

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

    useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    const fetchFromSheet = (url) => {
        setLoading(true);
        try {
            Tabletop.init({
                key: url,
                callback: (data, tabletop) => {
                    if (data && data.length > 0) {
                        setProducts(data);
                    } else {
                        console.error("No data found or invalid sheet. Using mock data.");
                        setProducts(MOCK_DATA);
                    }
                    setLoading(false);
                },
                simpleSheet: true
            });
        } catch (err) {
            console.error("Tabletop error, using mock data:", err);
            setProducts(MOCK_DATA);
            setLoading(false);
        }

        // Fallback if Tabletop hangs or fails silently
        setTimeout(() => {
            setLoading(false);
            if (products.length === 0) {
                setProducts(MOCK_DATA);
            }
        }, 5000);
    };

    const login = (userData, sheetUrl) => {
        setUser(userData);
        if (sheetUrl) {
            fetchFromSheet(sheetUrl);
        } else if (products.length === 0) {
            setProducts(MOCK_DATA);
        }
    };

    const logout = () => {
        setUser(null);
        setProducts([]);
        localStorage.removeItem('user');
        localStorage.removeItem('products');
    };

    const updateProductPrice = (productName, newPrice) => {
        setProducts(prev => prev.map(p =>
            p['Product Name'] === productName ? { ...p, 'Selling Price': newPrice.toString() } : p
        ));
    };

    return (
        <ProductContext.Provider value={{ products, user, loading, login, logout, updateProductPrice }}>
            {children}
        </ProductContext.Provider>
    );
};
