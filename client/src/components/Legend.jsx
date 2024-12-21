import React from "react";
import "./Legend.css";

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "#1bb2b5" }}
        ></div>
        <span>เลือกตั้งไปแล้ว</span>
      </div>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "#f4f4f4" }}
        ></div>
        <span>ยังไม่ได้เลือกตั้ง</span>
      </div>
    </div>
  );
};

export default Legend;
