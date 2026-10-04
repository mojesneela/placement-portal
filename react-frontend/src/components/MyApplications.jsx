import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const fetchApplications = async () => {
    if (!user || user.role !== "student") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://placement-portal-backend-y12s.onrender.com/api/applications/student/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setApplications(data);
      } else {
        console.error(data.error);
      }

    } catch (error) {
      console.error(
        "Error fetching applications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (!user) {
    return (
      <main className="applications-page">
        <h2>Please login first</h2>

        <button onClick={() => navigate("/login")}>
          Login
        </button>
      </main>
    );
  }

  if (user.role !== "student") {
    return (
      <main className="applications-page">
        <h2>Access Denied</h2>

        <p>
          Only students can view applications.
        </p>

        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </main>
    );
  }

  return (
    <main className="applications-page">
      <h1>My Applications</h1>

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p>You have not applied for any jobs yet.</p>

          <button onClick={() => navigate("/")}>
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="applications-container">
          {applications.map((application) => (
            <article
              className="application-card"
              key={application.id}
            >
              <h3>
                {application.job_title}
              </h3>

              <p>
                <strong>Company:</strong>{" "}
                {application.company}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {application.location}
              </p>

              <p>
                <strong>Applied On:</strong>{" "}
                {new Date(
                  application.applied_at
                ).toLocaleDateString()}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status status-${application.status.toLowerCase()}`}
                >
                  {application.status}
                </span>
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyApplications;