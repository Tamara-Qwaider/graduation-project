import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Interests() {
  const navigate = useNavigate();
  const location = useLocation();

  const interestsList = [
    "Restaurants 🍔",
    "Cafes ☕",
    "Travel ✈️",
    "Sports ⚽",
    "Shopping 🛍️",
    "Nature 🌿",
    "Movies 🎬",
    "Music 🎵"
  ];

  const [selected, setSelected] = useState(() => {
    return JSON.parse(localStorage.getItem("interests")) || [];
  });

  const toggleInterest = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleSave =async () => {
    if (selected.length === 0) {
      alert("Please select at least one interest!");
      return;
    }

  try {
  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("http://localhost:5000/api/auth/interests", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      interests: selected,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to save interests");
    return;
  }

  localStorage.setItem("interests", JSON.stringify(selected));
  localStorage.setItem("hasInterests", "true");
  localStorage.setItem("user", JSON.stringify(data.user));

  if (location.state?.fromProfile) {
    navigate("/profile");
  } else {
    navigate("/home");
  }
} catch (err) {
  alert("Server error");
}
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)",
        color: "white",
        padding: "20px"
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>
        Choose Your Interests 🎯
      </h1>

      <p style={{ color: "rgba(255,255,255,0.6)" }}>
        Pick what you love to get better suggestions
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "30px",
          marginTop: "30px",
          maxWidth: "700px"
        }}
      >
        {interestsList.map((item, index) => (
          <div
            key={item}
            onClick={() => toggleInterest(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.background = selected.includes(item)
                ? "linear-gradient(to right, #4e219b, #e66000)"
                : "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = selected.includes(item)
                ? "linear-gradient(to right, #4e219b, #e66000)"
                : "rgba(255,255,255,0.08)";
            }}
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "14px",
              cursor: "pointer",
              background: selected.includes(item)
                ? "linear-gradient(to right, #4e219b, #e66000)"
                : "rgba(255,255,255,0.08)",
              border: selected.includes(item)
                ? "2px solid rgba(255,255,255,0.8)"
                : "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              transition: "0.3s ease",
              boxShadow: selected.includes(item)
                ? "0 0 15px rgba(230,96,0,0.5)"
                : "none",
              animation: `float ${3 + (index % 3)}s ease-in-out infinite`
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 0 25px rgba(255,138,0,0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.3)";
        }}
        style={{
          marginTop: "40px",
          padding: "12px 30px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(to right, #4e219b, #e66000)",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "0.25s ease",
          boxShadow: "0 6px 15px rgba(0,0,0,0.3)"
        }}
      >
        Save & Continue
      </button>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>
    </div>
  );
}

export default Interests;