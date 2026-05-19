import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./MeetupPage.css";
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function MeetupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const emptyForm = {
    placeName: "",
    meetupName: "",
    date: "",
    time: "",
    invitePeople: [],
    maxParticipants: 10,
    notes: ""
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [meetups, setMeetups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const participantsRef = useRef(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const canCreateMeetup =
    loggedInUser?.permissions?.createMeetup === false ? false : true;

  const canJoinMeetups =
    loggedInUser?.permissions?.joinMeetups === false ? false : true;

  const getPersonName = (person) => {
    if (!person) return "";
    if (typeof person === "string") return person;
    return person.name || person.userName || "";
  };

  const isCurrentUserInMeetup = (meetup) => {
    const userName = loggedInUser?.name;
    if (!userName) return false;

    return meetup?.attendees?.some((person) => getPersonName(person) === userName);
  };

  const isCurrentUserCreator = (meetup) => {
    const userName = loggedInUser?.name;
    const userId = loggedInUser?.id || loggedInUser?._id;

    if (!meetup?.createdBy) return false;

    if (typeof meetup.createdBy === "string") {
      return meetup.createdBy === userName;
    }

    return meetup.createdBy?.id === userId || meetup.createdBy?._id === userId || meetup.createdBy?.name === userName;
  };

  const fetchMeetups = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/meetups", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setMeetups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setMeetups([]);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const others = res.data.filter((u) => u.name !== loggedInUser?.name);
      setAllUsers(others);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [loggedInUser?.name, token]);

  useEffect(() => {
    fetchMeetups();
    fetchUsers();
  }, [fetchMeetups, fetchUsers]);

  useEffect(() => {
    if (location.state?.openCreate && location.state?.place) {
      setIsCreateModalOpen(true);

      setFormData((prev) => ({
        ...prev,
        placeName: location.state.place.name || ""
      }));
    }
  }, [location.state]);

  const handleCreateMeetup = async () => {
    if (
      !formData.meetupName ||
      !formData.placeName ||
      !formData.date ||
      !formData.time
    ) {
      return alert("Please fill required fields (Title, Place, Date, Time)");
    }

    const newMeetupData = {
      title: formData.meetupName,
      location: formData.placeName,
      date: formData.date,
      time: formData.time,
      invitedPeople: formData.invitePeople,
      notes: formData.notes,
      maxParticipants: Number(formData.maxParticipants) || 10,
      createdBy: loggedInUser?.name || "Guest",
      attendees: [loggedInUser?.name || "Host"],
      img: `https://picsum.photos/400/250?random=${Math.random()}`
    };

    try {
      const res = await fetch("http://localhost:5000/api/meetups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMeetupData)
      });

      const data = await res.json();

      if (res.ok) {
        fetchMeetups();
        setIsCreateModalOpen(false);
        setShowInviteDropdown(false);
        setUserSearchTerm("");
        setFormData(emptyForm);
        alert("Meetup created successfully ✨");
      } else {
        alert(data.message || "Failed to create meetup");
      }
    } catch (err) {
      console.error("Save Error", err);
      alert("Server error while creating meetup");
    }
  };

  const handleToggleInvite = (userName) => {
    setFormData((prev) => {
      const isInvited = prev.invitePeople.includes(userName);

      return {
        ...prev,
        invitePeople: isInvited
          ? prev.invitePeople.filter((name) => name !== userName)
          : [...prev.invitePeople, userName]
      };
    });
  };

  const handleDeleteMeetup = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this meetup?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/meetups/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSelectedMeetup(null);
        fetchMeetups();
      } else {
        alert("Failed to delete meetup");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error while deleting meetup");
    }
  };

  const handleJoinMeetup = async (id) => {
    if (!canJoinMeetups) {
      alert("You are not allowed to join meetups");
      return;
    }

    if (!loggedInUser) {
      return alert("Please login first");
    }

    const currentAttendeesCount = selectedMeetup?.attendees
      ? selectedMeetup.attendees.length
      : 0;

    const maxLimit = selectedMeetup?.maxParticipants || 10;

    if (currentAttendeesCount >= maxLimit) {
      return alert("Sorry, this meetup is full!");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/meetups/${id}/join`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: loggedInUser.name
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Joined successfully! 🎉");
        fetchMeetups();
        setSelectedMeetup(null);
      } else {
        alert(data.message || "Failed to join meetup");
      }
    } catch (err) {
      console.error("Join error:", err);
      alert("Server error while joining meetup");
    }
  };

  const formatDate = (d) => {
    if (!d) return "";

    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div className="app meetup-page-bg">
      <div className="meetup-navbar-wrapper">
        <Navbar />
      </div>

      <div className="search-container-center" style={{ marginTop: "100px" }}>
        <div className="search-wrapper-custom">
          <Search className="search-glass-icon" />

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
        {(meetups || [])
          .filter((m) =>
            (m.title || "").toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((item) => {
            const totalParticipants = item.attendees ? item.attendees.length : 0;
            const maxLimit = item.maxParticipants || 10;

            return (
              <div
                key={item._id}
                className="meetup-card-custom"
                onClick={() => {
                  setSelectedMeetup(item);
                  setShowParticipants(false);
                }}
              >
                <img src={item.img} alt="meetup" className="card-img" />

                <div className="card-content">
                  <h3>{item.title}</h3>

                  <p className="card-date">
                    {formatDate(item.date)} • {item.time}
                  </p>

                  <div className="card-attendees">
                    <span>
                      👥 {totalParticipants} / {maxLimit} participants
                    </span>

                    {totalParticipants >= maxLimit && (
                      <span
                        style={{
                          color: "#ff4d4d",
                          fontSize: "12px",
                          marginLeft: "8px"
                        }}
                      >
                        Full 🚫
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {selectedMeetup && (
        <div className="popup-overlay" onClick={() => setSelectedMeetup(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedMeetup.img} alt="popup" className="popup-image" />

            <div className="popup-body">
              <h3>{selectedMeetup.title}</h3>

              {selectedMeetup.notes && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "15px"
                  }}
                >
                  {selectedMeetup.notes}
                </p>
              )}

              <div className="popup-info-row">
                <span className="info-icon">📍</span>

                <div>
                  <small>Location</small>
                  <p>{selectedMeetup.location}</p>
                </div>
              </div>

              <div className="popup-info-row">
                <span className="info-icon">👥</span>

                <div className="participants-block" ref={participantsRef}>
                  <small>
                    Participants ({selectedMeetup.attendees?.length || 0} /{" "}
                    {selectedMeetup.maxParticipants || 10})
                  </small>

                  <div
                    className="participants-avatars"
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    {(selectedMeetup.attendees || []).slice(0, 3).map((p, i) => {
                      const name = getPersonName(p);

                      return (
                        <div key={i} className="avatar-circle">
                          {name ? name.charAt(0).toUpperCase() : "?"}
                        </div>
                      );
                    })}

                    {selectedMeetup.attendees?.length > 3 && (
                      <div className="avatar-circle">
                        +{selectedMeetup.attendees.length - 3}
                      </div>
                    )}
                  </div>

                  {showParticipants && (
                    <div className="participants-dropdown">
                      {(selectedMeetup.attendees || []).map((p, i) => {
                        const name = getPersonName(p);
                        const id =
                          typeof p === "string" ? null : p.id || p._id;

                        return (
                          <div
                            key={i}
                            className="participant-row"
                            onClick={() => {
                              if (id) navigate(`/profile/${id}`);
                            }}
                            style={{ cursor: id ? "pointer" : "default" }}
                          >
                            {name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="popup-action-btns">
                <button
                  className="btn-cancel-popup"
                  onClick={() => setSelectedMeetup(null)}
                >
                  Close
                </button>

                {isCurrentUserCreator(selectedMeetup) ? (
                  <button
                    className="btn-delete-meetup"
                    onClick={() => handleDeleteMeetup(selectedMeetup._id)}
                  >
                    Cancel Meetup
                  </button>
                ) : (
                  <button
                    className="btn-send-request"
                    onClick={() => handleJoinMeetup(selectedMeetup._id)}
                    disabled={
                      isCurrentUserInMeetup(selectedMeetup) ||
                      (selectedMeetup.attendees
                        ? selectedMeetup.attendees.length
                        : 0) >= (selectedMeetup.maxParticipants || 10) ||
                      !canJoinMeetups
                    }
                  >
                    {!canJoinMeetups
                      ? "Restricted"
                      : isCurrentUserInMeetup(selectedMeetup)
                      ? "Joined ✓"
                      : (selectedMeetup.attendees
                          ? selectedMeetup.attendees.length
                          : 0) >= (selectedMeetup.maxParticipants || 10)
                      ? "Meetup Full 🚫"
                      : "Join Meetup"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div
          className="popup-overlay"
          onClick={() => {
            setIsCreateModalOpen(false);
            setShowInviteDropdown(false);
          }}
        >
          <div
            className="create-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="create-popup-header">
              <h2>CREATE MEETUP</h2>

              <button
                className="close-x-btn"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setShowInviteDropdown(false);
                }}
              >
                ✕
              </button>
            </div>

            <div className="create-popup-body">
              <div className="input-group">
                <label>Meetup Title</label>

                <input
                  type="text"
                  placeholder="e.g. Fun Friday Trip"
                  value={formData.meetupName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meetupName: e.target.value
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Place Name</label>

                <input
                  type="text"
                  value={formData.placeName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placeName: e.target.value
                    })
                  }
                />
              </div>

              <div className="date-time-row">
                <div className="input-group">
                  <label>Date</label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value
                      })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Time</label>

                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Max Participants Count</label>

                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: e.target.value
                    })
                  }
                />
              </div>

              <div className="prof-invite-section">
                <div
                  className={`prof-invite-toggle ${
                    showInviteDropdown ? "active" : ""
                  }`}
                  onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                >
                  <label>
                    Invite People ({formData.invitePeople.length} selected)
                  </label>

                  <span className="prof-arrow-icon">▼</span>
                </div>

                {showInviteDropdown && (
                  <div className="prof-dropdown-content">
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
                        .filter((user) =>
                          user.name
                            ?.toLowerCase()
                            .includes(userSearchTerm.toLowerCase())
                        )
                        .map((user) => {
                          const isSelected = formData.invitePeople.includes(
                            user.name
                          );

                          return (
                            <div
                              key={user._id}
                              className={`prof-user-card ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={() => handleToggleInvite(user.name)}
                            >
                              <div className="prof-avatar">
                                {user.name
                                  ? user.name.charAt(0).toUpperCase()
                                  : "U"}
                              </div>

                              <span className="prof-username">{user.name}</span>

                              {isSelected && (
                                <span className="prof-check-mark">✓</span>
                              )}
                            </div>
                          );
                        })}

                      {allUsers.filter((user) =>
                        user.name
                          ?.toLowerCase()
                          .includes(userSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <p className="prof-no-users">
                          No profiles match your search.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="popup-action-btns"
                style={{
                  marginTop: "25px",
                  paddingTop: "15px",
                  borderTop: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <button
                  className="btn-cancel-popup"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setShowInviteDropdown(false);
                  }}
                >
                  Close
                </button>

                <button
                  className="btn-send-request"
                  onClick={handleCreateMeetup}
                >
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