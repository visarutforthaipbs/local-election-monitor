import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoPath, geoCentroid } from "d3-geo";
import provincesData from "../province_name_map.json";
import UserNeedsWordCloud from "./UserNeedsWordCloud"; // Import WordCloud
import "./MapView.css";

const MapView = ({ geoUrl, handleProvinceClick, getProvinceFillColor }) => {
  // Detect if the screen is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State for Tooltip
  const [tooltip, setTooltip] = useState({
    show: false,
    name: "",
    x: 0,
    y: 0,
  });

  // State for Collapsible Tab
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);

  // Handle Tooltip Position using Centroid
  const handleMouseMove = (geo) => {
    const centroid = geoCentroid(geo);
    setTooltip({
      show: true,
      name: provincesData[geo.properties.name] || geo.properties.name,
      x: centroid[0],
      y: centroid[1],
    });
  };

  // Hide Tooltip on Mouse Leave
  const handleMouseLeave = () => {
    setTooltip({ show: false, name: "", x: 0, y: 0 });
  };

  const handleProvinceClickWithData = (provinceName) => {
    handleProvinceClick(provinceName);
    setSelectedProvince(provinceName); // Update selected province
    setIsTabOpen(true); // Open collapsible tab
  };

  return (
    <div className="map-container">
      {/* Collapsible Tab */}
      {isMobile && (
        <div className={`collapsible-tab ${isTabOpen ? "open" : ""}`}>
          <button
            className="toggle-button"
            onClick={() => setIsTabOpen(!isTabOpen)}
          >
            ความต้องการของประชาชน
          </button>
          {isTabOpen && (
            <div className="tab-content">
              <div className="wordcloud-container">
                {selectedProvince ? (
                  <UserNeedsWordCloud province={selectedProvince} />
                ) : (
                  <p className="wordcloud-placeholder">
                    เลือกจังหวัดเพื่อแสดงข้อมูล
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            position: "absolute",
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(115vh, 10vh)",
          }}
        >
          {tooltip.name}
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: isMobile ? 3500 : 1800, // Adjust scale for desktop
          center: isMobile ? [101, 11.5] : [100, 13.5], // Adjust center for desktop
        }}
        style={{
          width: "100%",
          height: isMobile ? "105vh" : "100vh", // Dynamic height adjustment
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fill = getProvinceFillColor(geo.properties.name);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#FFFFFF"
                  className="geography"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#8C6A4A", outline: "none" },
                    pressed: { fill: "#735639", outline: "none" },
                  }}
                  onMouseMove={() => handleMouseMove(geo)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() =>
                    handleProvinceClickWithData(geo.properties.name)
                  }
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

// Prop validation
MapView.propTypes = {
  geoUrl: PropTypes.string.isRequired,
  handleProvinceClick: PropTypes.func.isRequired,
  getProvinceFillColor: PropTypes.func.isRequired,
};

export default MapView;
