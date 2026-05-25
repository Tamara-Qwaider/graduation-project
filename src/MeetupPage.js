import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";

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
    notes: "",
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [meetups, setMeetups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [places, setPlaces] = useState([]);

  const participantsRef = useRef(null);
  const categoryFilterRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const canCreateMeetup =
    loggedInUser?.permissions?.createMeetup === false ? false : true;

  const canJoinMeetups =
    loggedInUser?.permissions?.joinMeetups === false ? false : true;

  const cleanText = useCallback((text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .trim();
}, []);

const userInterests = useMemo(() => {
  const interests =
    loggedInUser?.interests ||
    JSON.parse(localStorage.getItem("interests")) ||
    [];

  return Array.isArray(interests)
    ? interests.map((item) => cleanText(item))
    : [];
}, [loggedInUser, cleanText]);

  const getPersonName = useCallback((person) => {
    if (!person) return "";
    if (typeof person === "string") return person;
    return person.name || person.userName || "";
  }, []);

  const getMeetupDateTime = useCallback((meetup) => {
    if (meetup?.expiresAt) {
      return new Date(meetup.expiresAt);
    }

    if (!meetup?.date) return null;

    return new Date(`${meetup.date}T${meetup.time || "00:00"}`);
  }, []);

  const isMeetupExpired = useCallback(
    (meetup) => {
      if (meetup?.status === "expired" || meetup?.status === "cancelled") {
        return true;
      }

      const meetupDateTime = getMeetupDateTime(meetup);

      if (!meetupDateTime || isNaN(meetupDateTime.getTime())) {
        return false;
      }

      return meetupDateTime < new Date();
    },
    [getMeetupDateTime]
  );

  const isCurrentUserInMeetup = useCallback(
    (meetup) => {
      const userName = loggedInUser?.name;
      if (!userName) return false;

      return meetup?.attendees?.some(
        (person) => getPersonName(person) === userName
      );
    },
    [loggedInUser?.name, getPersonName]
  );

  const isCurrentUserCreator = useCallback(
    (meetup) => {
      const userName = loggedInUser?.name;
      const userId = loggedInUser?.id || loggedInUser?._id;

      if (!meetup?.createdBy) return false;

      if (typeof meetup.createdBy === "string") {
        return meetup.createdBy === userName;
      }

      return (
        meetup.createdBy?.id === userId ||
        meetup.createdBy?._id === userId ||
        meetup.createdBy?.name === userName
      );
    },
    [loggedInUser?.id, loggedInUser?._id, loggedInUser?.name]
  );
 
const interestCategoryMap = useMemo(() => ({
  music: "activities event",
  travel: "activities event",
  sports: "activities event",
  nature: "activities event",

  restaurants: "restaurants",
  cafes: ["cafes", "coffee houses"],
  shopping: "shopping",
  movies: "movies",
}), []);  

 const getInterestScore = useCallback(
  (meetup) => {
    if (!userInterests.length) return 0;

    const matchedPlace = places.find((place) => {
      return (
        cleanText(place.name) === cleanText(meetup.location) ||
        cleanText(place.title) === cleanText(meetup.location)
      );
    });

    return userInterests.reduce((score, interest) => {
      if (!interest) return score;

      const meetupCategory = cleanText(
  meetup.category ||
  matchedPlace?.category ||
  matchedPlace?.type
);

const mappedInterestCategory =
  interestCategoryMap[interest] || interest;

return meetupCategory.includes(mappedInterestCategory) ||
  mappedInterestCategory.includes(meetupCategory)
  ? score + 100
  : score;
    }, 0);
  },
  [userInterests, places, cleanText, interestCategoryMap]
);

  const fetchMeetups = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/meetups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const activeMeetups = Array.isArray(data)
        ? data.filter((meetup) => !isMeetupExpired(meetup))
        : [];

      setMeetups(activeMeetups);
    } catch (err) {
      console.error("Fetch error:", err);
      setMeetups([]);
    }
  }, [token, isMeetupExpired]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const others = res.data.filter((u) => u.name !== loggedInUser?.name);
      setAllUsers(others);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [loggedInUser?.name, token]);

  const fetchPlaces = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/places", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlaces(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching places:", err);
      setPlaces([]);
    }
  }, [token]);

  useEffect(() => {
    fetchMeetups();
    fetchUsers();
    fetchPlaces();
  }, [fetchMeetups, fetchUsers, fetchPlaces]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeetups((prev) => prev.filter((meetup) => !isMeetupExpired(meetup)));

      setSelectedMeetup((prev) => {
        if (prev && isMeetupExpired(prev)) return null;
        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [isMeetupExpired]);

  useEffect(() => {
    if (location.state?.openCreate && location.state?.place) {
      setIsCreateModalOpen(true);

      setFormData((prev) => ({
        ...prev,
        placeName: location.state.place.name || "",
      }));
    }
  }, [location.state]);

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      categoryFilterRef.current &&
      !categoryFilterRef.current.contains(e.target)
    ) {
      setShowCategoryFilter(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const recommendedForYou = useMemo(() => {
    return [...meetups]
      .filter((meetup) => !isMeetupExpired(meetup))
      .filter((meetup) => !isCurrentUserInMeetup(meetup))
      .map((meetup) => ({
        ...meetup,
        recommendationScore: getInterestScore(meetup),
      }))
      .filter((meetup) => meetup.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 4);
  }, [meetups, isMeetupExpired, isCurrentUserInMeetup, getInterestScore]);

  const recommendedIds = useMemo(() => {
    return new Set(recommendedForYou.map((meetup) => meetup._id));
  }, [recommendedForYou]);

  const allMeetups = useMemo(() => {
    const now = new Date();

    const scoreMeetup = (meetup) => {
      let points = 0;

      const meetupDateTime = getMeetupDateTime(meetup);

      if (meetupDateTime && !isNaN(meetupDateTime.getTime())) {
        const diffDays =
          Math.abs(meetupDateTime.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24);

        points += Math.max(0, 30 - diffDays);
      }

      if (meetup.invitedPeople?.includes(loggedInUser?.name)) {
        points += 40;
      }

      const attendeesCount = meetup.attendees?.length || 0;
      const maxParticipants = meetup.maxParticipants || 10;

      points += attendeesCount < maxParticipants ? 20 : -50;

      if (!isCurrentUserInMeetup(meetup)) {
        points += 10;
      }

      if (isCurrentUserCreator(meetup)) {
        points += 5;
      }

      return points;
    };

    return [...meetups]
      .filter((meetup) => !isMeetupExpired(meetup))
      .sort((a, b) => scoreMeetup(b) - scoreMeetup(a));
  }, [
    meetups,
    loggedInUser?.name,
    getMeetupDateTime,
    isCurrentUserInMeetup,
    isCurrentUserCreator,
    isMeetupExpired,
  ]);

  const meetupCategories = useMemo(() => {
  return [
    "All",
    ...new Set(
      places
        .map((p) => p.category)
        .filter(Boolean)
       ),
    ];
    }, [places]);

  const filteredAllMeetups = useMemo(() => {
  const query = searchTerm.toLowerCase();

  return allMeetups.filter((m) => {
    const matchesSearch =
      (m.title || "").toLowerCase().includes(query) ||
      (m.location || "").toLowerCase().includes(query);

    const matchedPlace = places.find((place) => {
      const placeName = cleanText(place.name || place.title);
      const meetupPlace = cleanText(m.location);

      return placeName === meetupPlace;
    });

    const meetupCategory = cleanText(
      m.category ||
      matchedPlace?.category ||
      matchedPlace?.type ||
      ""
    );

    const selected = cleanText(selectedCategory);

    const matchesCategory =
      selectedCategory === "All" || meetupCategory === selected;

    return matchesSearch && matchesCategory;
     });
    }, [allMeetups, searchTerm, selectedCategory, places, cleanText]);

  const findPlaceImage = useCallback(() => {
    const typedPlaceName = formData.placeName.toLowerCase().trim();

    const matchedPlace = places.find((place) => {
      const dbPlaceName = (place.name || place.title || "")
        .toLowerCase()
        .trim();

      return dbPlaceName === typedPlaceName;
    });

    return (
      matchedPlace?.img ||
      matchedPlace?.image ||
      matchedPlace?.photo ||
      matchedPlace?.imageUrl ||
      matchedPlace?.mainImage ||
      "https://picsum.photos/400/250"
    );
  }, [formData.placeName, places]);

const normalizeText = (text) =>
  String(text || "").toLowerCase().trim();

const matchedPlace = useMemo(() => {
  const typedPlaceName = normalizeText(formData.placeName);

  if (!typedPlaceName) return null;

  return places.find((place) => {
    const placeName = normalizeText(place.name || place.title);
    return placeName === typedPlaceName;
  });
}, [formData.placeName, places]);

  const handleCreateMeetup = async () => {
    if (
      !formData.meetupName ||
      !formData.placeName ||
      !formData.date ||
      !formData.time
    ) {
      return alert("Please fill required fields (Title, Place, Date, Time)");
    }

  if (!matchedPlace) {
  return alert("Please choose a place that exists in the database");
}

    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);

    if (selectedDateTime < new Date()) {
      return alert("You cannot create a meetup in the past");
    }

    const meetupImage = findPlaceImage();

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
      img: meetupImage,
      category: matchedPlace?.category || matchedPlace?.type || "",
    };

    try {
      const res = await fetch("http://localhost:5000/api/meetups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMeetupData),
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
          : [...prev.invitePeople, userName],
      };
    });
  };

  const handleDeleteMeetup = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this meetup?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/meetups/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    if (isMeetupExpired(selectedMeetup)) {
      setSelectedMeetup(null);
      fetchMeetups();
      return alert("This meetup has already ended");
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userName: loggedInUser.name,
        }),
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
      year: "numeric",
    });
  };

  const renderMeetupCard = (item, isRecommended = false) => {
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
                  marginLeft: "8px",
                }}
              >
                Full 🚫
              </span>
            )}
          </div>

          {isRecommended && (
            <p
              style={{
                color: "#ffb703",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              Based on your interests ✨
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app meetup-page-bg">
      <div className="meetup-navbar-wrapper">
        <Navbar />
      </div>

      <div className="search-container-center" style={{ marginTop: "100px" }}>
  <div className="search-filter-row">
    <div className="search-wrapper-custom">
      <Search className="search-glass-icon" />

      <input
        type="text"
        placeholder="Search by title or place..."
        className="main-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <div className="category-filter-wrapper" ref={categoryFilterRef}>
      <button
        className="category-filter-btn"
        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
      >
        ☰
      </button>

      {showCategoryFilter && (
        <div className="category-filter-menu">
          {meetupCategories.map((cat) => (
            <button
              key={cat}
              className={`category-filter-option ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => {
                setSelectedCategory(cat);
                setShowCategoryFilter(false);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
</div>

      {recommendedForYou.length > 0 && (
        <section className="recommendation-section">
          <h2 className="meetup-section-title">RECOMMENDED FOR YOU</h2>

          <div className="meetup-grid-layout recommendation-grid">
            {recommendedForYou.map((item) => renderMeetupCard(item, true))}
          </div>
        </section>
      )}

      <section className="all-meetups-section">
        <h2 className="meetup-section-title">ALL MEETUPS</h2>

        <div className="meetup-grid-layout all-meetups-grid">
          {filteredAllMeetups.length > 0 ? (
            filteredAllMeetups.map((item) =>
              renderMeetupCard(item, recommendedIds.has(item._id))
            )
          ) : (
            <p className="empty-meetup-text">No meetups found.</p>
          )}
        </div>
      </section>

      {selectedMeetup && (
        <div className="popup-overlay" onClick={() => setSelectedMeetup(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedMeetup.img} alt="popup" className="popup-image" />

            <div className="popup-body">
              <h3 className="popup-meetup-title">{selectedMeetup.title}</h3>

              {selectedMeetup.notes && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "15px",
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

    const matchedUser = allUsers.find((u) => u.name === name);

    const id =
      typeof p === "string"
        ? matchedUser?._id || matchedUser?.id
        : p.id || p._id;

    const isHost =
      name ===
      (typeof selectedMeetup.createdBy === "string"
        ? selectedMeetup.createdBy
        : selectedMeetup.createdBy?.name);

    return (
      <div
        key={i}
        className="participant-row"
        onClick={() => {
          if (id) navigate(`/profile/${id}`);
        }}
        style={{ cursor: id ? "pointer" : "default" }}
      >
        <span>{name}</span>

        {isHost && (
          <span className="host-badge">
            Host
          </span>
        )}
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
                      meetupName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Place Name</label>

                <input type="text" list="places-list" value={formData.placeName}  placeholder="Choose place from database" onChange={(e) =>   setFormData({     ...formData,
                 placeName: e.target.value,}) } 
                 />

                 <datalist id="places-list">
                  {places.map((place) => (
                    <option
                    key={place._id}
                    value={place.name || place.title}
                   />
                   ))}
                  </datalist>

                 {formData.placeName && !matchedPlace && (
                 <p style={{ color: "#ff4d4d", fontSize: "13px", marginTop: "6px" }}>
                 This place is not available in the database.
                  </p>
                 )}
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
                        date: e.target.value,
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
                        time: e.target.value,
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
                      maxParticipants: e.target.value,
                    })
                  }
                />
              </div>

              <div className="input-group">
                <label>Notes</label>

                <textarea
                  placeholder="Add meetup notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,
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
                  borderTop: "1px solid rgba(255,255,255,0.05)",
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