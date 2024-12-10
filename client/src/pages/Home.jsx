import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import axios from "axios";
import "./Home.css";
import provinceNameMap from "../province_name_map.json";

const geoUrl = "/thailandWithName.json";

function Home() {
  const [elections, setElections] = useState([]);
  const [stats, setStats] = useState({
    totalVotes: 0,
    turnout: 0,
    validVotes: 0,
    invalidVotes: 0,
    noPreference: 0,
  });
  const [selectedProvince, setSelectedProvince] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5005/api/elections").then((response) => {
      setElections(response.data);
      const totalVotes = response.data.reduce(
        (sum, e) => sum + e.totalVotes,
        0
      );
      const turnout = (
        response.data.reduce((sum, e) => sum + e.turnout, 0) /
        response.data.length
      ).toFixed(2);
      const validVotes = response.data.reduce(
        (sum, e) => sum + e.validVotes,
        0
      );
      const invalidVotes = response.data.reduce(
        (sum, e) => sum + e.invalidVotes,
        0
      );
      const noPreference = response.data.reduce(
        (sum, e) => sum + e.noVotePreference,
        0
      );

      setStats({ totalVotes, turnout, validVotes, invalidVotes, noPreference });
    });
  }, []);

  const handleProvinceClick = (provinceName) => {
    const thaiName = provinceNameMap[provinceName];

    console.log("Clicked province name (English):", provinceName);
    console.log("Mapped province name (Thai):", thaiName);

    if (!thaiName) {
      console.error(`No mapping found for province: ${provinceName}`);
      return;
    }

    const province = elections.find((e) => e.province === thaiName);

    console.log("Matched province data:", province);
    setSelectedProvince(province);
  };

  const getProvinceFillColor = (provinceName) => {
    const thaiName = provinceNameMap[provinceName];
    const province = elections.find((e) => e.province === thaiName);

    if (province) {
      return "#C2B092"; // Highlighted color for provinces with election data
    }
    return "#EDE0D4"; // Default color for provinces without data
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        fontFamily: "IBM Plex Sans Thai",
        backgroundColor: "#FAF3E0",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "25%",
          padding: "2rem",
          backgroundColor: "#F3E8D0",
          color: "#5A4E40",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0rem",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: "3rem",
            color: "#8C6A4A",
            marginBottom: "0rem",
            paddingBottom: "0rem",
            lineHeight: "3.5rem",
            gap: "0.5rem",
          }}
        >
          ใครหนอจะเป็น <br></br>"CEO บ้านเรา"
        </h1>
        <p
          style={{
            fontSize: "1.5rem",
            color: "#8C6A4A",
            borderBottom: "2px solid #D3C0A6",
            paddingBottom: "0.5rem",
          }}
        >
          ติดตามเลือกตั้งอบจ. 2567
        </p>

        {selectedProvince ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Province Name */}
            <div>
              <h2 style={{ fontSize: "1.6rem", color: "#5A4E40" }}>
                {selectedProvince.province}
              </h2>
              <p style={{ fontStyle: "italic", color: "#7D6756" }}>
                📅 Election Date: {selectedProvince.electionDate}
              </p>
            </div>

            {/* Total Statistics */}
            <div
              style={{
                backgroundColor: "#FFF8E1",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3
                style={{
                  marginBottom: "1rem",
                  fontSize: "1.4rem",
                  color: "#8C6A4A",
                }}
              >
                📊 สถิติ
              </h3>
              <p>
                Total Votes: <strong>{selectedProvince.totalVotes}</strong>
              </p>
              <p>
                Turnout: <strong>{selectedProvince.turnout}%</strong>
              </p>
              <p>
                Valid Votes: <strong>{selectedProvince.validVotes}</strong>
              </p>
              <p>
                Invalid Votes: <strong>{selectedProvince.invalidVotes}</strong>
              </p>
              <p>
                No Preference:{" "}
                <strong>{selectedProvince.noVotePreference}</strong>
              </p>
            </div>

            {/* Candidates */}
            <div
              style={{
                backgroundColor: "#EDE0D4",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3
                style={{
                  marginBottom: "1rem",
                  fontSize: "1.4rem",
                  color: "#8C6A4A",
                }}
              >
                🗳️ ผู้สมัคร
              </h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {selectedProvince.candidates.map((candidate, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "0.5rem",
                      borderBottom: "1px dashed #D3C0A6",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <strong>{candidate.name}</strong> ({candidate.party}) -{" "}
                    <span style={{ color: "#7D6756" }}>
                      {candidate.votes} votes ({candidate.percentage}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p
            style={{
              fontStyle: "italic",
              color: "#7D6756",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            คลิกเพื่อดูผลการเลือกตั้งรายจังหวัด
          </p>
        )}
      </div>
      {/* Legend */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#FAF3E0",
          borderRadius: "12px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          bottom: "15px",
          right: "15px",
          position: "absolute",
        }}
      >
        <h4
          style={{
            fontSize: "1.2rem",
            color: "#5A4E40",
            marginBottom: "1rem",
          }}
        >
          🗺️ Legend
        </h4>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#C2B092",
              marginRight: "10px",
            }}
          ></div>
          <span>จังหวัดที่เลือกตั้งไปแล้ว</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#EDE0D4",
              marginRight: "10px",
            }}
          ></div>
          <span>จังหวัดที่ยังไม่ได้เลือกตั้ง</span>
        </div>
      </div>
      {/* Map */}
      <div style={{ width: "70%", padding: "2rem" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 2000, center: [100, 13.5] }}
          style={{ width: "100%", height: "100%" }}
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
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#8C6A4A", outline: "none" },
                      pressed: { fill: "#735639", outline: "none" },
                    }}
                    onMouseEnter={() => {
                      const { name } = geo.properties;
                      console.log(`Hovering over ${name}`);
                    }}
                    onClick={() => handleProvinceClick(geo.properties.name)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}

export default Home;
