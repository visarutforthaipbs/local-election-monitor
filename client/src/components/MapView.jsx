import React from "react";
import PropTypes from "prop-types";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const MapView = ({ geoUrl, handleProvinceClick, getProvinceFillColor }) => {
  return (
    <div className="map-container">
      {/* The map component renders geographical data */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2000, center: [100, 13.5] }}
        style={{ width: "75vw", height: "100vh" }} // Make it full screen
      >
        <Geographies geography={geoUrl}>
          {({ geographies, loading }) => {
            if (loading) return <div>Loading map...</div>;
            if (!geographies) return <div>Error loading geographies!</div>;

            return geographies.map((geo) => {
              const fill = getProvinceFillColor(geo.properties.name);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#FFFFFF"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#8C6A4A", outline: "none" },
                    pressed: { fill: "#735639", outline: "none" },
                  }}
                  onClick={() => handleProvinceClick(geo.properties.name)}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>
    </div>
  );
};

// Prop validation for MapView component
MapView.propTypes = {
  geoUrl: PropTypes.string.isRequired,
  handleProvinceClick: PropTypes.func.isRequired,
  getProvinceFillColor: PropTypes.func.isRequired,
};

export default MapView;
