import { useState } from "react";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ validation
    if (!identifier || !password) {
      setError("Please fill all fields");
      return;
    }




    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await res.json();
      console.log("LOGIN DATA:", data);
      console.log("USER ROLE:", data.user?.role);

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      if (data.user.isBlocked) {
        setError("Your account has been blocked by admin");
        return;
      }



      // 🔥 التعديل هنا: نضمن وجود الـ id بشكل صريح داخل كائن المستخدم ليعمل البروفايل
      const userToStore = {
        ...data.user,
        id: data.user._id || data.user.id // التوافق مع backend بوجود _id أو id
      };
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userToStore));
      setError("");
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError("Server error");
    }

  };

  const handleSignup = () => {
    navigate("/signup");
  };
  const handleForgotPassword = async () => {
  try {
    if (!identifier) {
      setError("Enter your email first");
      return;
    }

    await sendPasswordResetEmail(auth, identifier);

    setMessage("Password reset email sent 📩");
    setError("");
  } catch (err) {
    setError("Failed to send reset email");
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #a855f7, #ff8a00)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            VIBE
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
            background: "rgba(78, 33, 155, 0.35)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
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
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
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
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
            />
            <p
              onClick={handleForgotPassword}
              style={{
                color: "#c084fc",
                marginTop: "10px",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "right",
              }}
            >
              Forgot Password?
            </p>

            {error && (
              <p style={{ color: "#f87171", marginTop: "10px", fontSize: "14px" }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ color: "#4ade80", marginTop: "10px", fontSize: "14px" }}>
                {message}
             </p>
            )}

            <button
              type="submit"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 0 25px rgba(230,96,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.3)";
              }}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "15px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(to right, #4e219b, #e66000)",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.25s ease",
                boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
              }}
            >
              Sign In
            </button>
          </form>

          <p
            onClick={handleSignup}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.color = "#ffa94d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.color = "#ff8a00";
            }}
            style={{
              textAlign: "center",
              marginTop: "15px",
              color: "#ff8a00",
              cursor: "pointer",
              transition: "0.25s ease",
              fontWeight: "500",
            }}
          >
            Create account
          </p>
        </div>
      </div>
    </div>
  );
}