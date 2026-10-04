import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    console.log("REGISTER BUTTON CLICKED");
    console.log("Form data:", formData);

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://placement-portal-backend-y12s.onrender.com/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();

      console.log("Response data:", data);

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Registration successful!");

      setLoading(false);
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to the server");
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        <h2>Create Account</h2>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <form onSubmit={(e) => e.preventDefault()}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">
              Student
            </option>

            <option value="recruiter">
              Recruiter
            </option>
          </select>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}

export default Register;