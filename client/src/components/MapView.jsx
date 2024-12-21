import React, { useState } from "react";
import PropTypes from "prop-types";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import provincesData from "../province_name_map.json";
import "./MapView.css";

const MapView = ({ geoUrl, handleProvinceClick, getProvinceFillColor }) => {
  // State for Tooltip
  const [tooltip, setTooltip] = useState({
    show: false,
    name: "",
    x: 0,
    y: 0,
  });

  const handleMouseMove = (geo, evt) => {
    const thaiName = provincesData[geo.properties.name] || geo.properties.name;

    setTooltip({
      show: true,
      name: thaiName,
      x: evt.clientX - 500, // Offset slightly to the right
      y: evt.clientY + 10, // Offset slightly downwards
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, name: "", x: 0, y: 0 }); // Hide tooltip
  };

  return (
    <div className="map-container">
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x + 15}px`, // Offset tooltip position
            top: `${tooltip.y + 15}px`,
          }}
        >
          {tooltip.name}
        </div>
      )}

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2000, center: [100, 13.5] }}
        style={{ width: "100%", height: "100vh" }}
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
                  onMouseMove={(evt) => handleMouseMove(geo, evt)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleProvinceClick(geo.properties.name)}
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
