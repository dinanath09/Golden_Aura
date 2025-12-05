// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ProtectedRoute, AdminRoute } from "./components/Routes.jsx";

import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import AccountLayout from "./pages/account/AccountLayout.jsx";
import Profile from "./pages/account/Profile.jsx";
import Security from "./pages/account/Security.jsx";
import Addresses from "./pages/account/Addresses.jsx";
import Orders from "./pages/account/Orders.jsx";
import Wishlist from "./pages/account/Wishlist.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import StoreSettings from "./pages/admin/StoreSettings.jsx";
import AdminProducts from "./pages/admin/Products.jsx";

function NotFound() {
  return <div className="py-16 text-center text-zinc-600">Page not found</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-6xl mx-auto px-4 py-8">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* User Dashboard */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="security" element={<Security />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wishlist" element={<Wishlist />} />
            </Route>

            {/* Admin only */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="store" element={<StoreSettings />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
