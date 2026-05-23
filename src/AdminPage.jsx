import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("places");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [token] = useState(() => localStorage.getItem("token"));

  const [places, setPlaces] = useState([]);
  const [meetups, setMeetups] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isEditMeetupOpen, setIsEditMeetupOpen] = useState(false);
  const [isCreateMeetupOpen, setIsCreateMeetupOpen] = useState(false);
  const [isRestrictUserOpen, setIsRestrictUserOpen] = useState(false);
  const [isEditPlaceOpen, setIsEditPlaceOpen] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);



const authHeaders = useMemo(() => {
  return token ? { Authorization: `Bearer ${token}` } : {};
}, [token]);

const jsonAuthHeaders = useMemo(() => {
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
}, [token]);


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories", { 
          headers: token ? { Authorization: `Bearer ${token}` } : {} 
        });
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message || "Failed to fetch categories");
          return;
        }
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, [authHeaders,token]);

  // Fetch Places
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/places", { 
          headers: token ? { Authorization: `Bearer ${token}` } : {} 
        });
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message || "Failed to fetch places");
          return;
        }
        setPlaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Error fetching places", err);
      }
    };
    fetchPlaces();
  }, [token, authHeaders]);

  const fetchMeetups = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/meetups", {
        headers: authHeaders,
      });

      const data = await res.json();

      if (!res.ok) return;

      setMeetups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchMeetups();
  }, [fetchMeetups]);
  const refreshMeetups = fetchMeetups;
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", { 
          headers: token ? { Authorization: `Bearer ${token}` } : {} 
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to fetch users");
          return;
        }
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        alert("Server error");
      }
    };
    fetchUsers();
  }, [token, authHeaders]);

  // Filter Logic
  const filteredPlaces = places.filter((p) =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMeetups = meetups.filter((m) =>
    (m.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  const handleCreateMeetup = async (newMeetup) => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const meetupData = {
      title: newMeetup.title,
      location: newMeetup.loc,
      date: newMeetup.date || new Date().toISOString().split("T")[0],
      time: newMeetup.time || "12:00",
      maxParticipants: Number(newMeetup.p) || 10,
      createdBy: loggedInUser?.name || "Admin",
      attendees: [loggedInUser?.name || "Admin"],
      notes: newMeetup.notes || "Created by Admin",
      img: `https://picsum.photos/400/250?random=${Math.random()}`,
    };
    try {
      const res = await fetch("http://localhost:5000/api/meetups/create", {
        method: "POST",
        headers: jsonAuthHeaders,
        body: JSON.stringify(meetupData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to create meetup");
        return;
      }
      refreshMeetups();
      setIsCreateMeetupOpen(false);
      alert("Meetup created successfully and published! 🚀");
    } catch (err) {
      alert("Server error while creating meetup");
    }
  };

  const handleUpdateMeetup = async (updatedMeetup) => {
    try {
      const id = updatedMeetup._id || updatedMeetup.id;
      const res = await fetch(`http://localhost:5000/api/meetups/${id}`, {
        method: "PUT",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          title: updatedMeetup.title,
          location: updatedMeetup.loc || updatedMeetup.location,
          date: updatedMeetup.date,
          time: updatedMeetup.time,
          attendees: updatedMeetup.attendees,
          maxParticipants: Number(updatedMeetup.maxParticipants),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update meetup");
        return;
      }
      refreshMeetups();
      setIsEditMeetupOpen(false);
      alert("Meetup updated successfully! ✏️");
    } catch (err) {
      alert("Server error while updating meetup");
    }
  };

  const handleDeleteMeetup = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meetup?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/meetups/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        refreshMeetups();
        alert("Meetup deleted! 🗑️");
      } else {
        alert("Failed to delete meetup");
      }
    } catch (err) {
      alert("Error deleting meetup");
    }
  };
 const uploadToCloudinary = async (file) => {
  const data = new FormData();


  data.append("file", file);
  data.append("upload_preset", "places_images");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dk5ygcizr/image/upload",
    {
      method: "POST",
      body: data,

    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error?.message || "Cloudinary upload failed");
  }

  return result.secure_url;
};

const handleAddPlace = async (newPlace) => {
  try {
    if (
      !newPlace.name ||
      !newPlace.category ||
      !newPlace.loc ||
      !newPlace.rate ||
      !newPlace.phone ||
      !newPlace.desc ||
      !newPlace.mainImageFile
    ) {
      alert("Please fill all fields and upload the main image.");
      return;
    }
    let mainImageUrl = "";

    if (newPlace.mainImageFile) {
      mainImageUrl = await uploadToCloudinary(newPlace.mainImageFile);
    }

    const extraImageUrls = [];

    if (newPlace.extraImageFiles?.length > 0) {
      for (const file of newPlace.extraImageFiles) {
        const url = await uploadToCloudinary(file);
        extraImageUrls.push(url);
      }
    }

const allImages = [mainImageUrl, ...extraImageUrls].filter(Boolean);

    const res = await fetch("http://localhost:5000/api/places", {
      method: "POST",
      headers: jsonAuthHeaders,
      body: JSON.stringify({
        name: newPlace.name,
        category: newPlace.category || "Suggestions",
        image: mainImageUrl,
        location: newPlace.loc,
        rating: Number(newPlace.rate),
        description: newPlace.desc,
        images: allImages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to add place");
      return;
    }

    setPlaces((prev) => [...prev, data.place]);
    setIsAddPlaceOpen(false);
  } catch (err) {
    alert(err.message || "Server error");
  }
};
  const handleUpdatePlace = async (updatedPlace) => {
  try {
    let imageUrl = updatedPlace.image || updatedPlace.img;

    if (updatedPlace.imageFile) {
      imageUrl = await uploadToCloudinary(updatedPlace.imageFile);
    }
    const newExtraImageUrls = [];
    if (updatedPlace.newExtraImageFiles?.length > 0) {
      for (const file of updatedPlace.newExtraImageFiles) {
        const url = await uploadToCloudinary(file);
        newExtraImageUrls.push(url);
      }
    }
    const updatedImages = [
      imageUrl,
      ...(updatedPlace.images || []).filter((url) => url !== imageUrl),
      ...newExtraImageUrls,
    ];

    const res = await fetch(
      `http://localhost:5000/api/places/${updatedPlace._id}`,
      {
        method: "PUT",
        headers: jsonAuthHeaders,
        body: JSON.stringify({
          ...updatedPlace,
          image: imageUrl,
          images: updatedImages,
          rating: Number(updatedPlace.rate),
          description: updatedPlace.desc,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "failed to update");
      return;
    }

    setPlaces(
      places.map((p) =>
        p._id === data.place._id ? data.place : p
      )
    );

    setIsEditPlaceOpen(false);
  } catch (err) {
    alert(err.message || "Server error");
  }
};

  return (
    <div className="min-h-screen bg-[#060b1a] text-white font-sans overflow-x-hidden">
      <nav className="flex items-center justify-between px-12 py-6 bg-[#060b1a] sticky top-0 z-[100] border-b border-white/5">
        <h1 className="text-2xl font-black tracking-tighter uppercase">
          ADMIN <span className="text-[#ff6b35]">DASHBOARD</span>
        </h1>

        <div className="flex bg-[#0f172a] p-1.5 rounded-2xl gap-2">
          <TabButton active={activeTab === "places"} onClick={() => handleTabChange("places")} label="Places" icon="📍" />
          <TabButton active={activeTab === "meetup"} onClick={() => handleTabChange("meetup")} label="Meetup" icon="📅" />
          <TabButton active={activeTab === "users"} onClick={() => handleTabChange("users")} label="Users" icon="👤" />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 bg-[#0f172a] p-2 pr-6 rounded-full border border-white/5 hover:bg-[#161e31] transition-all"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#ff6b35] overflow-hidden shadow-[0_0_15px_rgba(255,107,53,0.2)]">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=ff6b35&color=fff"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-bold leading-none mb-1">Admin Name</p>
              <p className="text-[10px] uppercase tracking-widest text-[#ff6b35] font-black">Super Admin</p>
            </div>
            <span className={`text-[10px] transition-transform ${isProfileOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-60 bg-[#161e31] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-2"
              >
                <DropdownItem icon="👤" label="My Profile" />
                <DropdownItem icon="ℹ️" label="Admin Information" />
                <DropdownItem icon="⚙️" label="Settings" />
                <div className="h-[1px] bg-white/5 my-2 mx-4" />
                <DropdownItem icon="🚪" label="Sign Out" isDanger onClick={handleLogout} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="p-12 max-w-[1600px] mx-auto">
        <div className="mb-16 flex justify-center">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f172a] border-2 border-[#6d28d9]/20 p-4 pl-14 rounded-2xl text-lg outline-none focus:border-[#ff6b35] transition-all shadow-2xl placeholder:text-gray-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "places" && (
            <PlacesSection
              key="places"
              data={filteredPlaces}
              categories={categories}
              onAddCategory={async (name) => {
                try {
                  const res = await fetch("http://localhost:5000/api/categories", {
                    method: "POST",
                    headers: jsonAuthHeaders,
                    body: JSON.stringify({ name }),
                  });
                  const data = await res.json();

                  if (!res.ok) {
                    alert(data.message);
                    return;
                  }

                  setCategories((prev) => [...prev, data.category]);
                } catch (err) {
                  alert("Server error");
                }
              }}
              onDeleteCategory={async (id) => {
                try {
                  await fetch(`http://localhost:5000/api/categories/${id}`, {
                    method: "DELETE",
                    headers: authHeaders,
                  });
                  setCategories(categories.filter((c) => c._id !== id && c.id !== id));
                } catch (err) { alert("Server error"); }
              }}
              onEdit={(p) => { setSelectedItem(p); setIsEditPlaceOpen(true); }}
              onAddClick={() => setIsAddPlaceOpen(true)}
              onRemove={async (id) => {
                try {
                  const res = await fetch(`http://localhost:5000/api/places/${id}`, {
                    method: "DELETE",
                    headers: authHeaders,
                  });
                  const data = await res.json();
                  if (!res.ok) { alert(data.message || "Failed to delete"); return; }
                  setPlaces(places.filter((x) => x._id !== id && x.id !== id));
                } catch (err) { alert("Server error"); }
              }}
            />
          )}

          {activeTab === "meetup" && (
            <MeetupSection
              key="meetup"
              data={filteredMeetups}
              onEdit={(m) => { setSelectedItem(m); setIsEditMeetupOpen(true); }}
              onCreateClick={() => setIsCreateMeetupOpen(true)}
              onBlock={(id) => handleDeleteMeetup(id)}
            />
          )}

          {activeTab === "users" && (
            <UsersSection
              key="users"
              data={filteredUsers}
              onRestrict={(u) => { setSelectedItem(u); setIsRestrictUserOpen(true); }}
              onBlock={async (user) => {
                try {
                  const id = user._id || user.id;
                  const res = await fetch(`http://localhost:5000/api/users/${id}/block`, {
                    method: "PUT",
                    headers: jsonAuthHeaders,
                    body: JSON.stringify({ isBlocked: !user.isBlocked }),
                  });
                  const data = await res.json();
                  if (!res.ok) { alert(data.message || "Failed to update user"); return; }
                  const updatedUser = data.user || data;
                  setUsers(users.map((u) => ((u._id || u.id) === id ? updatedUser : u)));
                } catch (err) { alert("Server error"); }
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <EditPlaceModal isOpen={isEditPlaceOpen} onClose={() => setIsEditPlaceOpen(false)} place={selectedItem} onSave={handleUpdatePlace} />
      <AddPlaceModal isOpen={isAddPlaceOpen} onClose={() => setIsAddPlaceOpen(false)} onAdd={handleAddPlace} categories={categories} />
      
      {/* 🎯 تم تعديل السطر التالي ليتطابق مع الـ State الصحيحة */}
      <EditMeetupModal isOpen={isEditMeetupOpen} onClose={() => setIsEditMeetupOpen(false)} meetup={selectedItem} onSave={handleUpdateMeetup} onCreateNew={() => { setIsEditMeetupOpen(false); setIsCreateMeetupOpen(true); }} />
      
      <CreateMeetupModal isOpen={isCreateMeetupOpen} onClose={() => setIsCreateMeetupOpen(false)} onCreate={handleCreateMeetup} />
      <RestrictUserModal
        isOpen={isRestrictUserOpen}
        onClose={() => setIsRestrictUserOpen(false)}
        user={selectedItem}
        onSave={async (user, permissions) => {
          try {
            const id = user._id || user.id;
            const res = await fetch(`http://localhost:5000/api/users/${id}/permissions`, {
              method: "PUT",
              headers: jsonAuthHeaders,
              body: JSON.stringify(permissions),
            });
            const data = await res.json();
            if (!res.ok) { alert(data.message || "Failed to update permissions"); return; }
            const updatedUser = data.user || data;
            setUsers(users.map((u) => ((u._id || u.id) === id ? updatedUser : u)));
            setIsRestrictUserOpen(false);
          } catch (err) { alert("Server error"); }
        }}
      />
    </div>
  );
}

// Subcomponents (DropdownItem, TabButton, Sections, Modals)
const DropdownItem = ({ icon, label, isDanger, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${isDanger ? "text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:bg-[#ff6b35]/10 hover:text-white"}`}>
    <span>{icon}</span> {label}
  </button>
);

const TabButton = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider ${active ? "bg-[#ff6b35] text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
    <span>{icon}</span> {label}
  </button>
);

const PlacesSection = ({ data, onEdit, onRemove, onAddClick, categories, onAddCategory, onDeleteCategory }) => {
  const [newCategory, setNewCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold uppercase tracking-widest text-[#ff6b35]">Places ({data.length})</h2>
        <div className="flex gap-4">
          <button onClick={() => setIsCategoryModalOpen(true)} className="bg-[#0f172a] border border-[#ff6b35]/40 text-[#ff6b35] px-6 py-3 rounded-full font-black uppercase text-xs hover:bg-[#ff6b35]/10">Manage Categories</button>
          <button onClick={onAddClick} className="bg-[#ff6b35] px-8 py-3 rounded-full font-black uppercase text-xs shadow-[0_0_20px_rgba(255,107,53,0.3)]">＋ Add Place</button>
        </div>
      </div>
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[170] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ y: 40, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.95 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden">
              <div className="flex justify-between items-center px-10 pt-10 pb-6">
                <h2 className="text-3xl font-black uppercase text-[#ff6b35]">Manage Categories</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-3xl text-gray-400 hover:text-white">×</button>
              </div>
              <div className="px-10 pb-8 space-y-3 max-h-[320px] overflow-y-auto">
                {categories.length === 0 ? <p className="text-gray-400 text-sm">No categories yet.</p> : categories.map((c) => (
                  <div key={c._id || c.id} className="flex items-center justify-between bg-[#0f172a] border border-white/10 px-5 py-4 rounded-2xl">
                    <span className="font-bold">{c.name}</span>
                    <button onClick={() => onDeleteCategory(c._id || c.id)} className="text-red-400 font-black hover:text-red-300">Delete</button>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-black/20">
                <div className="flex gap-3">
                  <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category..." className="flex-1 bg-[#060b1a] border border-white/10 px-5 py-4 rounded-2xl outline-none focus:border-[#ff6b35]" />
                  <button onClick={() => { if (!newCategory) return; onAddCategory(newCategory); setNewCategory(""); }} className="bg-[#ff6b35] px-6 py-4 rounded-2xl font-black uppercase text-xs">Add Category</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {data.map((p) => (
          <motion.div layout key={p._id || p.id} className="bg-[#6d28d9] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img src={p.image || p.img} alt="" className="h-72 w-full object-cover" />
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-3">{p.name}</h3>
              <p className="text-purple-100 text-sm mb-4 h-12 overflow-hidden">{p.description || p.desc}</p>
              <div className="flex items-center gap-4 text-xs font-bold text-purple-200 mb-8">
                <span>📍 {p.location || p.loc}</span>
                <span>⭐ {p.rating || p.rate}</span>
                {p.phone && <span>📞 {p.phone}</span>}
              </div>
              <div className="flex gap-4">
                <button onClick={() => onEdit(p)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">✏️ Edit</button>
                <button onClick={() => onRemove(p._id || p.id)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">🗑️ Remove</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const MeetupSection = ({ data, onEdit, onBlock, onCreateClick }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-4xl font-bold uppercase tracking-widest text-[#ff6b35]">Meetups ({data.length})</h2>
      <button onClick={onCreateClick} className="bg-[#ff6b35] px-8 py-3 rounded-full font-black uppercase text-xs shadow-[0_0_20px_rgba(255,107,53,0.3)]">＋ Create New Meetup</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {data.map((m) => {
        const totalAttendees = m.attendees ? m.attendees.length : 0;
        const maxLimit = m.maxParticipants || m.p || 10;
        return (
          <motion.div layout key={m._id || m.id} className="bg-[#6d28d9] p-10 rounded-[2.5rem] shadow-xl">
            <h3 className="text-2xl font-bold mb-6">{m.title}</h3>
            <div className="space-y-3 text-purple-100 mb-10">
              <p>📍 {m.location || m.loc}</p>
              <p>📅 {m.date || m.time} {m.time && !m.date ? "" : `• ${m.time || ""}`}</p>
              <p>👥 {totalAttendees} / {maxLimit} Joined</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => onEdit(m)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase text-xs">✏️ Edit</button>
              <button onClick={() => onBlock(m._id || m.id)} className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-bold uppercase text-xs transition-colors">🚫 Delete</button>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

const UsersSection = ({ data, onRestrict, onBlock }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-4xl font-bold mb-10 uppercase tracking-widest text-[#ff6b35]">Users ({data.length})</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {data.map((u) => (
        <motion.div layout key={u._id || u.id} className="bg-[#6d28d9] p-10 rounded-[3rem] flex flex-col items-center text-center shadow-2xl">
          <div className="w-24 h-24 bg-[#ff6b35] rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg border-4 border-white/10">
            {u.name ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
          </div>
          <h3 className="text-xl font-bold mb-1">{u.name}</h3>
          <p className="text-purple-200 text-sm mb-10">{u.email}</p>
          <div className="w-full space-y-4">
            <button onClick={() => onBlock(u)} className="w-full bg-[#ff6b35] py-3.5 rounded-2xl font-bold uppercase text-xs">{u.isBlocked ? "✅ Unblock" : "🚫 Block"}</button>
            <button onClick={() => onRestrict(u)} className="w-full bg-[#ff6b35] py-3.5 rounded-2xl font-bold uppercase text-xs">🛡️ Restrict</button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const AddPlaceModal = ({ isOpen, onClose, onAdd, categories }) => {
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mainImage: "",
    imagesText: "",
    mainImageFile: null,
    extraImageFiles: [],
    loc: "",
    rate: "",
    phone: "",
    desc: "",
    category: "",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="px-8 pt-8 pb-4"><h2 className="text-3xl font-black uppercase text-[#ff6b35]">Add New Place</h2></div>
            <div className="px-8 pb-8 space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mainImageFile: e.target.files[0],
                  })
                }
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setIsImagesModalOpen(true)}
                  className="border border-[#ff6b35]/40 text-[#ff6b35] px-4 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-[#ff6b35]/10 transition-all"
                >
                  + More Images
                </button>
              </div>

              <input
                required
                type="text"
                placeholder="Place Name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />

              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35] text-gray-300"
              >
                <option value="" className="text-gray-500">
                  Select Category
                </option>

                {categories.map((c) => (
                  <option key={c._id} value={c.name} className="text-white">
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                required
                type="text"
                placeholder="Location"
                onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="Rate (0 - 5)"
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none"
                />

                <input
                  
                  required
                  type="tel"
                  placeholder="Phone Number"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none"
                />
              </div>

              <textarea
                required
                placeholder="About the place..."
                rows="3"
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
              />

            </div>
            <div className="flex gap-4 p-8 bg-black/20">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-white/5 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white/5 transition-all"
              >
                Cancel
              </button>

              <button
                disabled={isSubmitting}
                onClick={async () => {
                  if (isSubmitting) return;

                  setIsSubmitting(true);
                  await onAdd(formData);
                  setIsSubmitting(false);
                }}
                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs shadow-lg ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#ff6b35]"
                }`}
              >
                {isSubmitting ? "Uploading..." : "Add"}
              </button>
            </div>
          </motion.div>
          <AnimatePresence>
            {isImagesModalOpen && (
              <div className="fixed inset-0 z-[180] flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsImagesModalOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-[#161e31] w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl"
                >
                  <h3 className="text-2xl font-black uppercase text-[#ff6b35] mb-4">
                    Extra Images
                  </h3>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        extraImageFiles: [
                          ...formData.extraImageFiles,
                          ...Array.from(e.target.files),
                        ],
                      })
                    }
                    className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  />
                  {formData.extraImageFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-[#ff6b35] font-bold">
                        {formData.extraImageFiles.length} extra images selected
                     </p>

                     {formData.extraImageFiles.map((file, index) => (
                        <div
                          key={index}
                          className="bg-[#060b1a] px-4 py-3 rounded-xl text-sm text-gray-300"
                        >
                        Extra Image {index + 1}: {file.name}
                       </div>
                     ))}
                   </div>
                  )}


                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setIsImagesModalOpen(false)} className="flex-1 border border-white/10 py-3 rounded-xl font-black uppercase text-xs hover:bg-white/5">Cancel</button>
                    <button onClick={() => setIsImagesModalOpen(false)} className="flex-1 bg-[#ff6b35] py-3 rounded-xl font-black uppercase text-xs">Done</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

const CreateMeetupModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ title: "", loc: "", date: "", time: "", p: "", notes: "" });
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="px-12 pt-12 pb-6"><h2 className="text-3xl font-black uppercase text-[#ff6b35] mb-2">Create Meetup</h2></div>
            <div className="px-12 pb-10 space-y-4">
              <input type="text" onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Meetup Name" className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none text-white focus:ring-2 focus:ring-[#ff6b35]" />
              <input type="text" onChange={(e) => setFormData({ ...formData, loc: e.target.value })} placeholder="Place Name / Location" className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none text-white focus:ring-2 focus:ring-[#ff6b35]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none text-white focus:ring-2 focus:ring-[#ff6b35]" />
                <input type="time" onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none text-white focus:ring-2 focus:ring-[#ff6b35]" />
              </div>
              <input type="number" min="2" placeholder="Max Attendance Limit" onChange={(e) => setFormData({ ...formData, p: e.target.value })} className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none text-white focus:ring-2 focus:ring-[#ff6b35]" />
              <textarea placeholder="Meetup Notes / Description..." rows="2" onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none text-white resize-none focus:ring-2 focus:ring-[#ff6b35]" />
            </div>
            <div className="flex gap-4 p-10 bg-black/20">
              <button onClick={onClose} className="flex-1 border border-white/10 py-5 rounded-2xl font-black uppercase text-xs hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={() => onCreate(formData)} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-[#e05a2b] transition-all">Create</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditMeetupModal = ({ isOpen, onClose, meetup, onCreateNew, onSave }) => {
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState([]);
  useEffect(() => {
    if (meetup) {
      setTitle(meetup.title || "");
      setAttendees(meetup.attendees || []);
    }
  }, [meetup, isOpen]);
  const handleRemoveAttendee = (nameToRemove) => { setAttendees(attendees.filter((name) => name !== nameToRemove)); };
  const handleSave = () => { onSave({ ...meetup, title, attendees, maxParticipants: meetup.maxParticipants || meetup.p || 10 }); };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="flex justify-between items-center px-10 py-8"><h2 className="text-2xl font-black uppercase">Edit Meetup</h2><button onClick={onClose} className="text-3xl text-gray-400">×</button></div>
            <div className="px-10 pb-10 space-y-6">
              <div className="space-y-2 text-left"><label className="text-xs font-bold text-gray-400 uppercase ml-2">Meetup Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#6d28d9] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" /></div>
              <button onClick={onCreateNew} className="w-full bg-[#6d28d9] py-5 rounded-2xl font-black text-lg hover:brightness-110">Create New Meetup</button>
              <div className="pt-4 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase text-left ml-2">Attendees List</p>
                {attendees.map((n, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#6d28d9] p-5 rounded-3xl">
                    <span className="font-bold">{n}</span>
                    <button onClick={() => handleRemoveAttendee(n)} className="bg-[#ff6b35] px-4 py-2 rounded-xl font-bold text-xs hover:scale-105 transition-transform">Remove</button>
                  </div>
                ))}
                {attendees.length === 0 && <p className="text-gray-500 italic">No attendees remaining</p>}
              </div>
            </div>
            <div className="flex gap-6 p-10 bg-black/20">
              <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase text-xs">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase text-xs">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const RestrictUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [res1, setRes1] = useState(true);
  const [res2, setRes2] = useState(true);
  useEffect(() => {
    if (user) {
      setRes1(user?.permissions?.createMeetup ?? true);
      setRes2(user?.permissions?.joinMeetups ?? true);
    }
  }, [user]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-12 py-8"><h2 className="text-2xl font-black uppercase">Restrict Access</h2><button onClick={onClose} className="text-3xl text-gray-400">×</button></div>
            <div className="px-12 pb-10 space-y-8">
              <div><h3 className="text-3xl font-bold">{user?.name}</h3><p className="text-gray-400">{user?.email}</p></div>
              <div className="bg-[#6d28d9] p-8 rounded-[2.5rem]">
                <h4 className="font-bold mb-4 text-left">Create Meetup</h4>
                <div className="flex gap-4">
                  <button onClick={() => setRes1(true)} className={`flex-1 py-4 rounded-2xl font-black ${res1 ? "bg-[#ff6b35]" : "bg-[#060b1a] text-gray-500"}`}>Yes</button>
                  <button onClick={() => setRes1(false)} className={`flex-1 py-4 rounded-2xl font-black ${!res1 ? "bg-[#ff6b35]" : "bg-[#060b1a] text-gray-500"}`}>No</button>
                </div>
              </div>
              <div className="bg-[#6d28d9] p-8 rounded-[2.5rem]">
                <h4 className="font-bold mb-4 text-left">Join Meetups</h4>
                <div className="flex gap-4">
                  <button onClick={() => setRes2(true)} className={`flex-1 py-4 rounded-2xl font-black ${res2 ? "bg-[#ff6b35]" : "bg-[#060b1a] text-gray-500"}`}>Yes</button>
                  <button onClick={() => setRes2(false)} className={`flex-1 py-4 rounded-2xl font-black ${!res2 ? "bg-[#ff6b35]" : "bg-[#060b1a] text-gray-500"}`}>No</button>
                </div>
              </div>
            </div>
            <div className="flex gap-6 p-10 bg-black/20">
              <button onClick={onClose} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase">Cancel</button>
              <button onClick={() => onSave(user, { createMeetup: res1, joinMeetups: res2 })} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditPlaceModal = ({ isOpen, onClose, place, onSave }) => {
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    loc: "",
    phone: "",
    desc: "",
    img: "",
    imageFile: null,
    imagesText: "",
    newExtraImageFiles: [],
    rate: "",
  });

  useEffect(() => {
    if (place) {
      const mainImage = place.image || place.img || "";
      const imagesArray = Array.isArray(place.images) ? place.images : [];
      setFormData({
        name: place.name || "",
        loc: place.loc || place.location || "",
        phone: place.phone || "",
        desc: place.desc || place.description || "",
        img: mainImage,
        newExtraImageFiles: [],
        imagesText: imagesArray.join("\n"),
        rate: place.rate || place.rating || "",
      });
    }
  }, [place, isOpen]);
  const handleSave = () => {
    const imagesFromPopup = formData.imagesText.split("\n").map((url) => url.trim()).filter(Boolean);
    const allImages = [formData.img, ...imagesFromPopup.filter((url) => url !== formData.img)].filter(Boolean);


    onSave({
      ...place,
      ...formData,
      image: formData.img,
      images: allImages,
      newExtraImageFiles: formData.newExtraImageFiles,
      rating: Number(formData.rate),
      description: formData.desc,
    });

  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#161e31] w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black uppercase mb-6 text-[#ff6b35]">Edit Place</h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    imageFile: e.target.files[0],
                  })
                }
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setIsImagesModalOpen(true)}
                  className="border border-[#ff6b35]/40 text-[#ff6b35] px-4 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-[#ff6b35]/10 transition-all"
                >
                  + Edit Extra Images
                </button>
              </div>

              <input
                type="text"
                value={formData.name}
                placeholder="Place Name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />

              <input
                type="text"
                value={formData.loc}
                placeholder="Location"
                onChange={(e) => setFormData({ ...formData, loc: e.target.value })}
                className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  min="0"
                  max="5"
                  step="0.1"
                  type="number"
                  value={formData.rate}
                  placeholder="Rate (0 - 5)"
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none"
                />

                <input
                  
                  type="tel"
                  value={formData.phone}
                  placeholder="Phone Number"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none"
                />

              </div>
              <textarea value={formData.desc} placeholder="About..." rows="3" onChange={(e) => setFormData({ ...formData, desc: e.target.value })} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none" />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={onClose}
                className="flex-1 border border-white/5 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                disabled={isSubmitting}
                onClick={async () => {
                  if (isSubmitting) return;

                  setIsSubmitting(true);
                  await handleSave();
                  setIsSubmitting(false);
                }}
                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs shadow-lg ${
                  isSubmitting
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#ff6b35]"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>

            </div>
          </motion.div>
          <AnimatePresence>
            {isImagesModalOpen && (
              <div className="fixed inset-0 z-[180] flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsImagesModalOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-[#161e31] w-full max-w-md rounded-[2rem] p-8 border border-white/10 shadow-2xl"
                >
                  <h3 className="text-2xl font-black uppercase text-[#ff6b35] mb-4">
                    Edit Extra Images
                  </h3>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newExtraImageFiles: [
                          ...formData.newExtraImageFiles,
                          ...Array.from(e.target.files),
                        ],
                      })
                    }
                    className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  />

                  {formData.newExtraImageFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm text-[#ff6b35] font-bold">
                        {formData.newExtraImageFiles.length} new images selected
                      </p>

                      {formData.newExtraImageFiles.map((file, index) => (
                        <div
                          key={index}
                          className="bg-[#060b1a] px-4 py-3 rounded-xl text-sm text-gray-300"
                        >
                          New Extra Image {index + 1}: {file.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {formData.imagesText
                      .split("\n")
                      .map((url) => url.trim())
                      .filter(Boolean)
                      .map((url, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-[#060b1a] p-3 rounded-2xl"
                        >
                          <img
                            src={url}
                            alt={`img-${index + 1}`}
                            className="w-16 h-16 object-cover rounded-xl"
                         />

                         <span className="flex-1 text-sm text-gray-300">
                            {index === 0
                              ? "Main Image"
                              : `Extra Image ${index}`}
                         </span>

                         {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedImages = formData.imagesText
                                  .split("\n")
                                  .map((x) => x.trim())
                                  .filter(Boolean)
                                  .filter((_, i) => i !== index);

                                setFormData({
                                  ...formData,
                                  imagesText: updatedImages.join("\n"),
                                });
                              }}
                                className="bg-red-600 px-3 py-2 rounded-xl text-xs font-black"
                              >
                                Delete
                              </button>
                          )}
                        </div>
                      ))}

                      {formData.imagesText
                        .split("\n")
                        .map((url) => url.trim())
                        .filter(Boolean).length === 0 && (
                          <p className="text-gray-400 text-sm">
                            No extra images.
                          </p>
                        )}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setIsImagesModalOpen(false)} className="flex-1 border border-white/10 py-3 rounded-xl font-black uppercase text-xs hover:bg-white/5">Cancel</button>
                    <button onClick={() => setIsImagesModalOpen(false)} className="flex-1 bg-[#ff6b35] py-3 rounded-xl font-black uppercase text-xs">Done</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};