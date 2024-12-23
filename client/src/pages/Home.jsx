import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { TourProvider } from "@reactour/tour";
import BudgetSidebar from "../components/BudgetSidebar";
import MapView from "../components/MapView";
import ElectionPopup from "../components/ElectionPopup";
import provinceNameMap from "../province_name_map.json";
import "./Home.css";
import Legend from "../components/Legend";

const geoUrl = "/thailandWithName.json";

function Home() {
  const [elections, setElections] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedElectionData, setSelectedElectionData] = useState(null);
  const [isTourReady, setIsTourReady] = useState(false); // Ensure tour starts after DOM is ready
  const [electionProgress, setElectionProgress] = useState({
    completed: 23,
    upcoming: 2,
    nextProvince: ["อุตรดิตถ์", "อุบลราชธานี"], // Use an array
  }); // Election progress state
  console.log(electionProgress);

  // Prepare province options for react-select
  const provinceOptions = Object.entries(provinceNameMap).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  useEffect(() => {
    axios
      .get("https://local-election-monitor.onrender.com/api/elections")
      .then((response) => {
        setElections(response.data);

        // Calculate election progress
        const completed = response.data.filter(
          (e) => e.status === "completed"
        ).length;
        const upcoming = response.data.filter(
          (e) => e.status === "upcoming"
        ).length;
        const nextProvinces = response.data
          .filter((e) => e.status === "upcoming")
          .map((e) => e.province); // Collect all upcoming provinces in an array

        setElectionProgress({
          completed,
          upcoming,
          nextProvince: nextProvinces.length > 0 ? nextProvinces : ["N/A"], // Fallback to ["N/A"]
        });
      })
      .catch((error) => console.error("Error fetching elections data:", error));
  }, []);

  // Wait until DOM is ready
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTourReady(true);
    }, 500); // Slight delay to ensure elements are rendered
    return () => clearTimeout(timeout);
  }, []);

  const handleProvinceClick = async (provinceName) => {
    const thaiName = provinceNameMap[provinceName];
    if (!thaiName) return;

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
    return elections.find((e) => e.province === thaiName)
      ? "#1BB2B5"
      : "#D0D0D0";
  };

  // Onboarding tour steps
  const steps = [
    {
      selector: ".map-container",
      content:
        "This is the interactive map. Click on any province to explore its data.",
    },
    {
      selector: ".search-bar",
      content: "Use this search bar to quickly find a province.",
    },
    {
      selector: ".home-content",
      content: "Explore additional details on the sidebar.",
    },
  ];

  return (
    isTourReady && (
      <TourProvider steps={steps}>
        <div className="home-container-full">
          {/* Search Bar Component */}
          <div className="search-bar">
            <Select
              options={provinceOptions}
              placeholder="เลือกจังหวัดที่สนใจ..."
              onChange={(option) => {
                if (option) handleProvinceClick(option.value);
              }}
              isClearable
            />
          </div>

          {/* Main Content */}
          <div className="home-content">
            {/* Pass election progress to Sidebar */}
            <BudgetSidebar
              budgetData={budgetData}
              electionProgress={electionProgress}
            />
            {/* Add Legend Component */}
            <Legend />
            <MapView
              geoUrl={geoUrl}
              handleProvinceClick={handleProvinceClick}
              getProvinceFillColor={getProvinceFillColor}
              budgetData={budgetData} // Pass budgetData
              electionProgress={electionProgress} // Pass electionProgress
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
      </TourProvider>
    )
  );
}

export default Home;
