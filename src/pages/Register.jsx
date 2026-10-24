import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, MapPin, User, UserPlus } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { REGIONS } from "../utils/regions";
import { friendlyAuthError } from "../utils/authErrors";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    district: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout heading="Create your farmer account">
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Full name</span>
          <div className="input-wrap">
            <User className="input-icon" size={20} />
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              maxLength={60}
              autoComplete="name"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>State</span>
          <div className="input-wrap">
            <MapPin className="input-icon" size={20} />
            <select value={form.location} onChange={update("location")} required>
              <option value="">Select your state</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="field">
          <span>District (optional)</span>
          <div className="input-wrap">
            <MapPin className="input-icon" size={20} />
            <input
              type="text"
              value={form.district}
              onChange={update("district")}
              maxLength={60}
            />
          </div>
        </label>

        <label className="field">
          <span>Email</span>
          <div className="input-wrap">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Password (at least 6 characters)</span>
          <div className="input-wrap has-toggle">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
              minLength={6}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="toggle-pw"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>

        <button className="btn-primary" type="submit" disabled={submitting}>
          <UserPlus size={20} />
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}