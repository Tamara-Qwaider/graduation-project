import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Interests() {
  const navigate = useNavigate();

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

  const [selected, setSelected] = useState([]);

  const toggleInterest = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleSave = () => {
    if (selected.length === 0) {
      alert("Please select at least one interest!");
      return;
    }

    localStorage.setItem("interests", JSON.stringify(selected));
    localStorage.setItem("hasInterests", "true");

    navigate("/home");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, #9333ea, #020617 60%), radial-gradient(circle at 80% 80%, #f97316, transparent)",
        color: "white",
        padding: "20px"
      }}
    >
      <h1>Choose Your Interests 🎯</h1>
      

      {/* 🟣 الفقاعات */}
      <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "35px",
    marginTop: "30px",
    maxWidth: "700px"
  }}
>
  {interestsList.map((item, index) => (
    <div
      key={item}
      onClick={() => toggleInterest(item)}
      onMouseEnter={(e) =>
        (e.target.style.transform = "scale(1.1)")
      }
      onMouseLeave={(e) =>
        (e.target.style.transform = "scale(1)")
      }
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
          ? "linear-gradient(to right, #7c3aed, #ec4899)"
          : "rgba(255,255,255,0.1)",
        border: selected.includes(item)
          ? "2px solid white"
          : "1px solid rgba(255,255,255,0.2)",
        transition: "0.3s",
        animation: `float ${3 + (index % 3)}s ease-in-out infinite`
      }}
    >
      {item}
    </div>
  ))}
</div>


      {/* زر الحفظ */}
      <button
        onClick={handleSave}
        style={{
          marginTop: "40px",
          padding: "12px 30px",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(to right, #7c3aed, #ec4899)",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Save & Continue
      </button>
    </div>
  );
}

export default Interests;