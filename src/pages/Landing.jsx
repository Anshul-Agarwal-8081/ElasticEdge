import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';

export default function Landing() {
    const [isLogin, setIsLogin] = useState(false);
    const { login, loading } = useContext(ProductContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        stage: 'Growing and Scaling',
        sheetUrl: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLogin && formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        login({
            username: formData.username || formData.email.split('@')[0],
            email: formData.email,
            stage: formData.stage
        }, formData.sheetUrl);

        setTimeout(() => {
            navigate('/dashboard');
        }, 100);
    };

    return (
        <div className="min-h-screen bg-sage-700 font-sans flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-sage-600 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-sage-800 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="bg-beige-100 p-10 md:p-14 rounded-[2rem] shadow-soft-lg max-w-lg w-full border border-beige-300 relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-serif font-bold text-sage-900 mb-3 tracking-tight">
                        Pricing<span className="text-sage-500 italic">Sim</span>
                    </h1>
                    <p className="text-sage-600 text-lg font-light tracking-wide">Align your strategies with market reality.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sage-800 mb-2 text-sm font-semibold tracking-wide">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full bg-white text-sage-900 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 transition border border-beige-300 placeholder-beige-900/50"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sage-800 mb-2 text-sm font-semibold tracking-wide">Work Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-white text-sage-900 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 transition border border-beige-300 placeholder-beige-900/50"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sage-800 mb-2 text-sm font-semibold tracking-wide">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-white text-sage-900 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 transition border border-beige-300 placeholder-beige-900/50"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="animate-fade-in-up">
                                <label className="block text-sage-800 mb-2 text-sm font-semibold tracking-wide">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full bg-white text-sage-900 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 transition border border-beige-300 placeholder-beige-900/50"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="animate-fade-in-up">
                                <label className="block text-sage-800 mb-3 text-sm font-semibold tracking-wide">Organization Stage</label>
                                <div className="flex flex-col space-y-3 bg-beige-200/50 p-4 rounded-xl border border-beige-300/50">
                                    {['Growing and Scaling', 'Sales', 'Established Business'].map((stage) => (
                                        <label key={stage} className="flex items-center space-x-3 text-sage-900 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="stage"
                                                    value={stage}
                                                    checked={formData.stage === stage}
                                                    onChange={handleChange}
                                                    className="peer appearance-none w-5 h-5 border-2 border-sage-400 rounded-full checked:border-sage-700 transition"
                                                />
                                                <div className="absolute inset-0 w-full h-full rounded-full bg-sage-700 scale-0 peer-checked:scale-[0.5] transition-transform duration-200"></div>
                                            </div>
                                            <span className="text-sm font-medium group-hover:text-sage-700 transition">{stage}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="animate-fade-in-up">
                                <label className="block text-sage-800 mb-2 text-sm font-semibold tracking-wide">
                                    Public Sheet URL <span className="text-sage-500 font-normal ml-1">(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    name="sheetUrl"
                                    className="w-full bg-white text-sage-900 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 transition border border-beige-300 placeholder-beige-900/40"
                                    value={formData.sheetUrl}
                                    onChange={handleChange}
                                    placeholder="https://docs.google.com/spreadsheets..."
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-sage-700 hover:bg-sage-800 text-beige-100 font-bold py-4 px-6 rounded-xl hover:shadow-soft-lg transform hover:-translate-y-0.5 transition duration-200 text-lg tracking-wide"
                    >
                        {loading ? 'Initializing...' : isLogin ? 'Access Dashboard' : 'Launch Setup'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-beige-300/60 pt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sage-600 hover:text-sage-900 text-sm font-semibold transition tracking-wide"
                    >
                        {isLogin ? 'Create an organization account' : 'Sign in to existing workspace'}
                    </button>
                </div>
            </div>
        </div>
    );
}
