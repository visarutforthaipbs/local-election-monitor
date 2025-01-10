import React, { useState, useEffect } from "react";
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

const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) {
    return "N/A";
  }
  if (number >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(1) + " พันล้าน";
  } else if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1) + " ล้าน";
  } else if (number >= 100_000) {
    return (number / 100_000).toFixed(1) + " แสน";
  } else if (number >= 1_000) {
    return (number / 1_000).toFixed(1) + " พัน";
  } else {
    return number.toLocaleString();
  }
};

const BudgetSidebar = ({ budgetData, electionProgress }) => {
  const [activeTab, setActiveTab] = useState("budget");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch articles when "articles" tab is active
  useEffect(() => {
    if (activeTab === "articles" && budgetData?.pao?.name) {
      setLoading(true);
      setError(null);
      fetch(
        `https://local-election-monitor.onrender.com/api/articles/${encodeURIComponent(
          budgetData.pao.name
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setArticles(data);
        })
        .catch((err) => {
          console.error("Error fetching articles:", err);
          setError("Failed to fetch articles.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [activeTab, budgetData]);

  // Prepare data for Pie and Bar charts
  const chartData =
    budgetData?.groupedByArea?.map((area) => ({
      name: area.area,
      total: parseFloat(area.total),
    })) || [];

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
      budgetData?.groupedByArea?.flatMap((area) =>
        area.plans.map((plan) => plan.plan)
      )
    )
  );

  // ========================
  // SHOW ONLY ELECTION DATA
  // WHEN NO PROVINCE IS SELECTED
  // ========================
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
            ✅ จังหวัดที่เลือกตั้งแล้ว{""}
            <span className="election-count">29 จังหวัด</span>
          </p>
          <p className="card-text">
            ⏳ จังหวัดที่จะเลือกตั้งในวันที่ 1 ก.พ.{" "}
            <span className="election-count">47 จังหวัด</span>
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

  // ========================
  // WHEN BUDGET DATA EXISTS
  // ========================
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="logo-container">
        <img src={logoGif} alt="Logo" className="sidebar-logo" />
        <p className="slogan">จับตาเลือกนายกอบจ. 2567-2568</p>
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
        <button
          className={`tab ${activeTab === "articles" ? "active" : ""}`}
          onClick={() => setActiveTab("articles")}
        >
          รู้จักจังหวัดให้มากขึ้น
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
            งบประมาณทั้งหมด:{" "}
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
                  label={(entry) => formatNumber(entry.value)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#e98925" : "#D3C0A6"}
                    />
                  ))}
                </Pie>
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
                  width={60}
                  tick={{ fontSize: 12 }}
                />
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
      ) : activeTab === "needs" ? (
        <UserNeedsWordCloud province={budgetData?.pao?.name} />
      ) : (
        <div className="card">
          {loading && <p>กำลังโหลดเนื้อหา...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && articles.length === 0 && (
            <p>ไม่มีบทความของจังหวัดนี้</p>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="articles-tab">
              {articles.map((article, index) => (
                <div key={index} className="article-item">
                  <img
                    src={article.thumbnail}
                    alt={article.title} // <-- Updated here
                    className="article-thumbnail"
                  />
                  <div className="article-content">
                    <h4>{article.title}</h4>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-link"
                    >
                      อ่านเพิ่มเติม
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="separator"></div>
    </div>
  );
};

export default BudgetSidebar;
