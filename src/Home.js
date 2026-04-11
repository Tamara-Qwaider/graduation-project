import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Users,
  User,
  Search,
  Star,
  X,
  Activity
} from "lucide-react";

const placesData = [
  {
    id: 1,
    name: "Petra",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
    location: "Jordan",
    rating: 4.9,
    description: "Ancient city carved in rose-red rock.",
    images: [
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1",
      "https://images.unsplash.com/photo-1580706486641-ebec9f673d36",
      "https://images.unsplash.com/photo-1662747975053-ee44de7015a0"
    ]
  },
  {
    id: 2,
    name: "Dead Sea",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1601140434639-9f0f7b4f2d7a",
    location: "Jordan",
    rating: 4.8,
    description: "Lowest point on Earth.",
    images: [
      "https://images.unsplash.com/photo-1601140434639-9f0f7b4f2d7a"
    ]
  },
  {
    id: 3,
    name: "Wadi Rum",
    category: "Suggestions",
    image: "https://images.unsplash.com/photo-1610878180933-8d7f7f0f2a0d",
    location: "Jordan",
    rating: 4.7,
    description: "Beautiful desert adventure.",
    images: [
      "https://images.unsplash.com/photo-1610878180933-8d7f7f0f2a0d"
    ]
  },
  {
    id: 4,
    name: "Cafe Milano",
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    location: "Amman",
    rating: 4.5,
    description: "Cozy cafe.",
    images: []
  },
  {
    id: 5,
    name: "Street Coffee",
    category: "Cafes",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
    location: "Amman",
    rating: 4.6,
    description: "Fresh coffee.",
    images: []
  },
  {
    id: 6,
    name: "Levant Restaurant",
    category: "Restaurants",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    location: "Amman",
    rating: 4.8,
    description: "Traditional food.",
    images: []
  },
  {
    id: 7,
    name: "Roman Amphitheater",
    category: "Activities",
    image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427",
    location: "Amman",
    rating: 4.7,
    description: "Historic Roman site.",
    images: []
  }
];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // ✅ أهم تعديل هنا (ديناميكي)
  const categories = [...new Set(placesData.map(p => p.category))];

  const Card = ({ item }) => (
    <div
      onClick={() => setSelected(item)}
      className="min-w-[200px] bg-white/90 rounded-2xl p-3 cursor-pointer 
      hover:scale-110 transition duration-300 shadow-lg"
    >
      <img
        src={item.image}
        className="w-full h-32 object-cover rounded-xl"
        alt={item.name}
      />

      <h3 className="text-sm mt-2 font-semibold">{item.name}</h3>
      <p className="text-xs text-gray-500">{item.location}</p>

      <div className="flex items-center gap-1 text-xs mt-1 text-yellow-500">
        <Star size={12} />
        {item.rating}
      </div>
    </div>
  );

  const Section = ({ title, items }) => (
    <div className="mb-10">
      <h2 className="text-white text-xl font-bold mb-3">{title}</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-900 to-pink-700 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center text-white mb-8">
        <div className="flex items-center gap-2">
          <Compass />
          <h1 className="text-xl font-bold">KASHTA</h1>
        </div>

        <div className="flex gap-6 text-sm">
          <span className="cursor-pointer hover:underline">Sign in</span>
          <span className="cursor-pointer hover:underline">Sign out</span>
        </div>
      </div>

      {/* ICONS */}
      <div className="flex justify-center gap-10 mb-10">

        <div
          onClick={() => navigate("/activities")}
          className="bg-white/90 p-4 rounded-2xl shadow-xl flex flex-col items-center cursor-pointer"
        >
          <Activity />
          <span className="text-xs mt-1">Activities</span>
        </div>

        <div
          onClick={() => navigate("/meetup")}
          className="bg-white/90 p-4 rounded-2xl shadow-xl flex flex-col items-center cursor-pointer"
        >
          <Users />
          <span className="text-xs mt-1">Meetup</span>
        </div>

        <div
          onClick={() => navigate("/profile")}
          className="bg-white/90 p-4 rounded-2xl shadow-xl flex flex-col items-center cursor-pointer"
        >
          <User />
          <span className="text-xs mt-1">Profile</span>
        </div>

      </div>

      {/* SEARCH */}
      <div className="flex justify-center mb-10">
        <div className="bg-white rounded-full px-6 py-4 flex items-center w-full max-w-2xl shadow-xl">
          <Search />
          <input
            placeholder="Search..."
            className="ml-3 w-full outline-none text-lg"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SECTIONS (🔥 ديناميكي) */}
      {categories.map((cat) => (
        <Section
          key={cat}
          title={cat}
          items={placesData
            .filter(p => p.category === cat)
            .filter(p =>
              p.name.toLowerCase().includes(search.toLowerCase())
            )}
        />
      ))}

      {/* POPUP */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-2xl rounded-2xl p-6 relative">

            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>

            <p className="text-gray-700 mb-4">{selected.description}</p>

            <button className="w-full bg-purple-600 text-white py-3 rounded-xl">
              Create a Meetup
            </button>

          </div>
        </div>
      )}

    </div>
  );
}