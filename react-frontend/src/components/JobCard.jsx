import { useNavigate } from "react-router-dom";

function JobCard({ job }) {
  const navigate = useNavigate();

  const handleViewJob = () => {
    navigate("/job-details", {
      state: {
        job
      }
    });
  };

  return (
    <article className="job-card">
      <div className="job-card-content">
        <h3>{job.title}</h3>

        <p className="company-name">
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

        {job.recruiter_name && (
          <p>
            <strong>Posted by:</strong>{" "}
            {job.recruiter_name}
          </p>
        )}

        <button onClick={handleViewJob}>
          View Job
        </button>
      </div>
    </article>
  );
}

export default JobCard;