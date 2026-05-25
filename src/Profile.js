import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; 
import Navbar from "./Navbar";
import { auth } from "./firebase";
import { signOut, deleteUser } from "firebase/auth";
import { Menu } from "lucide-react";

const api = axios; 

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); 
  const [hostedCount, setHostedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const storedUserData = localStorage.getItem("user");
        if (!storedUserData || storedUserData === "undefined") {
          navigate("/login");
          return;
        }

        const storedUser = JSON.parse(storedUserData);
        if (storedUser && !id) {
          setUser(prev => ({ ...prev, ...storedUser }));
        }

        const userId = id || storedUser?.id || storedUser?._id;
        const userName = storedUser?.name;
        
        if (!userId || userId === "undefined") {
          return;
        }

        const res = await api.get(
          `http://localhost:5000/api/users/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data) {
          setUser(res.data);
          if (!id) {
            localStorage.setItem("user", JSON.stringify(res.data));
          }
        }

        const meetupsRes = await api.get(
          "http://localhost:5000/api/meetups",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (meetupsRes.data) {
          if (userName) {
            const myHostedMeetups = meetupsRes.data.filter(m => m.createdBy === userName);
            setHostedCount(myHostedMeetups.length);
          }

          const myJoinedMeetups = meetupsRes.data.filter(m => 
            (m.attendees && m.attendees.includes(userId)) || 
            (m.attendees && m.attendees.includes(userName))
          );
          setJoinedCount(myJoinedMeetups.length);
        }

      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    
    fetchProfileAndStats();
  }, [navigate, id, token]);

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const isMyProfile = !id || id === (loggedUser?.id || loggedUser?._id);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  // 🛠️ استراتيجية الحذف الذكية: توليد صورة شفافة ورفعها لإنهاء تحكم السيرفر بالصورة القديمة
  const handleRemoveImage = async () => {
    if (!window.confirm("Are you sure you want to delete your profile photo permanently?")) return;

    try {
      // 1. صناعة صورة بيكسل واحد شفاف بصيغة PNG برمجياً وتحويلها لملف جاهز للرفع
      const transparentPixelBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const response = await fetch(transparentPixelBase64);
      const blob = await response.blob();
      const transparentFile = new File([blob], "transparent_placeholder.png", { type: "image/png" });

      // 2. إعداد الـ FormData لرفع الصورة الشفافة كملف حقيقي للسيرفر لكي يقبله مجبراً
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("location", user.location);
      formData.append("bio", user.bio);
      formData.append("image", transparentFile); 

      const res = await api.put(
        `http://localhost:5000/api/users/profile/update/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data) {
        // 3. تصفير الحقول محلياً فوراً
        setSelectedFile(null);
        setImagePreview("REMOVE_PREVIEW");
        
        let updatedUser = res.data.user || user;
        // وضع وسم محلي للتعرف على الصورة الشفافة
        updatedUser.image = "TRANSPARENT_DELETED"; 
        
        setUser(prev => ({ ...prev, image: "TRANSPARENT_DELETED" }));

        const currentLocal = JSON.parse(localStorage.getItem("user")) || {};
        currentLocal.image = "TRANSPARENT_DELETED";
        localStorage.setItem("user", JSON.stringify(currentLocal));
        
        alert("Profile photo removed successfully! 🗑️");
      }
    } catch (err) {
      console.error("Delete Image Error:", err);
      alert("Could not remove the photo from server.");
    }
  };

  const removePlace = async (placeId) => {
    try {
      if (!window.confirm("Are you sure you want to remove this place from your saved list?")) return;

      const updatedPlaces = user.savedPlaces.filter(p => p._id !== placeId);
      
      const res = await api.put(
        `http://localhost:5000/api/users/profile/update/${user._id}`,
        { savedPlaces: updatedPlaces },
        {
           headers: {
              Authorization: `Bearer ${token}`,
           },
        }
      );

      if (res.data) {
        setUser(prev => ({ ...prev, savedPlaces: updatedPlaces }));
        const currentLocal = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...currentLocal, savedPlaces: updatedPlaces }));
        alert("Place removed successfully! ✨");
      }
    } catch (err) {
      console.error("Remove Place Error:", err);
      alert("Could not remove the place.");
    }
  };

  const saveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("location", user.location);
      formData.append("bio", user.bio);
      
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await api.put(
        `http://localhost:5000/api/users/profile/update/${user._id}`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.user) {
        let updatedUser = res.data.user;
        setUser(updatedUser);
        setIsEditing(false);
        setSelectedFile(null);
        setImagePreview("");
        alert("Profile Updated Successfully! ✨");
        
        const currentLocal = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...currentLocal, ...updatedUser }));
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Update failed!");
    }
  };

  // فحص ما إذا كانت الصورة صالحة أم أنها الصورة الشفافة المحذوفة
  const displayImage = imagePreview === "REMOVE_PREVIEW" ? "" : (imagePreview || user.image);
  
  const hasValidImage = displayImage && 
                        displayImage.trim() !== "" && 
                        displayImage !== "TRANSPARENT_DELETED" &&
                        !displayImage.includes("transparent_placeholder.png") &&
                        !displayImage.includes("unsplash.com");

  const finalImageSrc = hasValidImage 
    ? (displayImage.startsWith("blob:") || displayImage.startsWith("http") ? displayImage : `http://localhost:5000${displayImage}`)
    : "";
  
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete(
        `http://localhost:5000/api/users/${user._id}`,
        { 
          headers: {
             Authorization: `Bearer ${token}`,
          },
        }
      );

      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  const toggleSavedPlacesVisibility = async () => {
  try {
    const newVisibility =
      (user.savedPlacesVisibility || "private") === "public"
        ? "private"
        : "public";

    const res = await api.put(
      `http://localhost:5000/api/users/profile/update/${user._id}`,
      {
        savedPlacesVisibility: newVisibility,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.user) {
      const updatedUser = {
        ...res.data.user,
        savedPlacesVisibility: newVisibility,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

    }
  } catch (err) {
    console.error("Visibility update error:", err);
    alert("Could not update saved places privacy.");
  }
};

  return (
    <div style={containerStyle}>
      {isMyProfile && (
        <div style={{ position: "absolute", top: "25px", right: "25px", zIndex: 100 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
            }}
          >
            <Menu size={20} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                background: "#1e1b4b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                overflow: "hidden",
                minWidth: "180px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            >
              <button 
              onClick={() => navigate("/history")} 
              style={menuItemStyle} 
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                 "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow =
                  "0 0 18px rgba(255,255,255,0.12)";
                e.currentTarget.style.transform =
                  "translateX(4px) scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform =
                  "translateX(0px) scale(1)";
              }}>
                Meetup History
              </button>

              <button 
                onClick={handleLogout} 
                style={menuItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow =
                    "0 0 18px rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform =
                    "translateX(4px) scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform =
                    "translateX(0px) scale(1)";
                }} 
              >
                Logout 
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  ...menuItemStyle,
                  color: "#ff6b6b",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow =
                    "0 0 18px rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform =
                    "translateX(4px) scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform =
                    "translateX(0px) scale(1)";
                }}
              >
                Delete Account 
              </button>
            </div>
          )}
        </div>
      )}
      <div style={{ marginBottom: "20px" }}>
        <Navbar />
      </div>

      <div style={layoutWrapper}>
        
        {/* LEFT COLUMN */}
        <div style={leftColumn}>
          <div style={glassCard}>
            <div style={profileImageContainer}>
              
              {hasValidImage ? (
                <img 
                  src={finalImageSrc} 
                  alt="profile" 
                  style={profileImgStyle} 
                />
              ) : (
                <div style={emptyAvatarStyle}>
                  👤
                </div>
              )}
              
              {isEditing && (
                <>
                  <label style={cameraIconStyle} title="Upload New Photo">
                    📷 <input type="file" onChange={handleFileChange} style={{display:"none"}} accept="image/*" />
                  </label>

                  {hasValidImage && (
                    <button 
                      onClick={handleRemoveImage} 
                      style={deleteImageIconStyle} 
                      title="Remove Current Photo"
                    >
                      🗑️
                    </button>
                  )}
                </>
              )}
            </div>

            {isEditing ? (
              <div style={editFormStyle}>
                <input style={inputStyle} value={user.name} onChange={(e)=>setUser({...user, name: e.target.value})} placeholder="Name" />
                <input style={inputStyle} value={user.location} onChange={(e)=>setUser({...user, location: e.target.value})} placeholder="Location" />
                <textarea style={textareaStyle} value={user.bio} onChange={(e)=>setUser({...user, bio: e.target.value})} placeholder="Bio" />
                <button onClick={saveChanges} style={saveBtnStyle}>Save Changes</button>
                <button onClick={() => { setIsEditing(false); setImagePreview(""); setSelectedFile(null); }} style={cancelBtnStyle}>Cancel</button>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: "8px", fontWeight: "700" }}>{user.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 10px 0" }}> {user.location ? `📍 ${user.location}` : "No location added yet"}</p>
                <p style={joinedTextStyle}>Joined {user.joined || "January 2022"}</p>
                
                {isMyProfile && (
                  <>
                    <button onClick={() => setIsEditing(true)} style={editBtnStyle}>Edit Profile ✏️</button>
                    <button onClick={() => navigate("/interests")} style={interestBtnStyle}>Edit Interests 🎯</button>
                  </>
                )}
              </>
            )}
          </div>

          <div style={statsGrid}>
            <StatBox count={user.savedPlaces?.length || 0} label="Saved" />
            <StatBox count={joinedCount} label="Joined" /> 
            <StatBox count={hostedCount} label="Hosted" /> 
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={rightColumn}>
          <SectionBox title="About Me">
            <p style={bodyText}>{user.bio || "No bio added yet."}</p>
          </SectionBox>

          <SectionBox title="My Interests">
            <div style={chipsWrap}>
              {Array.isArray(user.interests) && user.interests.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span key={index} style={chipStyle}>{interest}</span>
                ))
              ) : (
                <p style={bodyText}>No interests selected yet.</p>
              )}
            </div>
          </SectionBox>

          {(isMyProfile || user.savedPlacesVisibility === "public") ? (
            <SectionBox
              title={
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Saved Places ❤️</span>

                 {isMyProfile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSavedPlacesVisibility();
                      }}
                      style={privacyBtnStyle}
                    >
                      {(user.savedPlacesVisibility || "private") === "public"
                        ? "Public 🌍"
                        : "Private 🔒"}
                    </button>
                 )}
                </div>
              }
            > 
            <div style={placesGrid}>
              {user.savedPlaces && user.savedPlaces.length > 0 ? (
                user.savedPlaces.map((place, i) => (
                  <div key={i} style={placeCardStyle}>
                    <div style={{ position: "relative" }}>
                      <img src={place.image} alt={place.name} style={placeImgStyle} />
                      {isMyProfile && (
                        <button 
                          onClick={() => removePlace(place._id)} 
                          style={removeBtnStyle}
                          title="Remove Place"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <h4 style={{ margin: "0 0 4px 0", color: "#fff" }}>{place.name}</h4>
                      <p style={placeLocStyle}>📍 {place.location}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={bodyText}>No saved places yet. Go to Home to add some!</p>
              )}
            </div>
          </SectionBox>
        ) : (
          <SectionBox title="Saved Places 🔒">
            <p style={bodyText}>This user's saved places are private.</p>
          </SectionBox>
        )}
        </div>
      </div>
      
      {showDeleteModal && (
        <div style={modalOverlayStyle}>
          <div style={deleteModalStyle}>
            <h2>Delete Account?</h2>
            <p> Deleting your account will permanently remove your profile, saved places, meetups, and all your data.</p>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setShowDeleteModal(false)} style={cancelDeleteBtnStyle}>
                Cancel
              </button>

              <button onClick={handleDeleteAccount} style={confirmDeleteBtnStyle}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

// --- ALL STYLES ---
const containerStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #130f53, #1e1b4b, #020617)", color: "white", padding: "30px", fontFamily: "'Poppins', sans-serif" };
const layoutWrapper = { display: "flex", gap: "30px", alignItems: "flex-start", maxWidth: "1200px", margin: "0 auto" };
const leftColumn = { width: "32%", position: "sticky", top: "20px" };
const rightColumn = { width: "68%", display: "flex", flexDirection: "column", gap: "22px" };
const glassCard = { background: "rgba(78, 33, 155, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", padding: "30px 24px", borderRadius: "24px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.4)" };
const profileImageContainer = { position: "relative", width: "130px", height: "130px", margin: "0 auto 20px" };
const profileImgStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #ff6b00", boxShadow: "0 0 20px rgba(255,107,0,0.5)" };
const cameraIconStyle = { position: "absolute", bottom: "5px", right: "5px", background: "#ff6b00", borderRadius: "50%", padding: "7px", cursor: "pointer", fontSize: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 3 };
const deleteImageIconStyle = { position: "absolute", bottom: "5px", left: "5px", background: "#dc2626", border: "none", borderRadius: "50%", padding: "7px", cursor: "pointer", fontSize: "14px", color: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 3 };
const emptyAvatarStyle = { width: "100%", height: "100%", borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)", border: "3px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "rgba(255, 255, 255, 0.4)" };
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
const placesGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "18px" };
const placeCardStyle = { background: "rgba(0, 0, 0, 0.2)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", position: "relative" };
const placeImgStyle = { width: "100%", height: "130px", objectFit: "cover" };
const placeLocStyle = { color: "rgba(255,255,255,0.6)", fontSize: "12px", margin: 0 };
const removeBtnStyle = { position: "absolute", top: "8px", right: "8px", background: "rgba(255, 50, 50, 0.8)", color: "white", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", zIndex: 2 };
const menuItemStyle = {width: "100%",padding: "14px 18px",background: "transparent",border: "none",color: "white",textAlign: "left",cursor: "pointer",fontSize: "14px",transition: "all 0.25s ease",};
const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const deleteModalStyle = { width: "90%", maxWidth: "420px", background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "22px", padding: "28px", color: "white", textAlign: "center" };
const cancelDeleteBtnStyle = { flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer" };
const confirmDeleteBtnStyle = { flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#dc2626", color: "white", cursor: "pointer", fontWeight: "bold" };
const privacyBtnStyle = {
  padding: "7px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
};

export default Profile;