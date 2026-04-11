import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Signup from "./Signup";
import Profile from "./Profile";
import Interests from "./Interests";
import LoginPage from "./LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/interests" element={<Interests />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
