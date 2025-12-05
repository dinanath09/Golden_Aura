// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { api } from "../lib/api";

/* ----------------------- constants & helpers ----------------------- */
const STORAGE = { TOKEN: "token", USER: "user", CART: "cart" };
const hasWindow = () => typeof window !== "undefined";
const safeParse = (json) => {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};
const getInitialToken = () =>
  hasWindow() ? window.localStorage.getItem(STORAGE.TOKEN) || "" : "";
const getInitialUser = () =>
  hasWindow() ? safeParse(window.localStorage.getItem(STORAGE.USER)) : null;

/* ------------------------------ context ---------------------------- */
const AuthCtx = createContext(undefined);
AuthCtx.displayName = "AuthContext";

/** SAFE hook: never throws; returns benign defaults if provider not ready */
export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  return (
    ctx ?? {
      token: "",
      user: null,
      isAdmin: false,
      setUser: () => {},
      login: async () => {},
      logout: () => {},
    }
  );
};

/* ----------------------------- provider ---------------------------- */
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(getInitialUser);

  // keep axios header in sync
  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common.Authorization;
    } else if (api && api.defaults && api.defaults.headers) {
      // fallback: ensure header removed
      if (api.defaults.headers.common) delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // persist token/user
  useEffect(() => {
    if (!hasWindow()) return;
    try {
      if (token) localStorage.setItem(STORAGE.TOKEN, token);
      else localStorage.removeItem(STORAGE.TOKEN);
    } catch {
      /* ignore storage errors */
    }
  }, [token]);

  useEffect(() => {
    if (!hasWindow()) return;
    try {
      if (user) localStorage.setItem(STORAGE.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE.USER);
    } catch {
      /* ignore storage errors */
    }
  }, [user]);

  // cross-tab sync
  useEffect(() => {
    if (!hasWindow()) return;
    const onStorage = (e) => {
      try {
        if (e.key === STORAGE.TOKEN) setToken(e.newValue || "");
        if (e.key === STORAGE.USER) setUser(safeParse(e.newValue));
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /**
   * login({ token, user })
   * - Updates state/localStorage and axios header.
   * - Does NOT perform navigation (router-free).
   */
  const login = useCallback(async ({ token: t = "", user: u = null } = {}) => {
    setToken(t || "");
    setUser(u ?? null);

    if (t) {
      try {
        if (hasWindow()) localStorage.setItem(STORAGE.TOKEN, t);
      } catch {}
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    } else {
      if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
        delete api.defaults.headers.common.Authorization;
      } else {
        try {
          if (api?.defaults?.headers?.common) delete api.defaults.headers.common.Authorization;
        } catch {
          /* ignore */
        }
      }
    }

    if (u) {
      try {
        if (hasWindow()) localStorage.setItem(STORAGE.USER, JSON.stringify(u));
      } catch {}
    } else {
      try {
        if (hasWindow()) localStorage.removeItem(STORAGE.USER);
      } catch {}
    }
  }, []);

  /**
   * logout()
   * - Clears token/user state, localStorage and axios header.
   * - Does NOT perform navigation (router-free).
   */
  const logout = useCallback(() => {
    setToken("");
    setUser(null);

    if (hasWindow()) {
      try {
        localStorage.removeItem(STORAGE.TOKEN);
        localStorage.removeItem(STORAGE.USER);
      } catch {}
    }

    // safe deletion of header (avoid using optional chaining with delete)
    try {
      if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
        delete api.defaults.headers.common.Authorization;
      } else if (api && api.defaults && api.defaults.headers) {
        if (api.defaults.headers.common) delete api.defaults.headers.common.Authorization;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const isAdmin = Boolean(user?.role === "admin");

  const value = useMemo(
    () => ({ token, user, isAdmin, setUser, login, logout }),
    [token, user, isAdmin, login, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
