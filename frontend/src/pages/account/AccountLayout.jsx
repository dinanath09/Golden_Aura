// src/pages/account/AccountLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AccountLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const linkBase =
    "block px-3 py-2 rounded-lg text-sm transition-colors";
  const activeClasses = "bg-amber-50 text-amber-700";
  const inactiveClasses = "text-zinc-700 hover:bg-zinc-50";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl border bg-white p-6 h-fit flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-3">My Account</h3>
            <nav className="space-y-2">
              <NavLink
                to="/account"
                end
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
              >
                Profile
              </NavLink>

              <NavLink
                to="/account/security"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
              >
                Security
              </NavLink>

              <NavLink
                to="/account/addresses"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
              >
                Addresses
              </NavLink>

              <NavLink
                to="/account/orders"
                className={({ isActive }) =>
                  `${linkBase} ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
              >
                Orders
              </NavLink>

              {isAdmin && (
                <>
                  <div className="pt-3 border-t mt-3 text-xs uppercase tracking-wide text-zinc-400">
                    Admin
                  </div>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `${linkBase} ${
                        isActive ? activeClasses : inactiveClasses
                      }`
                    }
                  >
                    Admin dashboard
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="rounded-2xl border bg-white p-6">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
