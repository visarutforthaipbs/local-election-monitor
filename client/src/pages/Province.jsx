import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import axios from "axios";

function Province() {
  const params = useParams();
  const province = params?.province || ""; // Safe check for province param
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!province) return; // Avoid fetch if province is empty

    // Fetch election data
    axios
      .get(`http://localhost:5005/api/elections/${province}`)
      .then((response) => {
        setElection(response.data);
      })
      .catch((error) => {
        console.error("Error fetching election data:", error);
      });

    // Fetch feedback data
    axios
      .get(`http://localhost:5005/api/feedback/${province}`)
      .then((response) => {
        setFeedbacks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching feedbacks:", error);
      });
  }, [province]);

  const handleFeedbackSubmit = () => {
    if (!newFeedback.trim()) {
      setErrorMessage("Feedback cannot be empty");
      return;
    }

    axios
      .post("http://localhost:5005/api/feedback", {
        province,
        feedback: newFeedback,
      })
      .then((response) => {
        setFeedbacks([...feedbacks, { province, feedback: newFeedback }]);
        setNewFeedback("");
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
        setErrorMessage("Failed to submit feedback. Please try again.");
      });
  };

  if (!election) return <p>Loading...</p>;

  const data = {
    labels: election.candidates.map((c) => c.name),
    datasets: [
      {
        label: "Votes",
        data: election.candidates.map((c) => c.votes),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div>
      <h2>{election.province}</h2>
      <p>Election Date: {election.electionDate}</p>
      <p>Total Votes: {election.totalVotes}</p>
      <p>Turnout: {election.turnout}%</p>
      <Bar data={data} />

      <h3>Feedback</h3>
      <ul>
        {feedbacks.map((feedback, index) => (
          <li key={index}>{feedback.feedback}</li>
        ))}
      </ul>

      <div>
        <textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Share your thoughts..."
        ></textarea>
        <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#8C6A4A",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Back to Home
      </button>
    </div>
  );
}

export default Province;
