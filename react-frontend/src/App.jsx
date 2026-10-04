import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import JobCard from "./components/JobCard";
import JobDetails from "./components/JobDetails";
import Login from "./components/login";
import Register from "./components/register";
import MyApplications from "./components/MyApplications";
import RecruiterDashboard from "./components/RecruiterDashboard";

import "./App.css";


function Home() {
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState("All Locations");

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        "https://placement-portal-backend-y12s.onrender.com/api/jobs"
      );

      const data = await response.json();

      if (response.ok) {
        setJobs(data);
      } else {
        console.error(data.error);
      }

    } catch (error) {
      console.error(
        "Error fetching jobs:",
        error
      );
    }
  };


  useEffect(() => {
    fetchJobs();
  }, []);


  const filteredJobs = jobs.filter((job) => {

    const search = searchText.toLowerCase();

    const matchesSearch =
      job.title
        .toLowerCase()
        .includes(search) ||

      job.company
        .toLowerCase()
        .includes(search) ||

      job.skills
        .toLowerCase()
        .includes(search);


    const matchesLocation =
      selectedLocation === "All Locations" ||
      job.location === selectedLocation;


    return (
      matchesSearch &&
      matchesLocation
    );
  });


  return (
    <>
      <Navbar />

      <main>

        <section className="hero">
          <h2>
            Find Your Dream Job
          </h2>

          <p>
            Explore opportunities and
            start your career.
          </p>
        </section>


        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />


        <section id="jobs">

          <h2>
            Available Jobs
          </h2>


          {filteredJobs.length === 0 ? (

            <p>
              No jobs found.
            </p>

          ) : (

            <div className="job-container">

              {filteredJobs.map((job) => (

                <JobCard
                  key={job.id}
                  job={job}
                />

              ))}

            </div>
          )}

        </section>

      </main>
    </>
  );
}


function App() {

  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/job-details"
        element={<JobDetails />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/my-applications"
        element={<MyApplications />}
      />

      <Route
        path="/recruiter-dashboard"
        element={<RecruiterDashboard />}
      />

    </Routes>
  );
}


export default App;