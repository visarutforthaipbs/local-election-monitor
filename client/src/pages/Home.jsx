// Home.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { TourProvider } from "@reactour/tour";
import BudgetSidebar from "../components/BudgetSidebar";
import MapView from "../components/MapView";
import ElectionPopup from "../components/ElectionPopup";
import Legend from "../components/Legend";
import Spinner from "../components/Spinner"; // <-- import our spinner
import provinceNameMap from "../province_name_map.json";
import "./Home.css";

const geoUrl = "/thailandWithName.json";

function Home() {
  // -----------------------
  // 1. State & Variables
  // -----------------------
  const [elections, setElections] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedElectionData, setSelectedElectionData] = useState(null);
  const [isTourReady, setIsTourReady] = useState(false);

  // NEW: loading state to show spinner while data is fetched
  const [loading, setLoading] = useState(true);

  // -----------------------
  // 2. Election Progress
  // -----------------------
  const [electionProgress, setElectionProgress] = useState({
    completed: 23,
    upcoming: 2,
    nextProvince: ["อุตรดิตถ์", "อุบลราชธานี"],
  });

  // -----------------------
  // 3. isMobile Detection
  // -----------------------
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -----------------------
  // 4. Fetch ELECTIONS Data
  // -----------------------
  useEffect(() => {
    setLoading(true); // Start loading
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
          .map((e) => e.province);

        setElectionProgress({
          completed,
          upcoming,
          nextProvince: nextProvinces.length > 0 ? nextProvinces : ["N/A"],
        });
      })
      .catch((error) => {
        console.error("Error fetching elections data:", error);
      })
      .finally(() => {
        // Stop loading once we have election data
        setLoading(false);
      });
  }, []);

  // -----------------------
  // 5. Prepare the Tour
  // -----------------------
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTourReady(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  // -----------------------
  // 6. Province Options
  // -----------------------
  const provinceOptions = Object.entries(provinceNameMap).map(
    ([key, value]) => ({
      value: key,
      label: value,
    })
  );

  // -----------------------
  // 7. Handlers
  // -----------------------
  const handleProvinceClick = async (provinceName) => {
    const thaiName = provinceNameMap[provinceName];
    if (!thaiName) return;

    // Set selected election data
    const provinceElection = elections.find((e) => e.province === thaiName);
    if (provinceElection) {
      setSelectedElectionData(provinceElection);
      setIsPopupVisible(true);
    }

    // Fetch budget data
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

  // -----------------------
  // 8. Onboarding Tour Steps
  // -----------------------
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

  // -----------------------
  // 9. Render
  // -----------------------

  // If still loading or tour not ready, show spinner (or blank screen)
  if (loading || !isTourReady) {
    return <Spinner />;
  }

  // Once loading is done *and* tour is ready, render the main content
  return (
    <TourProvider steps={steps}>
      <div className="home-container-full">
        {/* Search Bar */}
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
          {/* 
            Conditionally render the sidebar only if NOT mobile.
            This unmounts the sidebar on mobile, preventing conflicts
            with MapView’s collapsible WordCloud.
          */}
          {!isMobile && (
            <BudgetSidebar
              budgetData={budgetData}
              electionProgress={electionProgress}
            />
          )}

          <Legend />

          <MapView
            geoUrl={geoUrl}
            handleProvinceClick={handleProvinceClick}
            getProvinceFillColor={getProvinceFillColor}
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
  );
}

export default Home;
