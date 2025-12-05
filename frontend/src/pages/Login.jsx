import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.email.trim()) return setMsg("Enter your email.");
    if (!form.password.trim()) return setMsg("Enter your password.");

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      await login({
        token: res.data.token,
        user: res.data.user,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setMsg(
        err?.response?.data?.message || "Invalid login details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/90 backdrop-blur border border-amber-100 shadow-lg rounded-2xl p-8 space-y-4"
        autoComplete="off"
      >
        {/* Trick for Chrome auto-fill */}
        <input type="text" name="fakeUser" autoComplete="username" className="hidden" />
        <input type="password" name="fakePass" autoComplete="new-password" className="hidden" />

        <h1 className="text-3xl font-bold text-center">
          Welcome Back to <span className="text-amber-600">Golden Aura</span>
        </h1>
        <p className="text-center text-sm text-zinc-600">
          Sign in to explore your favorite perfumes.
        </p>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="new-email"
          className="w-full border rounded-lg px-3 py-2 bg-blue-50"
        />

        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            className="w-full border rounded-lg px-3 py-2 bg-blue-50 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600"
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>

        {msg && (
          <p className="text-red-600 text-sm text-center">{msg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-sm text-center text-zinc-700">
          Don’t have an account?{" "}
          <Link to="/register" className="text-amber-700 font-medium">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
