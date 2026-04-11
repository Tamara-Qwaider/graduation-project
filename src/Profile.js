import { useState } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    name: "Sarah Anderson",
    location: "Amman",
    joined: "January 2022",
    image:
      "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?auto=format&fit=crop&w=500&q=80",
  });

  const suggested = [
    {
      name: "Cafe Bliss",
      location: "Abdali",
      image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    },
    {
      name: "Sky Lounge",
      location: "Downtown",
      image:
        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
    },
    {
      name: "Green Park",
      location: "Amman",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
  ];

  const saved = [
    {
      name: "Rumi Cafe",
      location: "Weibdeh",
      image:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
    },
    {
      name: "Taj Mall",
      location: "Abdoun",
      image:
        "https://images.unsplash.com/photo-1515169067865-5387ec356754",
    },
  ];

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    setIsEditing(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #9333ea, #020617 60%), radial-gradient(circle at 80% 80%, #f97316, transparent)",
        color: "white",
        padding: "30px",
      }}
    >
      <div style={{ display: "flex", gap: "30px" }}>
        
        {/* 🟣 LEFT SIDE */}
        <div
          style={{
            width: "30%",
            position: "sticky",
            top: "20px",
            height: "fit-content",
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168,85,247,0.4)",
            padding: "20px",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow:
              "0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(236,72,153,0.3), inset 0 0 20px rgba(255,255,255,0.05)",
          }}
        >
          <img
            src={user.image}
            alt="profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "15px",
              border: "3px solid #a855f7",
              boxShadow: "0 0 15px #a855f7, 0 0 30px #ec4899",
            }}
          />

          {isEditing ? (
            <>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                name="location"
                value={user.location}
                onChange={handleChange}
                style={inputStyle}
              />

              <button onClick={saveChanges} style={saveBtn}>
                Save
              </button>
            </>
          ) : (
            <>
              <h2>{user.name}</h2>
              <p style={{ color: "#cbd5f5" }}>{user.location}</p>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                Joined {user.joined}
              </p>

              <button
                onClick={() => setIsEditing(true)}
                style={editBtn}
              >
                Edit Profile ✏️
              </button>
            </>
          )}

          
        </div>

        {/* 🔵 RIGHT SIDE */}
        <div style={{ width: "70%" }}>
          <h2>Suggested Places</h2>

          <div style={grid}>
            {suggested.map((item, i) => (
              <Card key={i} item={item} />
            ))}
          </div>

          <h2 style={{ marginTop: "40px" }}>Saved Places</h2>

          <div style={grid}>
            {saved.map((item, i) => (
              <Card key={i} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Card Component */
function Card({ item }) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: "15px",
        overflow: "hidden",
        transition: "0.3s",
        boxShadow: "0 0 10px rgba(168,85,247,0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow =
          "0 0 25px rgba(168,85,247,0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 0 10px rgba(168,85,247,0.2)";
      }}
    >
      <img
        src={item.image}
        alt=""
        style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
        }}
      />
      <div style={{ padding: "10px" }}>
        <h4>{item.name}</h4>
        <p style={{ color: "#cbd5f5", fontSize: "12px" }}>
          {item.location}
        </p>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "10px",
  background: "#020617",
  border: "1px solid #475569",
  color: "white",
};

const saveBtn = {
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(to right, #22c55e, #4ade80)",
  color: "white",
  cursor: "pointer",
};

const editBtn = {
  marginTop: "10px",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "1px solid #7c3aed",
  background: "transparent",
  color: "#c084fc",
  cursor: "pointer",
};



const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginTop: "20px",
};

export default Profile;