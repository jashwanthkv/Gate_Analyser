import React, { useState } from "react";
import axios from "axios";
import StudentDetails from "./components/StudentDetails";
import "./styles.css";

const App: React.FC = () => {
  const [Regno, setRegno] = useState(""); 
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState(""); 

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.get(`https://gate-analyser.onrender.com/students/${Regno}`);
      setStudent(response.data);
    } catch (error) {
      console.error("Error fetching student:", error);
      setError("Student not found!");
      setTimeout(() => setError(""), 3000);
      setStudent(null);
    }
  };

  return (
    <div className="container">
      <h1 className="analysis-title">Student Exam Analysis</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Enter Reg No"
          value={Regno}
          onChange={(e) => setRegno(e.target.value)}
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {/* Display Results */}
      {error && <p className="error">{error}</p>}
      {student && <StudentDetails student={student} />}
    </div>
  );
};

export default App;
