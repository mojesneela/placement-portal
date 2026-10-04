import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddJob from "./AddJob";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    description: ""
  });

  const fetchData = async () => {
    try {
      const [jobsResponse, applicationsResponse] =
        await Promise.all([
          fetch("https://placement-portal-backend-y12s.onrender.com/api/jobs"),
          fetch("https://placement-portal-backend-y12s.onrender.com/api/applications")
        ]);

      const jobsData = await jobsResponse.json();
      const applicationsData =
        await applicationsResponse.json();

      if (jobsResponse.ok) {
        setJobs(
          jobsData.filter(
            (job) =>
              Number(job.created_by) === Number(user.id)
          )
        );
      }

      if (applicationsResponse.ok) {
        setApplications(applicationsData);
      }

    } catch (error) {
      console.error(
        "Error loading recruiter dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "recruiter") {
      navigate("/login");
      return;
    }

    fetchData();
  }, []);

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const startEditing = (job) => {
    setEditingJob(job.id);

    setEditForm({
      title: job.title,
      company: job.company,
      location: job.location,
      skills: job.skills,
      description: job.description || ""
    });
  };

  const cancelEditing = () => {
    setEditingJob(null);

    setEditForm({
      title: "",
      company: "",
      location: "",
      skills: "",
      description: ""
    });
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://placement-portal-backend-y12s.onrender.com/api/jobs/${editingJob}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editForm)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update job");
        return;
      }

      alert("Job updated successfully!");

      cancelEditing();
      fetchData();

    } catch (error) {
      console.error("Update job error:", error);
      alert("Unable to connect to the server");
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `https://placement-portal-backend-y12s.onrender.com/api/jobs/${jobId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete job");
        return;
      }

      alert("Job deleted successfully!");

      fetchData();

    } catch (error) {
      console.error("Delete job error:", error);
      alert("Unable to connect to the server");
    }
  };

  const handleStatusChange = async (
    applicationId,
    status
  ) => {
    try {
      const response = await fetch(
        `https://placement-portal-backend-y12s.onrender.com/api/applications/${applicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
          "Failed to update application status"
        );
        return;
      }

      fetchData();

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert("Unable to connect to the server");
    }
  };

  const recruiterApplications = applications.filter(
    (application) =>
      jobs.some(
        (job) =>
          Number(job.id) ===
          Number(application.job_id)
      )
  );

  if (!user || user.role !== "recruiter") {
    return null;
  }

  return (
    <main className="recruiter-dashboard">

      <section className="dashboard-header">
        <h1>Recruiter Dashboard</h1>

        <p>
          Welcome, {user.name}
        </p>
      </section>

      <AddJob onJobAdded={fetchData} />

      <section className="recruiter-jobs">
        <h2>My Jobs</h2>

        {loading ? (
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p>
            You have not posted any jobs yet.
          </p>
        ) : (
          <div className="recruiter-job-list">
            {jobs.map((job) => (
              <article
                className="recruiter-job-card"
                key={job.id}
              >
                {editingJob === job.id ? (
                  <form
                    onSubmit={handleUpdateJob}
                    className="edit-job-form"
                  >
                    <h3>Edit Job</h3>

                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      placeholder="Job Title"
                      required
                    />

                    <input
                      name="company"
                      value={editForm.company}
                      onChange={handleEditChange}
                      placeholder="Company"
                      required
                    />

                    <input
                      name="location"
                      value={editForm.location}
                      onChange={handleEditChange}
                      placeholder="Location"
                      required
                    />

                    <input
                      name="skills"
                      value={editForm.skills}
                      onChange={handleEditChange}
                      placeholder="Skills"
                      required
                    />

                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      placeholder="Description"
                      rows="4"
                    />

                    <div className="button-group">
                      <button type="submit">
                        Save Changes
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{job.title}</h3>

                    <p>
                      <strong>Company:</strong>{" "}
                      {job.company}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {job.location}
                    </p>

                    <p>
                      <strong>Skills:</strong>{" "}
                      {job.skills}
                    </p>

                    <p>
                      <strong>Description:</strong>{" "}
                      {job.description}
                    </p>

                    <div className="button-group">
                      <button
                        onClick={() =>
                          startEditing(job)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDeleteJob(job.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="applications-management">
        <h2>Applications</h2>

        {recruiterApplications.length === 0 ? (
          <p>
            No applications received yet.
          </p>
        ) : (
          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Job</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recruiterApplications.map(
                  (application) => (
                    <tr key={application.id}>
                      <td>
                        {application.student_name}
                      </td>

                      <td>
                        {application.student_email}
                      </td>

                      <td>
                        {application.job_title}
                      </td>

                      <td>
                        {new Date(
                          application.applied_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <select
                          value={application.status}
                          onChange={(e) =>
                            handleStatusChange(
                              application.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="Applied">
                            Applied
                          </option>

                          <option value="Shortlisted">
                            Shortlisted
                          </option>

                          <option value="Selected">
                            Selected
                          </option>

                          <option value="Rejected">
                            Rejected
                          </option>
                        </select>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </main>
  );
}

export default RecruiterDashboard;