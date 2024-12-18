import React from "react";

const Legend = () => {
  return (
    <div className="legend">
      <h4>🗺️ Legend</h4>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "#C2B092" }}
        ></div>
        <span>จังหวัดที่เลือกตั้งไปแล้ว</span>
      </div>
      <div className="legend-item">
        <div
          className="legend-color"
          style={{ backgroundColor: "#EDE0D4" }}
        ></div>
        <span>จังหวัดที่ยังไม่ได้เลือกตั้ง</span>
      </div>
    </div>
  );
};

export default Legend;
