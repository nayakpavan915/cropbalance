import { Sprout } from "lucide-react";

// Green header + white card, shared by the Login and Register pages.
export default function AuthLayout({ heading, children }) {
  return (
    <div className="auth-shell">
      <header className="hero">
        <div className="hero-logo">
          <Sprout size={40} />
        </div>
        <h1>CropBalance</h1>
        <p>Plan together. Harvest smarter.</p>
      </header>

      <main className="card auth-card">
        <h2 className="card-title">{heading}</h2>
        {children}
      </main>
    </div>
  );
}