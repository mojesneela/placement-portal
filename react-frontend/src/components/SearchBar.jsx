function SearchBar({
  searchText,
  setSearchText,
  selectedLocation,
  setSelectedLocation
}) {
  return (
    <section className="search-section">
      <h2>Search Jobs</h2>

      <div className="search-controls">
        <input
          type="text"
          placeholder="Search by job title, company or skill"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="All Locations">
            All Locations
          </option>

          <option value="Hyderabad">
            Hyderabad
          </option>

          <option value="Bangalore">
            Bangalore
          </option>

          <option value="Chennai">
            Chennai
          </option>

          <option value="Remote">
            Remote
          </option>
        </select>
      </div>
    </section>
  );
}

export default SearchBar;