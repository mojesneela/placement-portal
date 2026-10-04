import { useState } from "react";

function AddJob({ onJobAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("Please login first.");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "recruiter") {
      alert("Only recruiters can add jobs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...formData,
            created_by: user.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add job");
        return;
      }

      alert("Job added successfully!");

      setFormData({
        title: "",
        company: "",
        location: "",
        skills: "",
        description: ""
      });

      if (onJobAdded) {
        onJobAdded();
      }

    } catch (error) {
      console.error("Add job error:", error);
      alert("Unable to connect to the server");

    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="add-job">
      <h2>Add New Job</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="skills"
          placeholder="Skills (e.g. React, Python, SQL)"
          value={formData.skills}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding Job..." : "Add Job"}
        </button>

      </form>
    </section>
  );
}

export default AddJob;