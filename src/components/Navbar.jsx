import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';

export default function Navbar() {
    const { user, logout } = useContext(ProductContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <nav className="bg-beige-100 text-sage-900 px-6 py-4 border-b border-beige-500 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-2xl font-serif font-bold tracking-tight text-sage-700 hover:text-sage-800 transition">
                    DynamicPricing<span className="text-sage-400 font-sans font-medium text-xl ml-1">Sim</span>
                </Link>
                <div className="space-x-6 flex items-center text-sm font-medium">
                    <Link to="/dashboard" className="text-sage-700 hover:text-sage-500 transition">Dashboard</Link>
                    <Link to="/inventory" className="text-sage-700 hover:text-sage-500 transition">Inventory</Link>
                    <Link to="/workspace" className="text-sage-700 hover:text-sage-500 transition">Workspace</Link>

                    <div className="h-4 w-px bg-beige-900/30 mx-2"></div>

                    <span className="font-semibold text-sage-900 bg-sage-200/50 px-3 py-1 rounded-full">{user.username || user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="border border-sage-700 text-sage-700 hover:bg-sage-700 hover:text-beige-100 px-4 py-1.5 rounded-full transition text-sm font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
