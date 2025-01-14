// MapView.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import provincesData from "../province_name_map.json";
import UserNeedsWordCloud from "./UserNeedsWordCloud";
import "./MapView.css";

const MapView = ({ geoUrl, handleProvinceClick, getProvinceFillColor }) => {
  // Detect if we're on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // A ref for the map container <div>, so we can get its bounding box
  const mapContainerRef = useRef(null);

  // Tooltip state: whether it’s visible, text, and x/y (relative to container)
  const [tooltip, setTooltip] = useState({
    show: false,
    name: "",
    x: 0,
    y: 0,
  });

  // For the collapsible tab on mobile
  const [isTabOpen, setIsTabOpen] = useState(false);

  // The selected Thai province for word cloud
  const [selectedProvince, setSelectedProvince] = useState(null);

  // When the mouse moves over a province, position tooltip near the cursor
  const handleMouseMove = (event, geo) => {
    // Get bounding rectangle of the .map-container
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return; // If the ref isn't set yet, abort

    // Calculate X/Y relative to the container’s top-left
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltip({
      show: true,
      name: provincesData[geo.properties.name] || geo.properties.name,
      x,
      y,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, name: "", x: 0, y: 0 });
  };

  // Convert the English provinceName -> Thai, open collapsible, etc.
  const handleProvinceClickWithData = (provinceName) => {
    handleProvinceClick(provinceName);

    const thaiName = provincesData[provinceName];
    if (!thaiName) {
      console.warn("No Thai name found for:", provinceName);
      return;
    }
    setSelectedProvince(thaiName);
    setIsTabOpen(true);
  };

  return (
    <div
      className="map-container"
      ref={mapContainerRef} /* Attach the ref here */
    >
      {/* Collapsible Tab (mobile only) */}
      {isMobile && (
        <div className={`collapsible-tab ${isTabOpen ? "open" : ""}`}>
          <button
            className="toggle-button"
            onClick={() => setIsTabOpen(!isTabOpen)}
          >
            ความต้องการของประชาชน 👆{" "}
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
            left: tooltip.x + 15, // offset so it’s not under the cursor
            top: tooltip.y + 15,
            transform: "none", // remove any large translation
          }}
        >
          {tooltip.name}
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: isMobile ? 3500 : 1800,
          center: isMobile ? [101, 11.5] : [106, 11.5],
        }}
        style={{
          width: "180%",
          height: isMobile ? "105vh" : "100vh",
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
                  onMouseMove={(event) => handleMouseMove(event, geo)}
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

MapView.propTypes = {
  geoUrl: PropTypes.string.isRequired,
  handleProvinceClick: PropTypes.func.isRequired,
  getProvinceFillColor: PropTypes.func.isRequired,
};

export default MapView;
