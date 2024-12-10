import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import axios from "axios";

function Province() {
  const { province } = useParams();
  const [election, setElection] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5005/api/elections/${province}`)
      .then((response) => {
        setElection(response.data);
      });
  }, [province]);

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
    </div>
  );
}

export default Province;
