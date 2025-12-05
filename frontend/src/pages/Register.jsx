// src/pages/Register.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    cpassword: "",
    agree: true,
  });

  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- validators ----------
  const nameClean = (v) => v.replace(/[^A-Za-z\s]/g, ""); // allow only letters + spaces
  const isValidName = (v) => {
    const t = (v || "").trim();
    return t.length >= 2 && /^[A-Za-z][A-Za-z\s]+[A-Za-z]$/.test(t); // at least 2 letters and no leading/trailing spaces-only
  };

  // require gmail only
  const isValidGmail = (v) => {
    if (!v) return false;
    return /^[^\s@]+@gmail\.com$/i.test(v.trim());
  };

  // Indian mobile pattern (start 6-9, total 10 digits)
  const isValidMobile = (v) => /^[6-9][0-9]{9}$/.test((v || "").trim());

  // password strength score 0..5
  const strength = useMemo(() => {
    const p = form.password || "";
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }, [form.password]);

  // reactive per-field errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    cpassword: "",
    agree: "",
  });

  // ---------- field handlers ----------
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "name") {
      // remove disallowed characters immediately
      const cleaned = nameClean(value);
      setForm((s) => ({ ...s, name: cleaned }));
      setErrors((prev) => ({ ...prev, name: validateField("name", cleaned) }));
      return;
    }
    if (name === "agree") {
      setForm((s) => ({ ...s, agree: checked }));
      setErrors((prev) => ({ ...prev, agree: validateField("agree", checked) }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setMsg("");
  };

  const validateField = (field, value) => {
    value = value ?? "";
    switch (field) {
      case "name":
        if (!value.trim()) return "Please enter your full name.";
        if (!isValidName(value)) return "Name must be letters and spaces only (min 2 letters).";
        return "";
      case "email":
        if (!value.trim()) return "Email is required.";
        if (!isValidGmail(value)) return "Please use a valid @gmail.com address.";
        return "";
      case "mobile":
        if (!value.trim()) return "Mobile number is required.";
        if (!/^[0-9]+$/.test(value.trim())) return "Mobile must contain digits only.";
        if (!isValidMobile(value)) return "Enter a valid 10-digit mobile starting with 6-9.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password should be at least 8 characters.";
        if (strength < 3) return "Use a stronger password (include upper/lower/digit/symbol).";
        return "";
      case "cpassword":
        if (!value) return "Confirm your password.";
        if (value !== form.password) return "Passwords do not match.";
        return "";
      case "agree":
        if (!value) return "You must accept Terms & Privacy.";
        return "";
      default:
        return "";
    }
  };

  const validateAll = () => {
    const next = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      mobile: validateField("mobile", form.mobile),
      password: validateField("password", form.password),
      cpassword: validateField("cpassword", form.cpassword),
      agree: validateField("agree", form.agree),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!validateAll()) {
      setMsg("Please fix the errors above.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        password: form.password,
      });
      setMsg("✅ Account created successfully! Redirecting to login…");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      const serverMsg = err?.response?.data?.message || "Registration failed — try again.";
      setMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // enable submit only when all client-side validations pass
  const canSubmit = useMemo(() => {
    return (
      isValidName(form.name) &&
      isValidGmail(form.email) &&
      isValidMobile(form.mobile) &&
      form.password.length >= 8 &&
      form.password === form.cpassword &&
      form.agree &&
      strength >= 3
    );
  }, [form, strength]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur border border-amber-100 shadow-lg rounded-2xl p-8 space-y-4"
        noValidate
      >
        <h1 className="text-3xl font-bold text-center">
          Join <span className="text-amber-600">Golden Aura</span>
        </h1>
        <p className="text-center text-sm text-zinc-600 mb-4">Discover your signature fragrance today.</p>

        {/* Name */}
        <div>
          <input
            name="name"
            placeholder="Full Name (letters & spaces only)"
            value={form.name}
            onChange={onChange}
            className={`w-full border rounded-lg px-3 py-2 ${errors.name ? "border-rose-400" : "border-zinc-200"}`}
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
          />
          {errors.name && <div className="text-rose-600 text-sm mt-1">{errors.name}</div>}
        </div>

        {/* Email */}
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email (must be @gmail.com)"
            value={form.email}
            onChange={onChange}
            className={`w-full border rounded-lg px-3 py-2 ${errors.email ? "border-rose-400" : "border-zinc-200"}`}
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
          />
          {errors.email && <div className="text-rose-600 text-sm mt-1">{errors.email}</div>}
        </div>

        {/* Mobile */}
        <div>
          <input
            name="mobile"
            type="tel"
            placeholder="Mobile Number (10 digits)"
            value={form.mobile}
            onChange={(e) => {
              // allow only digits while typing
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((s) => ({ ...s, mobile: digits }));
              setErrors((prev) => ({ ...prev, mobile: validateField("mobile", digits) }));
            }}
            className={`w-full border rounded-lg px-3 py-2 ${errors.mobile ? "border-rose-400" : "border-zinc-200"}`}
            autoComplete="tel"
            required
            aria-invalid={!!errors.mobile}
          />
          {errors.mobile && <div className="text-rose-600 text-sm mt-1">{errors.mobile}</div>}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder="Password (min 8 chars)"
            value={form.password}
            onChange={onChange}
            className={`w-full border rounded-lg px-3 py-2 pr-12 ${errors.password ? "border-rose-400" : "border-zinc-200"}`}
            required
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-600"
          >
            {showPwd ? "Hide" : "Show"}
          </button>

          <div className="mt-2 h-1 w-full bg-zinc-100 rounded">
            <div
              className={`h-1 rounded ${strength <= 2 ? "bg-red-400" : strength === 3 ? "bg-yellow-400" : "bg-green-500"}`}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
          {errors.password && <div className="text-rose-600 text-sm mt-1">{errors.password}</div>}
        </div>

        {/* Confirm password */}
        <div>
          <input
            name="cpassword"
            type={showPwd ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.cpassword}
            onChange={onChange}
            className={`w-full border rounded-lg px-3 py-2 ${errors.cpassword ? "border-rose-400" : "border-zinc-200"}`}
            required
            aria-invalid={!!errors.cpassword}
          />
          {errors.cpassword && <div className="text-rose-600 text-sm mt-1">{errors.cpassword}</div>}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={(e) => {
              setForm((s) => ({ ...s, agree: e.target.checked }));
              setErrors((prev) => ({ ...prev, agree: validateField("agree", e.target.checked) }));
            }}
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="text-amber-700 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-amber-700 underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.agree && <div className="text-rose-600 text-sm mt-1">{errors.agree}</div>}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className={`w-full py-2 text-white font-semibold rounded-lg transition ${
            loading || !canSubmit ? "bg-amber-200 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          {loading ? "Creating…" : "Create Account"}
        </button>

        {msg && <p className={`text-sm text-center ${msg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{msg}</p>}

        <p className="text-sm text-center text-zinc-600">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-700 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
