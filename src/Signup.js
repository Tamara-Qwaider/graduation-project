import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    const user = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    localStorage.setItem("user", JSON.stringify(user));

    navigate("/interests");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(circle at 20% 20%, #9333ea, #020617 60%), radial-gradient(circle at 80% 80%, #f97316, transparent)"
    }}>
      
      <div style={{ width: "100%", maxWidth: "400px" }}>
        
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1 style={{
              fontSize: "40px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #c084fc, #f472b6)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Kashta
            </h1>
          </Link>
          <p style={{ color: "#e2e8f0" }}>
            Discover amazing places, meet new people
          </p>
        </div>

        {/* Card */}
        <div style={{
          padding: "30px",
          borderRadius: "20px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          
          <h2 style={{
            color: "white",
            textAlign: "center",
            marginBottom: "10px"
          }}>
            Create Account 🚀
          </h2>

          <p style={{
            color: "#e2e8f0",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            Start exploring amazing places
          </p>

          {/* Form */}
          <form onSubmit={handleSignup}>
            
            {/* Name */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "#ddd" }}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",
                  background: "#020617",
                  border: "1px solid #475569",
                  color: "white"
                }}
                required
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "#ddd" }}>Email</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",
                  background: "#020617",
                  border: "1px solid #475569",
                  color: "white"
                }}
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "#ddd" }}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "5px",
                  borderRadius: "10px",
                  background: "#020617",
                  border: "1px solid #475569",
                  color: "white"
                }}
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(to right, #7c3aed, #ec4899)",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s"
              }}
              onMouseOver={(e) => (e.target.style.opacity = "0.8")}
              onMouseOut={(e) => (e.target.style.opacity = "1")}
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div style={{
            textAlign: "center",
            margin: "20px 0",
            color: "#aaa"
          }}>
            OR
          </div>

          {/* Google */}
          <button style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #555",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            cursor: "pointer"
          }}>
            Continue with Google
          </button>

          {/* Login */}
          <p style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#aaa"
          }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "#c084fc" }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          color: "#777",
          fontSize: "12px",
          marginTop: "20px"
        }}>
          Join thousands discovering the best places in town
        </p>
      </div>
    </div>
  );
}