import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export default function SignupPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email format");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
   }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

  // إذا الإيميل انرسل مسبقًا
  if (verificationSent) {

    await auth.currentUser.reload();

    if (auth.currentUser.emailVerified) {
      await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      localStorage.removeItem("interests");
      localStorage.removeItem("hasInterests");

      navigate("/interests");

    } else {

      setError("Please verify your email first 📩");

    }

    return;
  }

  // إنشاء الحساب لأول مرة
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await sendEmailVerification(userCredential.user);

  setVerificationSent(true);

  const res = await fetch("http://localhost:5000/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      interests: [],
      firebaseUID: userCredential.user.uid,
      emailVerified: false,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message || "Signup failed");
    return;
  }

  setMessage(
  "Verification email sent 📩 Please verify then press Continue"
);
 setError("");

} catch (err) {

  if (err.code === "auth/email-already-in-use") {
    setError("Email already exists");

  } else if (err.code === "auth/invalid-email") {
    setError("Invalid email");

  } else if (err.code === "auth/weak-password") {
    setError("Password should be at least 6 characters");

  } else {
    setError(err.message);
  }
}
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      
      background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)"
    }}>
      
      <div style={{ width: "100%", maxWidth: "400px" }}>
        
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1 style={{
              fontSize: "40px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #a855f7, #ff8a00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Kashta
            </h1>
          </Link>

          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            Discover amazing places, meet new people
          </p>
        </div>

        {/* Card */}
        <div style={{
          padding: "30px",
          borderRadius: "20px",
          background: "rgba(78, 33, 155, 0.35)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}>
          
          <h2 style={{
            color: "white",
            textAlign: "center",
            marginBottom: "10px"
          }}>
            Create Account 🚀
          </h2>

          <p style={{
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            Start exploring amazing places
          </p>

          <form onSubmit={handleSignup}>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "rgba(255,255,255,0.8)" }}>Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",

                  // 🔥 inputs موحدة
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "rgba(255,255,255,0.8)" }}>Email</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "rgba(255,255,255,0.8)" }}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "rgba(255,255,255,0.8)" }}>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white"
                }}
              />
            </div>

            {error && (
              <p style={{ color: "#f87171", marginBottom: "10px", fontSize: "14px" }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ 
                color: "#4ade80",
                marginBottom: "10px",
                fontSize: "14px"
              }}>
                {message}
             </p>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",

                
                background: "linear-gradient(to right, #4e219b, #e66000)",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "0.25s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 0 25px rgba(230,96,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(230,96,0,0.4)";
              }}
            >
              {verificationSent ? "Continue" : "Create Account"}
            </button>
          </form>

          <p style={{
            textAlign: "center",
            marginTop: "20px",
            color: "rgba(255,255,255,0.6)"
          }}>
            Already have an account?{" "}
            <Link
              to="/"
              style={{
                color: "#ff8a00",
                textDecoration: "none",
                transition: "0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.display = "inline-block";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}