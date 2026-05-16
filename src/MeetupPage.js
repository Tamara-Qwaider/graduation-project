import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./MeetupPage.css";

export default function MeetupPage() {
  /* =========================
      🧠 STATE & REFS
  ========================= */
  const emptyForm = { placeName: "", meetupName: "", date: "", time: "", invitePeople: [], notes: "" };
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState(""); // حالة خاصة ببحث المستخدمين بداخل الـ Dropdown
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false); 
  const [formData, setFormData] = useState(emptyForm);
  const [meetups, setMeetups] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 

  const participantsRef = useRef(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const canCreateMeetup = loggedInUser?.permissions?.createMeetup !== false;
  const canJoinMeetups = loggedInUser?.permissions?.addOthers !== false;

  /* =========================
      📡 API CALLS
  ========================= */
  const fetchMeetups = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/meetups");
      const data = await res.json();
      setMeetups(data);
    } catch (err) { console.error("Fetch error:", err); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const others = res.data.filter(u => u.name !== loggedInUser?.name);
      setAllUsers(others);
    } catch (err) { console.error("Error fetching users:", err); }
  }, [loggedInUser?.name]);

  useEffect(() => { 
    fetchMeetups(); 
    fetchUsers();
  }, [fetchMeetups, fetchUsers]); 

  /* =========================
      ⚙️ HANDLERS
  ========================= */
  const handleCreateMeetup = async () => {
    if (!formData.meetupName || !formData.placeName || !formData.date || !formData.time) {
      return alert("Please fill required fields (Title, Place, Date, Time)");
    }
    
    const newMeetupData = {
      title: formData.meetupName,
      location: formData.placeName,
      date: formData.date,
      time: formData.time,
      invitedPeople: formData.invitePeople,
      notes: formData.notes,
      createdBy: loggedInUser?.name || "Guest",
      attendees: [loggedInUser?.name || "Host"],
      img: `https://picsum.photos/400/250?random=${Math.random()}`
    };

    try {
      const res = await fetch("http://localhost:5000/api/meetups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeetupData),
      });
      if (res.ok) { 
        fetchMeetups(); 
        setIsCreateModalOpen(false);
        setShowInviteDropdown(false); 
        setUserSearchTerm(""); 
        setFormData(emptyForm); 
        alert("Meetup created and invites sent! ✨");
      }
    } catch (err) { console.error("Save Error", err); }
  };

  const handleToggleInvite = (userName) => {
    setFormData(prev => {
      const isInvited = prev.invitePeople.includes(userName);
      return {
        ...prev,
        invitePeople: isInvited 
          ? prev.invitePeople.filter(name => name !== userName)
          : [...prev.invitePeople, userName]
      };
    });
  };

  const handleDeleteMeetup = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this meetup?")) return;
    const res = await fetch(`http://localhost:5000/api/meetups/${id}`, { method: "DELETE" });
    if (res.ok) { setSelectedMeetup(null); fetchMeetups(); }
  };

  const handleJoinMeetup = async (id) => {
    if (!canJoinMeetups) {
      alert("You are not allowed to join meetups");
      return;
    }
    if (!loggedInUser) return alert("Please login first");
    const res = await fetch(`http://localhost:5000/api/meetups/${id}/join`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: loggedInUser.name }),
    });
    if (res.ok) {
      alert("Joined successfully! 🎉");
      fetchMeetups();
      setSelectedMeetup(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  /* =========================
      🖥️ RENDER
  ========================= */
  return (
    <div className="app meetup-page-bg">
      <Navbar />
      
      <div className="search-container-center" style={{ marginTop: "100px" }}>
        <div className="search-wrapper-custom">
          <span className="search-glass-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by place..." 
            className="main-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="meetup-grid-layout">
        {meetups.filter(m => m.title?.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
          <div key={item._id} className="meetup-card-custom" onClick={() => { setSelectedMeetup(item); setShowParticipants(false); }}>
            <img src={item.img} alt="meetup" className="card-img" />
            <div className="card-content">
              <h3>{item.title}</h3>
              <p className="card-date">{formatDate(item.date)} • {item.time}</p>
              <div className="card-attendees">
                <span>👥 {item.attendees.length} participants</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP DETAILS */}
      {selectedMeetup && (
        <div className="popup-overlay" onClick={() => setSelectedMeetup(null)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <img src={selectedMeetup.img} alt="popup" className="popup-image" />
            <div className="popup-body">
              <div className="popup-info-row">
                <span className="info-icon">📍</span>
                <div><small>Location</small><p>{selectedMeetup.location}</p></div>
              </div>
              
              <div className="popup-info-row">
                <span className="info-icon">👥</span>
                <div className="participants-block" ref={participantsRef}>
                  <small>Participants</small>
                  <div className="participants-avatars" onClick={() => setShowParticipants(!showParticipants)}>
                    {selectedMeetup.attendees.slice(0, 3).map((p, i) => (
                      <div key={i} className="avatar-circle">{p.charAt(0)}</div>
                    ))}
                    {selectedMeetup.attendees.length > 3 && <div className="avatar-circle">+{selectedMeetup.attendees.length - 3}</div>}
                  </div>
                  {showParticipants && (
                    <div className="participants-dropdown">
                      {selectedMeetup.attendees.map((p, i) => <div key={i} className="participant-row">{p}</div>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="popup-action-btns">
                <button className="btn-cancel-popup" onClick={() => setSelectedMeetup(null)}>Close</button>
                {selectedMeetup.createdBy === loggedInUser?.name ? (
                  <button className="btn-delete-meetup" onClick={() => handleDeleteMeetup(selectedMeetup._id)}>Cancel Meetup</button>
                ) : (
                  <button 
                    className="btn-send-request" 
                    onClick={() => handleJoinMeetup(selectedMeetup._id)}
                    disabled={
                      selectedMeetup.attendees.includes(loggedInUser?.name) ||
                      !canJoinMeetups
                    }
                  >
                    {!canJoinMeetups
                      ? "Restricted"
                      : selectedMeetup.attendees.includes(loggedInUser?.name)
                      ? "Joined ✓"
                      : "Join Meetup"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="popup-overlay" onClick={() => { setIsCreateModalOpen(false); setShowInviteDropdown(false); }}>
          <div className="create-popup-content" onClick={e => e.stopPropagation()}>
            <div className="create-popup-header">
              <h2>CREATE MEETUP</h2>
              <button className="close-x-btn" onClick={() => { setIsCreateModalOpen(false); setShowInviteDropdown(false); }}>✕</button>
            </div>
            <div className="create-popup-body">
              <div className="input-group">
                <label>Meetup Title</label>
                <input type="text" placeholder="e.g. Fun Friday Trip" value={formData.meetupName} onChange={e => setFormData({...formData, meetupName: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Place Name</label>
                <input type="text" value={formData.placeName} onChange={e => setFormData({...formData, placeName: e.target.value})} />
              </div>
              <div className="date-time-row">
                <div className="input-group">
                  <label>Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Time</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>

              {/* قسم الدعوات بنظام السهم والبحث المتطابق مع الهوية البصرية */}
              <div className="prof-invite-section">
                <div 
                  className={`prof-invite-toggle ${showInviteDropdown ? "active" : ""}`}
                  onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                >
                  <label>Invite People ({formData.invitePeople.length} selected)</label>
                  <span className="prof-arrow-icon">▼</span>
                </div>

                {showInviteDropdown && (
                  <div className="prof-dropdown-content">
                    {/* حقل بحث مقتبس هندسياً من شريط بحث موقعكِ الأساسي */}
                    <div className="prof-search-wrapper">
                      <span className="prof-search-icon">🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search profiles by name..." 
                        className="prof-search-input" 
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="prof-users-grid">
                      {allUsers
                        .filter(user => user.name.toLowerCase().includes(userSearchTerm.toLowerCase()))
                        .map(user => {
                          const isSelected = formData.invitePeople.includes(user.name);
                          return (
                            <div 
                              key={user._id} 
                              className={`prof-user-card ${isSelected ? "selected" : ""}`}
                              onClick={() => handleToggleInvite(user.name)}
                            >
                              <div className="prof-avatar">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="prof-username">{user.name}</span>
                              {isSelected && <span className="prof-check-mark">✓</span>}
                            </div>
                          );
                        })}
                      {allUsers.filter(user => user.name.toLowerCase().includes(userSearchTerm.toLowerCase())).length === 0 && (
                        <p className="prof-no-users">No profiles match your search.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* أزرار التحكم - تحافظ على كلاسات التصميم الأصلي القديم 100% */}
              <div className="popup-action-btns" style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button className="btn-cancel-popup" onClick={() => { setIsCreateModalOpen(false); setShowInviteDropdown(false); }}>
                  Close
                </button>
                <button className="btn-send-request" onClick={handleCreateMeetup}>
                  CREATE & INVITE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button
        className="floating-create-btn"
        onClick={() => {
          if (!canCreateMeetup) {
            alert("You are not allowed to create meetups");
            return;
          }

          setIsCreateModalOpen(true);
        }}
      >
        👑 Create Meetup
      </button>
    </div>
  );
}