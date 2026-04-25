import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [interests, setInterests] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);

  const [user, setUser] = useState({
    name: "Sarah Anderson",
    location: "Amman, Jordan",
    joined: "January 2022",
    bio: "Love discovering cozy cafes, cultural landmarks, and peaceful places for weekend meetups.",
    image:
      "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?auto=format&fit=crop&w=500&q=80",
  });

  useEffect(() => {
    const savedInterests = JSON.parse(localStorage.getItem("interests")) || [];
    setInterests(savedInterests);

    const storedPlaces = JSON.parse(localStorage.getItem("savedPlaces")) || [];
    setSavedPlaces(storedPlaces);
  }, []);

  const joinedActivities =
    JSON.parse(localStorage.getItem("currentActivities")) || [];
  const allMeetups =
  JSON.parse(localStorage.getItem("meetups")) || [];

const loggedInUser =
  JSON.parse(localStorage.getItem("user")) || {};

const hostedMeetups = allMeetups.filter(
  (meetup) => meetup.createdBy === loggedInUser.name
);
 const stats = [
  { label: "Hosted", value: hostedMeetups.length },
  { label: "Joined", value: joinedActivities.length },
  { label: "Saved", value: savedPlaces.length },
];

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    setIsEditing(false);
  };

  const removeSavedPlace = (id) => {
    const updatedPlaces = savedPlaces.filter((place) => place.id !== id);
    setSavedPlaces(updatedPlaces);
    localStorage.setItem("savedPlaces", JSON.stringify(updatedPlaces));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)",
        color: "white",
        padding: "30px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <Navbar />
      </div>

      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            width: "30%",
            position: "sticky",
            top: "20px",
          }}
        >
          <div
            style={{
              background: "rgba(78, 33, 155, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "24px",
              borderRadius: "24px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <img
            src={user.image}
            alt="profile"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
             }}
            onMouseLeave={(e) => {
             e.currentTarget.style.transform = "scale(1)";
            }}
           style={{
            display: "block",           // 🔥 مهم
            margin: "0 auto 15px",      // 🔥 هذا الذي يوسّطها
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
             border: "3px solid #ff6b00",
            boxShadow: "0 0 15px rgba(255,107,0,0.6)",
            transition: "0.25s ease",
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
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  style={textareaStyle}
                />

                <button onClick={saveChanges} style={saveBtn}>
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: "8px" }}>{user.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>
                  {user.location}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: "8px",
                  }}
                >
                  Joined {user.joined}
                </p>

                <button
                  onClick={() => setIsEditing(true)}
                  style={editBtn}
                >
                  Edit Profile ✏️
                </button>

                <button
                  onClick={() =>
                    navigate("/interests", { state: { fromProfile: true } })
                  }
                  style={interestBtn}
                >
                  Edit Interests 🎯
                </button>
              </>
            )}
          </div>

          {/* STATS */}
          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(78, 33, 155, 0.45)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  padding: "14px 10px",
                  textAlign: "center",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#ff8a00",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            width: "70%",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          {/* ABOUT */}
          <SectionBox title="About Me">
            <p style={bodyText}>{user.bio}</p>
          </SectionBox>

          {/* INTERESTS */}
          <SectionBox title="My Interests">
            {interests.length > 0 ? (
              <div style={chipsWrap}>
                {interests.map((item, index) => (
                  <span key={index} style={chipStyle}>
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p style={bodyText}>No interests selected yet.</p>
            )}
          </SectionBox>

          {/* SAVED PLACES */}
          <SectionBox title="Saved Places">
            {savedPlaces.length > 0 ? (
              <div style={grid}>
                {savedPlaces.map((item, i) => (
                  <Card
                    key={i}
                    item={item}
                    onRemove={() => {
                      const confirmed = window.confirm("Remove this place?");
                      if (confirmed) {
                        removeSavedPlace(item.id);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <p style={bodyText}>No saved places yet.</p>
            )}
          </SectionBox>
        </div>
      </div>
    </div>
  );
}

function SectionBox({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(78, 33, 155, 0.45)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "22px",
        padding: "22px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "16px",
          fontWeight: "800",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Card({ item, onRemove }) {
  return (
    <div
      style={{
        position: "relative",
        background: "rgba(78, 33, 155, 0.6)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "0.3s",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow =
          "0 12px 30px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.25)";
      }}
    >
      <button
        onClick={onRemove}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(0,0,0,0.45)",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          zIndex: 2,
        }}
      >
        ✕
      </button>

      <img
        src={item.image}
        alt={item.name}
        style={{
          width: "100%",
          height: "160px",
          objectFit: "cover",
        }}
      />

      <div style={{ padding: "12px" }}>
        <h4 style={{ margin: "0 0 6px 0" }}>{item.name}</h4>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "12px",
            margin: 0,
          }}
        >
          {item.location}
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  minHeight: "90px",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
  resize: "none",
};

const saveBtn = {
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(to right, #e66000, #ff8a00)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const editBtn = {
  marginTop: "14px",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  cursor: "pointer",
};

const interestBtn = {
  marginTop: "10px",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(to right, #e66000, #ff8a00)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
  marginTop: "10px",
};

const chipsWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const chipStyle = {
  padding: "10px 16px",
  borderRadius: "999px",
  background: "rgba(230,96,0,0.2)",
  border: "1px solid rgba(230,96,0,0.4)",
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
};

const bodyText = {
  color: "rgba(255,255,255,0.8)",
  lineHeight: "1.7",
  margin: 0,
};

export default Profile;