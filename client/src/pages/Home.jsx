// Home.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { TourProvider } from "@reactour/tour";
import BudgetSidebar from "../components/BudgetSidebar";
import MapView from "../components/MapView";
import ElectionPopup from "../components/ElectionPopup";
import Legend from "../components/Legend";
import Spinner from "../components/Spinner"; // Our spinner for loading
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

  // Controls when we show the Onboarding Tour
  const [isTourReady, setIsTourReady] = useState(false);

  // Loading state (Spinner) while data is fetched
  const [loading, setLoading] = useState(true);

  // Dynamic election progress data
  const [electionProgress, setElectionProgress] = useState({
    completed: 0,
    upcoming: 0,
    nextProvince: [],
  });

  // -----------------------
  // 2. Detect Mobile
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
  // 3. Fetch ELECTIONS Data
  // -----------------------
  useEffect(() => {
    setLoading(true); // Start loading
    axios
      .get("https://local-election-monitor.onrender.com/api/elections")
      .then((response) => {
        // Store the raw elections data
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
          // If no upcoming provinces, show ["N/A"] as a fallback
          nextProvince: nextProvinces.length > 0 ? nextProvinces : ["N/A"],
        });
      })
      .catch((error) => {
        console.error("Error fetching elections data:", error);
      })
      .finally(() => {
        // Once the election data is fetched, we can end loading
        setLoading(false);
      });
  }, []);

  // -----------------------
  // 4. Onboarding Tour Delay
  // -----------------------
  useEffect(() => {
    // Slight delay to ensure the page is rendered before the tour starts
    const timeout = setTimeout(() => {
      setIsTourReady(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  // -----------------------
  // 5. Province Search Options
  // -----------------------
  const provinceOptions = Object.entries(provinceNameMap).map(
    ([englishName, thaiName]) => ({
      value: englishName, // e.g. "Bangkok"
      label: thaiName, // e.g. "กรุงเทพมหานคร"
    })
  );

  // -----------------------
  // 6. Handlers
  // -----------------------
  const handleProvinceClick = async (provinceName) => {
    // Convert the English province name from the GeoJSON to Thai
    const thaiName = provinceNameMap[provinceName];
    if (!thaiName) return;

    // Set selected election data from the loaded elections
    const provinceElection = elections.find((e) => e.province === thaiName);
    if (provinceElection) {
      setSelectedElectionData(provinceElection);
      setIsPopupVisible(true);
    }

    // Fetch budget data for the clicked province
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
    // If we have an election entry for this province, fill color #1BB2B5, otherwise #D0D0D0
    return elections.find((e) => e.province === thaiName)
      ? "#1BB2B5"
      : "#D0D0D0";
  };

  // -----------------------
  // 7. Onboarding Tour Steps
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
  // 8. Render
  // -----------------------

  // Show spinner until data is fetched AND tour is ready
  if (loading || !isTourReady) {
    return <Spinner />;
  }

  // Once loading is done and tour is ready, render the main content
  return (
    <TourProvider steps={steps}>
      <div className="home-container-full">
        {/* Province Search Bar */}
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

        <div className="home-content">
          {/* 
            Conditionally render the sidebar on desktop only.
            Remove !isMobile && if you also want it on mobile.
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
