import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const userString = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!userString || !token) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userString);

    // حماية صفحات الأدمن
    if (adminOnly && user.role !== "admin") {
      return <Navigate to="/home" replace />;
    }

    return children;
  } catch (e) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return <Navigate to="/" replace />;
  }
}