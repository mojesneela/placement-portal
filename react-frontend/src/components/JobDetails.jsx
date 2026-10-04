import { useLocation, useNavigate } from "react-router-dom";

function JobDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const job = location.state?.job;

  const handleApply = async () => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("Please login before applying.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "student") {
      alert("Only students can apply for jobs.");
      return;
    }

    if (!job) {
      alert("Job information is unavailable.");
      return;
    }

    try {
      const response = await fetch(
        "https://placement-portal-backend-y12s.onrender.com/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            student_id: user.id,
            job_id: job.id
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Application submitted successfully!");
      } else {
        alert(data.error || "Failed to apply");
      }

    } catch (error) {
      console.error("Application error:", error);
      alert("Unable to connect to the server");
    }
  };

  if (!job) {
    return (
      <main className="job-details">
        <h2>Job not found</h2>

        <button onClick={() => navigate("/")}>
          Back to Jobs
        </button>
      </main>
    );
  }

  return (
    <main className="job-details">
      <div className="job-details-card">

        <h1>{job.title}</h1>

        <h3>{job.company}</h3>

        <div className="job-info">
          <p>
            <strong>Location:</strong>{" "}
            {job.location}
          </p>

          <p>
            <strong>Skills:</strong>{" "}
            {job.skills}
          </p>

          {job.recruiter_name && (
            <p>
              <strong>Recruiter:</strong>{" "}
              {job.recruiter_name}
            </p>
          )}

          <p>
            <strong>Description:</strong>
          </p>

          <p className="job-description">
            {job.description}
          </p>
        </div>

        <div className="job-actions">
          <button onClick={handleApply}>
            Apply Now
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/")}
          >
            Back to Jobs
          </button>
        </div>

      </div>
    </main>
  );
}

export default JobDetails;