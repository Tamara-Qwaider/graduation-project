import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/home");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, #9333ea, #020617 60%), radial-gradient(circle at 80% 80%, #f97316, transparent)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #c084fc, #f472b6)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Kashta
          </h1>
          <p style={{ color: "#e2e8f0" }}>
            Discover amazing places, meet new people
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            padding: "30px",
            borderRadius: "20px",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <h2 style={{ color: "white", textAlign: "center" }}>
            Welcome Back 👋
          </h2>

          <p style={{ color: "#e2e8f0", textAlign: "center" }}>
            Sign in to continue your journey
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                borderRadius: "10px",
                background: "#020617",
                border: "1px solid #475569",
                color: "white",
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "10px",
                borderRadius: "10px",
                background: "#020617",
                border: "1px solid #475569",
                color: "white",
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(to right, #7c3aed, #ec4899)",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 0 15px rgba(168,85,247,0.7)",
              }}
            >
              Sign In
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "15px",
              color: "#c084fc",
              cursor: "pointer",
            }}
            onClick={handleSignup}
          >
            Create account
          </p>
        </div>
      </div>
    </div>
  );
}