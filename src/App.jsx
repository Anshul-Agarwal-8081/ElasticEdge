import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Simulation from './pages/Simulation';
import Workspace from './pages/Workspace';
import Navbar from './components/Navbar';
import { ProductProvider, ProductContext } from './context/ProductContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(ProductContext);
  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-beige-100 font-sans">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ProductProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/inventory" element={
            <PrivateRoute>
              <AppLayout>
                <Inventory />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/simulation" element={
            <PrivateRoute>
              <AppLayout>
                <Simulation />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/workspace" element={
            <PrivateRoute>
              <AppLayout>
                <Workspace />
              </AppLayout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ProductProvider>
  );
}
