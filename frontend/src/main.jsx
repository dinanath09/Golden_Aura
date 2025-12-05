// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";

import App from "./App.jsx";

// Context Providers
import AuthProvider from "./context/AuthContext.jsx";
import CartProvider from "./context/CartContext.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
