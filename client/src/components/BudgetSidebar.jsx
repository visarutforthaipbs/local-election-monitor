import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import "./BudgetSidebar.css";
import UserNeedsWordCloud from "./UserNeedsWordCloud";
import logoGif from "../assets/logo03.gif";

// Helper function to format numbers
const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) {
    return "N/A";
  }
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + " พันล้าน";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + " ล้าน";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + " พัน";
  } else {
    return number.toLocaleString();
  }
};

const BudgetSidebar = ({ budgetData, electionProgress }) => {
  const [activeTab, setActiveTab] = useState("budget"); // State for tabs

  // Prepare Pie chart data
  const chartData =
    budgetData?.groupedByArea?.map((area) => ({
      name: area.area,
      total: parseFloat(area.total),
    })) || [];

  // Prepare Stacked Bar chart data
  const stackedChartData =
    budgetData?.groupedByArea?.map((area) => {
      const plans = Object.fromEntries(
        area.plans.map((plan) => [plan.plan, plan.total])
      );
      return { area: area.area, ...plans };
    }) || [];

  // Collect plan names for Bar chart
  const planNames = Array.from(
    new Set(
      budgetData?.groupedByArea.flatMap((area) =>
        area.plans.map((plan) => plan.plan)
      )
    )
  );

  // Show only election progress when no province is selected
  if (!budgetData) {
    return (
      <div className="sidebar">
        <a href="/" className="logo-container">
          <img src={logoGif} alt="Logo" className="sidebar-logo" />
          <p className="slogan">จับตาเลือกนายกอบจ. 2567-2568</p>
          <div className="separator-line"></div>
        </a>

        {/* Election Progress */}
        <div className="election-progress-card">
          <h3 className="card-heading">สถานะการเลือกตั้งอบจ.ในปัจจุบัน</h3>
          <p className="card-text">
            ✅ จังหวัดที่เลือกตั้งแล้ว:{" "}
            <span className="election-count">25/77</span>
          </p>
          <p className="card-text">
            ⏳ จังหวัดที่กำลังจัดเลือกตั้ง:{" "}
            <span className="election-count"> ไม่มี </span>
          </p>
        </div>
        <div className="separator-line"></div>
        <div className="logo-container-2">
          <img src="./3.png" alt="pi-logo" className="logo-2" />
          <img src="./1.png" alt="local-logo" className="logo-2" />
          <img src="./2.png" alt="thai-pbs" className="logo-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logoGif} alt="Logo" className="sidebar-logo" />
        <p className="slogan">จับตาเลือกนายกอบจ. 2567-2568</p>{" "}
        <div className="separator-line"></div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "budget" ? "active" : ""}`}
          onClick={() => setActiveTab("budget")}
        >
          งบประมาณ
        </button>
        <button
          className={`tab ${activeTab === "needs" ? "active" : ""}`}
          onClick={() => setActiveTab("needs")}
        >
          ความต้องการของประชาชน
        </button>
      </div>

      {/* Budget Tab */}
      {activeTab === "budget" && budgetData ? (
        <div className="card">
          <h3 className="card-heading">
            การใช้งบประมาณอบจ. {budgetData.pao?.name || "ไม่ทราบจังหวัด"} ปี
            2567
          </h3>
          <div className="separator"></div>

          <p className="card-text">
            นายก อบจ.:{" "}
            <span className="budget-amount">
              {budgetData.pao?.chiefExecutives?.[0]?.name || "N/A"}
            </span>
          </p>

          <p className="card-text">
            ระยะเวลารับตำแหน่ง:{" "}
            <span className="budget-amount">
              {budgetData.pao?.chiefExecutives?.[0]?.inOffice || "N/A"}
            </span>
          </p>

          <p className="card-text-budget">
            งบประมาณทั้งหมด :{" "}
            <span className="budget-amount">
              {formatNumber(budgetData.total)} บาท
            </span>
          </p>

          <p className="card-text">
            ประชากร:{" "}
            <span className="budget-amount">
              {formatNumber(budgetData.pao?.population)} คน
            </span>
          </p>

          {/* Pie Chart */}
          <div className="chart-container">
            <h4 className="chart-heading">การใช้งบประมาณตามประเภท</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  fill="#8C6A4A"
                  // Format the slice labels on the chart
                  label={(entry) => formatNumber(entry.value)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#e98925" : "#D3C0A6"}
                    />
                  ))}
                </Pie>
                {/* Format the hover tooltip too */}
                <Tooltip
                  formatter={(value, name) => [formatNumber(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="chart-container">
            <h4 className="chart-heading">การใช้งบประมาณตามแผน</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={stackedChartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1_000_000)
                      return (value / 1_000_000).toFixed(1) + "ล้าน";
                    if (value >= 1_000)
                      return (value / 1_000).toFixed(1) + "พัน";
                    return value;
                  }}
                  width={60} // give a bit more space
                  tick={{ fontSize: 12 }}
                />
                {/* Format numbers inside the tooltip as well */}
                <Tooltip
                  formatter={(value, name) => [formatNumber(value), name]}
                />
                {planNames.map((plan, index) => (
                  <Bar
                    key={index}
                    dataKey={plan}
                    stackId="a"
                    fill={index % 2 === 0 ? "#e98925" : "#D3C0A6"}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Source or Disclaimer */}
          <p className="data-source">
            ที่มาข้อมูล:{" "}
            <a
              href="https://localbudgeting.actai.co/"
              target="_blank"
              rel="noopener noreferrer"
            >
              องค์กรต่อต้านคอร์รัปชัน (ประเทศไทย)
            </a>
          </p>
        </div>
      ) : (
        <UserNeedsWordCloud province={budgetData?.pao?.name} />
      )}

      <div className="separator"></div>
    </div>
  );
};

export default BudgetSidebar;
