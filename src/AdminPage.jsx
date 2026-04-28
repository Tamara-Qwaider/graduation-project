import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // إضافة الـ Navigate

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('places');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // تعريف الـ Navigate

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("user"); // مسح بيانات الجلسة
    navigate("/"); // العودة لصفحة الـ Login
  };

  // إغلاق القائمة المنسدلة
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- البيانات ---
  const [places, setPlaces] = useState([
    { id: 1, name: "The Urban Cafe", desc: "Modern coffee shop with excellent ambiance and workspace facilities.", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24", loc: "Downtown", rate: "4.8", phone: "123-456" },
    { id: 2, name: "Garden Bistro", desc: "Beautiful outdoor seating with garden views. Great for lunch meetings.", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", loc: "West Side", rate: "4.5", phone: "987-654" },
    { id: 3, name: "Skyline Lounge", desc: "Rooftop experience with a panoramic city view and premium services.", img: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7", loc: "Tower 1", rate: "4.9", phone: "555-000" },
  ]);

  const [meetups, setMeetups] = useState([
    { id: 1, title: "Tech Networking Breakfast", loc: "The Urban Cafe", time: "April 22, 2026 • 9:00 AM", p: 3 },
    { id: 2, title: "Design Thinking Workshop", loc: "Innovation Hub", time: "April 25, 2026 • 2:00 PM", p: 3 },
    { id: 3, title: "Community Yoga Session", loc: "Central Park Plaza", time: "April 28, 2026 • 7:00 AM", p: 2 },
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: "Sarah Johnson", email: "sarah.j@example.com", initial: "SJ" },
    { id: 2, name: "Michael Chen", email: "michael.c@example.com", initial: "MC" },
    { id: 3, name: "Emma Williams", email: "emma.w@example.com", initial: "EW" },
    { id: 4, name: "David Martinez", email: "david.m@example.com", initial: "DM" },
  ]);

  // --- منطق الفلترة ---
  const filteredPlaces = places.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMeetups = meetups.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- States للمودلز ---
  const [isEditMeetupOpen, setIsEditMeetupOpen] = useState(false);
  const [isCreateMeetupOpen, setIsCreateMeetupOpen] = useState(false);
  const [isRestrictUserOpen, setIsRestrictUserOpen] = useState(false);
  const [isEditPlaceOpen, setIsEditPlaceOpen] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false); 
  const [selectedItem, setSelectedItem] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  // دوال الإضافة والتعديل
  const handleCreateMeetup = (newMeetup) => {
    setMeetups([...meetups, { id: Date.now(), ...newMeetup }]);
    setIsCreateMeetupOpen(false);
  };

  const handleUpdateMeetup = (updatedMeetup) => {
    setMeetups(meetups.map(m => m.id === updatedMeetup.id ? updatedMeetup : m));
    setIsEditMeetupOpen(false);
  };

  const handleAddPlace = (newPlace) => {
    setPlaces([...places, { id: Date.now(), ...newPlace }]);
    setIsAddPlaceOpen(false);
  };

  const handleUpdatePlace = (updatedPlace) => {
    setPlaces(places.map(p => p.id === updatedPlace.id ? updatedPlace : p));
    setIsEditPlaceOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060b1a] text-white font-sans overflow-x-hidden">
      
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-12 py-6 bg-[#060b1a] sticky top-0 z-[100] border-b border-white/5">
        <h1 className="text-4xl font-black tracking-tighter uppercase">
          ADMIN <span className="text-[#ff6b35]">DASHBOARD</span>
        </h1>

        <div className="flex bg-[#0f172a] p-1.5 rounded-2xl gap-2">
          <TabButton active={activeTab === 'places'} onClick={() => handleTabChange('places')} label="Places" icon="📍" />
          <TabButton active={activeTab === 'meetup'} onClick={() => handleTabChange('meetup')} label="Meetup" icon="📅" />
          <TabButton active={activeTab === 'users'} onClick={() => handleTabChange('users')} label="Users" icon="👤" />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 bg-[#0f172a] p-2 pr-6 rounded-full border border-white/5 hover:bg-[#161e31] transition-all"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#ff6b35] overflow-hidden shadow-[0_0_15px_rgba(255,107,53,0.2)]">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=ff6b35&color=fff" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-bold leading-none mb-1">Admin Name</p>
              <p className="text-[10px] uppercase tracking-widest text-[#ff6b35] font-black">Super Admin</p>
            </div>
            <span className={`text-[10px] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>▼</span>
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

      {/* Main Content */}
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
          {activeTab === 'places' && (
            <PlacesSection 
              key="places" 
              data={filteredPlaces} 
              onEdit={(p) => { setSelectedItem(p); setIsEditPlaceOpen(true); }}
              onAddClick={() => setIsAddPlaceOpen(true)}
              onRemove={(id) => setPlaces(places.filter(x => x.id !== id))}
            />
          )}
          {activeTab === 'meetup' && (
            <MeetupSection 
              key="meetup" 
              data={filteredMeetups} 
              onEdit={(m) => { setSelectedItem(m); setIsEditMeetupOpen(true); }}
              onCreateClick={() => setIsCreateMeetupOpen(true)}
              onBlock={(id) => setMeetups(meetups.filter(x => x.id !== id))}
            />
          )}
          {activeTab === 'users' && (
            <UsersSection 
              key="users" 
              data={filteredUsers} 
              onRestrict={(u) => { setSelectedItem(u); setIsRestrictUserOpen(true); }}
              onBlock={(id) => setUsers(users.filter(x => x.id !== id))}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <EditPlaceModal 
        isOpen={isEditPlaceOpen} 
        onClose={() => setIsEditPlaceOpen(false)} 
        place={selectedItem} 
        onSave={handleUpdatePlace}
      />
      <AddPlaceModal isOpen={isAddPlaceOpen} onClose={() => setIsAddPlaceOpen(false)} onAdd={handleAddPlace} />
      
      <EditMeetupModal 
        isOpen={isEditMeetupOpen} 
        onClose={() => setIsEditMeetupOpen(false)} 
        meetup={selectedItem} 
        onSave={handleUpdateMeetup}
        onCreateNew={() => {setIsEditMeetupOpen(false); setIsCreateMeetupOpen(true);}} 
      />

      <CreateMeetupModal isOpen={isCreateMeetupOpen} onClose={() => setIsCreateMeetupOpen(false)} onCreate={handleCreateMeetup} />
      <RestrictUserModal isOpen={isRestrictUserOpen} onClose={() => setIsRestrictUserOpen(false)} user={selectedItem} />
    </div>
  );
}

// --- المكونات المساعدة ---

const DropdownItem = ({ icon, label, isDanger, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${isDanger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-[#ff6b35]/10 hover:text-white'}`}
  >
    <span>{icon}</span> {label}
  </button>
);

const TabButton = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-wider ${active ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
    <span>{icon}</span> {label}
  </button>
);

// --- Sections Components ---

const PlacesSection = ({ data, onEdit, onRemove, onAddClick }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-4xl font-bold uppercase tracking-widest text-[#ff6b35]">Places ({data.length})</h2>
      <button onClick={onAddClick} className="bg-[#ff6b35] px-8 py-3 rounded-full font-black uppercase text-xs shadow-[0_0_20px_rgba(255,107,53,0.3)]">＋ Add Place</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {data.map(p => (
        <motion.div layout key={p.id} className="bg-[#6d28d9] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <img src={p.img} alt="" className="h-72 w-full object-cover" />
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-3">{p.name}</h3>
            <p className="text-purple-100 text-sm mb-4 h-12 overflow-hidden">{p.desc}</p>
            <div className="flex items-center gap-4 text-xs font-bold text-purple-200 mb-8">
                <span>📍 {p.loc}</span>
                <span>⭐ {p.rate}</span>
                <span>📞 {p.phone}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => onEdit(p)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">✏️ Edit</button>
              <button onClick={() => onRemove(p.id)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">🗑️ Remove</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const MeetupSection = ({ data, onEdit, onBlock, onCreateClick }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-4xl font-bold uppercase tracking-widest text-[#ff6b35]">Meetups ({data.length})</h2>
      <button onClick={onCreateClick} className="bg-[#ff6b35] px-8 py-3 rounded-full font-black uppercase text-xs shadow-[0_0_20px_rgba(255,107,53,0.3)]">＋ Create New Meetup</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {data.map(m => (
        <motion.div layout key={m.id} className="bg-[#6d28d9] p-10 rounded-[2.5rem] shadow-xl">
          <h3 className="text-2xl font-bold mb-6">{m.title}</h3>
          <div className="space-y-3 text-purple-100 mb-10">
            <p>📍 {m.loc}</p>
            <p>📅 {m.time}</p>
            <p>👥 {m.p} People</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onEdit(m)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase text-xs">✏️ Edit</button>
            <button onClick={() => onBlock(m.id)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-bold uppercase text-xs">🚫 Delete</button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const UsersSection = ({ data, onRestrict, onBlock }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-4xl font-bold mb-10 uppercase tracking-widest text-[#ff6b35]">Users ({data.length})</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {data.map(u => (
        <motion.div layout key={u.id} className="bg-[#6d28d9] p-10 rounded-[3rem] flex flex-col items-center text-center shadow-2xl">
          <div className="w-24 h-24 bg-[#ff6b35] rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-lg border-4 border-white/10">{u.initial}</div>
          <h3 className="text-xl font-bold mb-1">{u.name}</h3>
          <p className="text-purple-200 text-sm mb-10">{u.email}</p>
          <div className="w-full space-y-4">
            <button onClick={() => onBlock(u.id)} className="w-full bg-[#ff6b35] py-3.5 rounded-2xl font-bold uppercase text-xs">🚫 Block</button>
            <button onClick={() => onRestrict(u)} className="w-full bg-[#ff6b35] py-3.5 rounded-2xl font-bold uppercase text-xs">🛡️ Restrict</button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const AddPlaceModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', img: '', loc: '', rate: '', phone: '', desc: '' });
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="px-10 pt-10 pb-6"><h2 className="text-3xl font-black uppercase text-[#ff6b35]">Add New Place</h2></div>
            <div className="px-10 pb-10 space-y-4">
              <input type="text" placeholder="Place Picture URL" onChange={(e)=>setFormData({...formData, img: e.target.value})} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" />
              <input type="text" placeholder="Place Name" onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" />
              <input type="text" placeholder="Location" onChange={(e)=>setFormData({...formData, loc: e.target.value})} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Rate (e.g. 4.5)" onChange={(e)=>setFormData({...formData, rate: e.target.value})} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none" />
                <input type="tel" placeholder="Phone Number" onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none" />
              </div>
              <textarea placeholder="About the place..." rows="3" onChange={(e)=>setFormData({...formData, desc: e.target.value})} className="w-full bg-[#060b1a] p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none" />
            </div>
            <div className="flex gap-4 p-8 bg-black/20">
              <button onClick={onClose} className="flex-1 border-2 border-white/5 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={() => onAdd(formData)} className="flex-1 bg-[#ff6b35] py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Add</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CreateMeetupModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({ title: '', loc: '', time: '', p: '' });
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="px-12 pt-12 pb-6"><h2 className="text-3xl font-black uppercase text-[#ff6b35] mb-2">Create Meetup</h2></div>
            <div className="px-12 pb-10 space-y-5">
              <input type="text" onChange={(e)=>setFormData({...formData, title: e.target.value})} placeholder="Meetup Name" className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" />
              <input type="text" onChange={(e)=>setFormData({...formData, loc: e.target.value})} placeholder="Place Name" className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" onChange={(e)=>setFormData({...formData, time: e.target.value})} placeholder="Date and Time" className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none" />
                <input type="number" onChange={(e)=>setFormData({...formData, p: e.target.value})} placeholder="Attendance" className="w-full bg-[#060b1a] p-5 rounded-2xl border-none outline-none" />
              </div>
            </div>
            <div className="flex gap-4 p-10 bg-black/20">
              <button onClick={onClose} className="flex-1 border-2 border-white/5 py-5 rounded-2xl font-black uppercase text-xs transition-all">Cancel</button>
              <button onClick={() => onCreate(formData)} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase text-xs shadow-lg">Create</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditMeetupModal = ({ isOpen, onClose, meetup, onCreateNew, onSave }) => {
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState(['David Martinez', 'Olivia Brown']);

  useEffect(() => {
    if (meetup) {
      setTitle(meetup.title || '');
      setAttendees(['David Martinez', 'Olivia Brown']); 
    }
  }, [meetup, isOpen]);

  const handleRemoveAttendee = (nameToRemove) => {
    setAttendees(attendees.filter(name => name !== nameToRemove));
  };

  const handleSave = () => {
    onSave({ 
      ...meetup, 
      title: title,
      p: attendees.length 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="flex justify-between items-center px-10 py-8">
              <h2 className="text-2xl font-black uppercase">Edit Meetup</h2>
              <button onClick={onClose} className="text-3xl text-gray-400">✕</button>
            </div>
            
            <div className="px-10 pb-10 space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">Meetup Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#6d28d9] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" 
                />
              </div>

              <button onClick={onCreateNew} className="w-full bg-[#6d28d9] py-5 rounded-2xl font-black text-lg hover:brightness-110">
                Create New Meetup
              </button>
              
              <div className="pt-4 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase text-left ml-2">Attendees List</p>
                {attendees.map((n, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#6d28d9] p-5 rounded-3xl">
                    <span className="font-bold">{n}</span>
                    <button 
                      onClick={() => handleRemoveAttendee(n)}
                      className="bg-[#ff6b35] px-4 py-2 rounded-xl font-bold text-xs hover:scale-105 transition-transform"
                    >
                      Remove
                    </button>
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

const RestrictUserModal = ({ isOpen, onClose, user }) => {
  const [res1, setRes1] = useState(true);
  const [res2, setRes2] = useState(true);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-12 py-8"><h2 className="text-2xl font-black uppercase">Restrict Access</h2><button onClick={onClose} className="text-3xl text-gray-400">✕</button></div>
            <div className="px-12 pb-10 space-y-8">
              <div><h3 className="text-3xl font-bold">{user?.name}</h3><p className="text-gray-400">{user?.email}</p></div>
              <div className="bg-[#6d28d9] p-8 rounded-[2.5rem]">
                <h4 className="font-bold mb-4 text-left">Create Meetup</h4>
                <div className="flex gap-4">
                  <button onClick={() => setRes1(true)} className={`flex-1 py-4 rounded-2xl font-black ${res1 ? 'bg-[#ff6b35]' : 'bg-[#060b1a] text-gray-500'}`}>Yes</button>
                  <button onClick={() => setRes1(false)} className={`flex-1 py-4 rounded-2xl font-black ${!res1 ? 'bg-[#ff6b35]' : 'bg-[#060b1a] text-gray-500'}`}>No</button>
                </div>
              </div>
              <div className="bg-[#6d28d9] p-8 rounded-[2.5rem]">
                <h4 className="font-bold mb-4 text-left">Add Others</h4>
                <div className="flex gap-4">
                  <button onClick={() => setRes2(true)} className={`flex-1 py-4 rounded-2xl font-black ${res2 ? 'bg-[#ff6b35]' : 'bg-[#060b1a] text-gray-500'}`}>Yes</button>
                  <button onClick={() => setRes2(false)} className={`flex-1 py-4 rounded-2xl font-black ${!res2 ? 'bg-[#ff6b35]' : 'bg-[#060b1a] text-gray-500'}`}>No</button>
                </div>
              </div>
            </div>
            <div className="flex gap-6 p-10 bg-black/20"><button onClick={onClose} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase">Cancel</button><button className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase">Save</button></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EditPlaceModal = ({ isOpen, onClose, place, onSave }) => {
  const [formData, setFormData] = useState({ name: '', loc: '', phone: '' });

  useEffect(() => {
    if (place) {
      setFormData({ 
        name: place.name || '', 
        loc: place.loc || '', 
        phone: place.phone || '' 
      });
    }
  }, [place, isOpen]);

  const handleSave = () => {
    onSave({ ...place, ...formData });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#161e31] w-full max-w-lg rounded-[2.5rem] p-12 shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-10 text-[#ff6b35]">Edit Place</h2>
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">Place Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#6d28d9] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" 
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">Location</label>
                <input 
                  type="text" 
                  value={formData.loc} 
                  onChange={(e) => setFormData({...formData, loc: e.target.value})}
                  placeholder="Location" 
                  className="w-full bg-[#6d28d9] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" 
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Phone" 
                  className="w-full bg-[#6d28d9] p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#ff6b35]" 
                />
              </div>
            </div>
            <div className="flex gap-6 mt-12">
              <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-2xl font-black uppercase hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#ff6b35] py-5 rounded-2xl font-black uppercase shadow-lg shadow-[#ff6b35]/20 hover:brightness-110 transition-all">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};