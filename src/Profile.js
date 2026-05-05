import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const [user, setUser] = useState({
    _id: "",
    name: "",
    location: "",
    bio: "",
    image: "",
    joined: "January 2022",
    interests: [],
    savedPlaces: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id || storedUser?._id;
        
        // 🛑 حماية: إذا لم يوجد ID، توقف فوراً ولا ترسل طلب للسيرفر
        if (!userId || userId === "undefined") {
          console.warn("No valid User ID found.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/users/profile/${userId}`);
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const saveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("location", user.location);
      formData.append("bio", user.bio);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await axios.put(
        `http://localhost:5000/api/users/profile/update/${user._id}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.user) {
        setUser(res.data.user);
        setIsEditing(false);
        alert("Profile Updated Successfully! ✨");
        localStorage.setItem("user", JSON.stringify({
          ...JSON.parse(localStorage.getItem("user")),
          ...res.data.user
        }));
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Update failed!");
    }
  };

  if (loading) return <div style={loadingStyle}>Loading...</div>;

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "20px" }}>
        <Navbar />
      </div>

      <div style={layoutWrapper}>
        
        {/* LEFT COLUMN - التصميم القديم الفخم */}
        <div style={leftColumn}>
          <div style={glassCard}>
            <div style={profileImageContainer}>
              <img 
                src={user.image || "https://via.placeholder.com/150"} 
                alt="profile" 
                style={profileImgStyle} 
              />
              {isEditing && (
                <label style={cameraIconStyle}>
                  📷 <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{display:"none"}} accept="image/*" />
                </label>
              )}
            </div>

            {isEditing ? (
              <div style={editFormStyle}>
                <input style={inputStyle} value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} placeholder="Name" />
                <input style={inputStyle} value={user.location} onChange={(e)=>setUser({...user, location: e.target.value})} placeholder="Location" />
                <textarea style={textareaStyle} value={user.bio} onChange={(e)=>setUser({...user, bio: e.target.value})} placeholder="Bio" />
                <button onClick={saveChanges} style={saveBtnStyle}>Save Changes</button>
                <button onClick={() => setIsEditing(false)} style={cancelBtnStyle}>Cancel</button>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: "8px", fontWeight: "700" }}>{user.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 10px 0" }}>📍 {user.location}</p>
                <p style={joinedTextStyle}>Joined {user.joined || "January 2022"}</p>
                
                <button onClick={() => setIsEditing(true)} style={editBtnStyle}>Edit Profile ✏️</button>
                <button onClick={() => navigate("/interests")} style={interestBtnStyle}>Edit Interests 🎯</button>
              </>
            )}
          </div>

          <div style={statsGrid}>
            <StatBox count={user.savedPlaces?.length || 0} label="Saved" />
            <StatBox count={user.interests?.length || 0} label="Interests" />
            <StatBox count={0} label="Hosted" /> 
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={rightColumn}>
          <SectionBox title="About Me">
            <p style={bodyText}>{user.bio || "No bio added yet."}</p>
          </SectionBox>

          <SectionBox title="My Interests">
            <div style={chipsWrap}>
              {user.interests?.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span key={index} style={chipStyle}>{interest}</span>
                ))
              ) : (
                <p style={bodyText}>No interests selected yet.</p>
              )}
            </div>
          </SectionBox>

          <SectionBox title="Saved Places">
            <div style={placesGrid}>
              {user.savedPlaces?.length > 0 ? (
                user.savedPlaces.map((place, i) => (
                  <div key={i} style={placeCardStyle}>
                    <img src={place.image} alt={place.name} style={placeImgStyle} />
                    <div style={{ padding: "12px" }}>
                      <h4 style={{ margin: "0 0 4px 0" }}>{place.name}</h4>
                      <p style={placeLocStyle}>{place.location}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={bodyText}>No saved places yet.</p>
              )}
            </div>
          </SectionBox>
        </div>

      </div>
    </div>
  );
}

// Sub-components
function StatBox({ count, label }) {
  return (
    <div style={statBoxStyle}>
      <div style={statCountStyle}>{count}</div>
      <div style={statLabelStyle}>{label}</div>
    </div>
  );
}

function SectionBox({ title, children }) {
  return (
    <div style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </div>
  );
}

// --- ALL STYLES (إعادة التصميم البنفسجي الفخم) ---
const containerStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)", color: "white", padding: "30px", fontFamily: "'Poppins', sans-serif" };
const layoutWrapper = { display: "flex", gap: "30px", alignItems: "flex-start", maxWidth: "1200px", margin: "0 auto" };
const leftColumn = { width: "32%", position: "sticky", top: "20px" };
const rightColumn = { width: "68%", display: "flex", flexDirection: "column", gap: "22px" };

const glassCard = { background: "rgba(78, 33, 155, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", padding: "30px 24px", borderRadius: "24px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.4)" };
const profileImageContainer = { position: "relative", width: "130px", height: "130px", margin: "0 auto 20px" };
const profileImgStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #ff6b00", boxShadow: "0 0 20px rgba(255,107,0,0.5)" };
const cameraIconStyle = { position: "absolute", bottom: "5px", right: "5px", background: "#ff6b00", borderRadius: "50%", padding: "7px", cursor: "pointer", fontSize: "14px" };

const editFormStyle = { display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "10px" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", boxSizing: "border-box" };
const textareaStyle = { ...inputStyle, minHeight: "80px", resize: "none" };

const saveBtnStyle = { padding: "11px", width: "100%", borderRadius: "12px", border: "none", background: "linear-gradient(to right, #e66000, #ff8a00)", color: "white", cursor: "pointer", fontWeight: "bold", boxShadow: "0 5px 15px rgba(230,96,0,0.3)" };
const cancelBtnStyle = { background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", marginTop: "10px", fontSize: "13px" };

const joinedTextStyle = { fontSize: "12px", color: "rgba(255,255,255,0.55)", marginBottom: "15px" };
const editBtnStyle = { marginTop: "10px", padding: "11px", width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "white", cursor: "pointer" };
const interestBtnStyle = { marginTop: "12px", padding: "11px", width: "100%", borderRadius: "12px", border: "none", background: "linear-gradient(to right, #e66000, #ff8a00)", color: "white", cursor: "pointer", fontWeight: "bold" };

const statsGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "20px" };
const statBoxStyle = { background: "rgba(78, 33, 155, 0.45)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "14px 10px", textAlign: "center" };
const statCountStyle = { fontSize: "22px", fontWeight: "800", color: "#ff8a00" };
const statLabelStyle = { fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px", textTransform: "uppercase" };

const sectionBoxStyle = { background: "rgba(78, 33, 155, 0.45)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "22px", padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
const sectionTitleStyle = { marginTop: 0, marginBottom: "18px", fontWeight: "800", fontSize: "22px" };
const bodyText = { color: "rgba(255,255,255,0.8)", lineHeight: "1.7", margin: 0 };
const chipsWrap = { display: "flex", flexWrap: "wrap", gap: "10px" };
const chipStyle = { padding: "8px 18px", borderRadius: "20px", background: "rgba(230,96,0,0.15)", border: "1px solid rgba(230,96,0,0.4)", color: "white", fontSize: "13px", fontWeight: "600" };

const placesGrid = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px" };
const placeCardStyle = { background: "rgba(78, 33, 155, 0.6)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" };
const placeImgStyle = { width: "100%", height: "130px", objectFit: "cover" };
const placeLocStyle = { color: "rgba(255,255,255,0.6)", fontSize: "12px", margin: 0 };
const loadingStyle = { color: "#ff8a00", textAlign: "center", marginTop: "100px", fontSize: "20px", fontWeight: "bold" };

export default Profile;