import React, { useState } from "react";
import "./ElectionPopup.css";
import uncleImage from "/unCle.png";

const ElectionPopup = ({ isVisible, onClose, electionData }) => {
  if (!isVisible || !electionData) return null;

  // State for toggling nested details
  const [showDetails, setShowDetails] = useState(false);

  // Sort candidates to get the winner and others
  const sortedCandidates = [...electionData.candidates].sort(
    (a, b) => b.votes - a.votes
  );
  const winner = sortedCandidates[0];
  const otherCandidates = sortedCandidates.slice(1);

  return (
    <div className="election-popup">
      {/* Province and Election Date */}
      <header className="election-header">
        <h2>{electionData.province}</h2>
        <p className="election-date">
          📅 วันเลือกตั้ง:{" "}
          {new Intl.DateTimeFormat("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(new Date(electionData.electionDate))}
        </p>
      </header>

      {/* Winner Section */}
      <section className="winner-card">
        <img
          src={winner.imageUrl || uncleImage}
          alt={winner.name}
          className="winner-image"
        />
        <div className="winner-details">
          <p className="winner-name">🏆 {winner.name}</p>
          <p className="winner-info">พรรค: {winner.party}</p>
          <p className="winner-info">
            คะแนน: {winner.votes.toLocaleString()} ({winner.percentage}%)
          </p>

          {/* Toggle Section for Additional Info */}
          <div
            className="toggle-header"
            onClick={() => setShowDetails(!showDetails)}
            style={{ cursor: "pointer" }}
          >
            <h4 className="winner-details-header">ข้อมูลเพิ่มเติม</h4>
          </div>
          {showDetails && (
            <div className="nested-details-card">
              <p className="winner-info">
                <strong>สังกัดคาดการณ์:</strong> {winner.nationalParty}
              </p>
              <ul className="winner-details-list">
                {winner.details &&
                  winner.details.map((detail, index) => (
                    <li key={index} className="winner-details-item">
                      {detail}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Election Results */}
      <section className="election-results">
        <h3>📊 ผลการเลือกตั้ง</h3>
        <ul>
          <li>
            จำนวนผู้มาใช้สิทธิ: {electionData.totalVotes.toLocaleString()}
          </li>
          <li>เปอร์เซ็นต์ผู้มาใช้สิทธิ: {electionData.turnout}%</li>
          <li>บัตรดี: {electionData.validVotes.toLocaleString()}</li>
          <li>บัตรเสีย: {electionData.invalidVotes.toLocaleString()}</li>
          <li>
            ไม่ประสงค์ลงคะแนน: {electionData.noVotePreference.toLocaleString()}
          </li>
        </ul>
      </section>

      {/* Other Candidates */}
      <section className="other-candidates">
        <h3>🗳️ ผู้สมัครคนอื่น</h3>
        <ul className="candidates-list">
          {otherCandidates.map((candidate, index) => (
            <li key={index}>
              {candidate.name} ({candidate.party}) -{" "}
              {candidate.votes.toLocaleString()} โหวต ({candidate.percentage}%)
            </li>
          ))}
        </ul>
      </section>

      {/* Close Button */}
      <footer>
        <button className="close-button" onClick={onClose}>
          ปิด
        </button>
      </footer>
    </div>
  );
};

export default ElectionPopup;
