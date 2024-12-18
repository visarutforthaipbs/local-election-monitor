import React, { useState, useEffect } from "react";
import axios from "axios";
import BudgetSidebar from "../components/BudgetSidebar";
import MapView from "../components/MapView";
import ElectionPopup from "../components/ElectionPopup";
import provinceNameMap from "../province_name_map.json";
import "./Home.css";

const geoUrl = "/thailandWithName.json";
const electionProvinces = ["Chiang Mai", "Bangkok", "Khon Kaen", "Phuket"]; // Example data

function Home() {
  const [elections, setElections] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedElectionData, setSelectedElectionData] = useState(null);

  useEffect(() => {
    axios
      .get("https://local-election-monitor.onrender.com/api/elections")
      .then((response) => {
        setElections(response.data);
      });
  }, []);

  const handleProvinceClick = async (provinceName) => {
    const thaiName = provinceNameMap[provinceName];
    if (!thaiName) {
      console.error(`No mapping found for province: ${provinceName}`);
      return;
    }

    const provinceElection = elections.find((e) => e.province === thaiName);
    if (provinceElection) {
      setSelectedElectionData(provinceElection);
      setIsPopupVisible(true);
    }

    try {
      const response = await axios.get(
        `https://local-election-monitor.onrender.com/api/budget/${encodeURIComponent(
          thaiName
        )}`
      );
      setBudgetData(response.data);
    } catch (error) {
      console.error("Error fetching budget data:", error);
      setBudgetData(null);
    }
  };

  const getProvinceFillColor = (provinceName) => {
    const thaiName = provinceNameMap[provinceName];
    const province = elections.find((e) => e.province === thaiName);

    return province ? "#1BB2B5" : "#D0D0D0";
  };

  return (
    <div className="home-container-full">
      <div className="home-content">
        <BudgetSidebar budgetData={budgetData} />
        <MapView
          geoUrl={geoUrl}
          handleProvinceClick={handleProvinceClick}
          getProvinceFillColor={getProvinceFillColor}
          electionData={electionProvinces} // Pass provinces with election data
        />
        {isPopupVisible && (
          <ElectionPopup
            isVisible={isPopupVisible}
            onClose={() => setIsPopupVisible(false)}
            electionData={selectedElectionData}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
