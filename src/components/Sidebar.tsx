// src/components/Sidebar.tsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/Sidebar.css";

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Hide sidebar on cover page
  if (location.pathname === "/cover") {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();

    // ✅ notify router
    window.dispatchEvent(new Event("auth-change"));

    navigate("/cover");
  };


  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Exam System</h3>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/exams" className="sidebar-link">
          Exams
        </NavLink>
        
        <NavLink to="/results" className="sidebar-link">
          Results
        </NavLink>


      </nav>

      {/* SETTINGS */}
      <div className="sidebar-settings">
        <strong>Settings</strong>

        <button className="theme-toggle-btn" onClick={toggleTheme}>
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>

        <button
          className="theme-toggle-btn logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
