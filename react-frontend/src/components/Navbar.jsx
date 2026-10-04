import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          Placement Portal
        </Link>

        <nav>
          <Link to="/">Home</Link>

          {user?.role === "student" && (
            <Link to="/my-applications">
              My Applications
            </Link>
          )}

          {user?.role === "recruiter" && (
            <Link to="/recruiter-dashboard">
              Recruiter Dashboard
            </Link>
          )}

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span className="welcome">
                Hi, {user.name}
              </span>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;