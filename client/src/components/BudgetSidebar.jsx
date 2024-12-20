import React from "react";
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
import logoGif from "../assets/logo03.gif"; // Import the GIF

// Helper function to format numbers
const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) {
    return "N/A";
  }
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + "พันล้าน";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "ล้าน";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "พัน";
  } else {
    return number.toLocaleString();
  }
};

const BudgetSidebar = ({ budgetData }) => {
  // Prepare the data for the Pie chart
  const chartData = budgetData?.groupedByArea?.map((area) => ({
    name: area.area,
    total: parseFloat(area.total),
  }));

  // Prepare data for Stacked Bar chart
  const stackedChartData = budgetData?.groupedByArea?.map((area) => {
    const plans = Object.fromEntries(
      area.plans.map((plan) => [plan.plan, plan.total])
    );
    return { area: area.area, ...plans };
  });

  // Collect all unique plan names to dynamically render the Bar components
  const planNames = Array.from(
    new Set(
      budgetData?.groupedByArea.flatMap((area) =>
        area.plans.map((plan) => plan.plan)
      )
    )
  );

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logoGif} alt="Logo" className="sidebar-logo" />
      </div>
      <h2 className="sidebar-subheading">จับตาเลือกนายกอบจ. 2567-2568</h2>
      <div className="separator"></div>
      {budgetData ? (
        <div className="card">
          <h3 className="card-heading">
            การใช้งบประมาณของ CEO คนก่อน {budgetData.name}
          </h3>

          {/* CEO คนก่อน */}
          <p className="card-text">
            นายก อบจ. คนก่อน:{" "}
            <span className="budget-amount">
              {budgetData.pao?.chiefExecutives &&
              budgetData.pao.chiefExecutives.length > 0
                ? budgetData.pao.chiefExecutives[0].name
                : "N/A"}
            </span>
          </p>

          {/* ระยะเวลารับตำแหน่ง */}
          {/* ระยะเวลารับตำแหน่ง */}
          <p className="card-text">
            ระยะเวลารับตำแหน่ง:{" "}
            <span className="budget-amount">
              {budgetData.pao.chiefExecutives[0].inOffice}
            </span>
          </p>

          {/* งบทั้งหมด */}
          <p className="card-text-budget">
            งบประมาณทั้งหมด :{" "}
            <span className="budget-amount">
              {formatNumber(budgetData.total) || "N/A"} บาท
            </span>
          </p>

          {/* ประชากรที่ดูแล */}
          <p className="card-text">
            ประชากร:{" "}
            <span className="budget-amount">
              {formatNumber(budgetData.pao.population) || "N/A"}
            </span>
          </p>

          {/* Pie Chart for Budget Breakdown */}
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
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#8C6A4A" : "#D3C0A6"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar Chart */}
          <div className="chart-container">
            <h4 className="chart-heading">การใช้งบประมาณตามแผน</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stackedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                {planNames.map((plan, index) => (
                  <Bar
                    key={index}
                    dataKey={plan} // Dynamically use plan names
                    stackId="a"
                    fill={index % 2 === 0 ? "#8C6A4A" : "#D3C0A6"}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New Component */}
          <UserNeedsWordCloud province={budgetData?.pao.name} />
        </div>
      ) : (
        <p className="no-budget">เลือกที่จังหวัดของท่านเพื่อดูงบประมาณ</p>
      )}

      <div className="separator"></div>
    </div>
  );
};

export default BudgetSidebar;
