import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Interests() {
  const navigate = useNavigate();
  const location = useLocation();

  const interestsList = ["Restaurants 🍔", "Cafes ☕", "Travel ✈️", "Sports ⚽", "Shopping 🛍️", "Nature 🌿", "Movies 🎬", "Music 🎵"];

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

  const handleSave = async () => {
    if (selected.length === 0) {
      alert("Please select at least one interest!");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id || storedUser?._id;

      if (!userId) {
        alert("User session not found. Please login again.");
        return;
      }

      // إرسال الطلب للمسار الجديد الذي سنضيفه في الـ Backend
      const res = await fetch("http://localhost:5000/api/auth/interests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, interests: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save");
        return;
      }

      // تحديث البيانات محلياً (ضروري جداً للمزامنة)
      localStorage.setItem("interests", JSON.stringify(selected));
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data.user, interests: selected }));
      localStorage.setItem("hasInterests", "true");

      alert("Interests updated! ✨");
      navigate(location.state?.fromProfile ? "/profile" : "/home");
    } catch (err) {
      alert("Server connection error!");
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "10px" }}>Choose Your Interests 🎯</h1>
      <p style={{ color: "rgba(255,255,255,0.6)" }}>Pick what you love to get better suggestions</p>

      <div style={gridStyle}>
        {interestsList.map((item, index) => (
          <div
            key={item}
            onClick={() => toggleInterest(item)}
            style={{
              ...bubbleStyle,
              background: selected.includes(item) ? "linear-gradient(to right, #4e219b, #e66000)" : "rgba(255,255,255,0.08)",
              border: selected.includes(item) ? "2px solid rgba(255,255,255,0.8)" : "1px solid rgba(255,255,255,0.15)",
              boxShadow: selected.includes(item) ? "0 0 15px rgba(230,96,0,0.5)" : "none",
              animation: `float ${3 + (index % 3)}s ease-in-out infinite`
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <button onClick={handleSave} style={saveBtnStyle}>Save & Continue</button>

      <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
    </div>
  );
}

// Styles
const containerStyle = { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)", color: "white", padding: "20px", fontFamily: "'Poppins', sans-serif" };
const gridStyle = { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "30px", marginTop: "30px", maxWidth: "700px" };
const bubbleStyle = { width: "130px", height: "130px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "14px", cursor: "pointer", backdropFilter: "blur(10px)", transition: "0.3s ease" };
const saveBtnStyle = { marginTop: "40px", padding: "12px 30px", borderRadius: "12px", border: "none", background: "linear-gradient(to right, #4e219b, #e66000)", color: "white", fontWeight: "bold", cursor: "pointer", boxShadow: "0 6px 15px rgba(0,0,0,0.3)" };

export default Interests;