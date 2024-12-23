// Spinner.jsx
import React from "react";
import "./MySpinner.css";

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  );
}

export default Spinner;
