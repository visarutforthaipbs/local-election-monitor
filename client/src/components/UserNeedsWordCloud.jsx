import React, { useState, useEffect } from "react";
import WordCloud from "react-wordcloud";
import axios from "axios";
import "./UserNeedsWordCloud.css";

const UserNeedsWordCloud = ({ province = "" }) => {
  const [userInput, setUserInput] = useState("");
  const [userNeeds, setUserNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5005/api";

  useEffect(() => {
    const fetchUserNeeds = async () => {
      if (!province) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}/feedback/${encodeURIComponent(province)}`
        );
        console.log("Fetched feedbacks:", response.data); // Debug fetched data
        const fetchedNeeds = response.data.flatMap((entry) => entry);
        setUserNeeds(fetchedNeeds);
      } catch (err) {
        console.error("Failed to fetch user needs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNeeds();
  }, [province]);

  const handleAddNeed = async (e) => {
    e.preventDefault();
    if (!province) {
      alert("Please select a province first.");
      return;
    }
    if (userInput.trim().length < 3) {
      alert("กรุณากรอกข้อมูลให้มากกว่า 3 ตัวอักษร");
      return;
    }

    try {
      const feedbackData = { province, feedback: userInput.trim() };
      await axios.post(`${baseURL}/feedback`, feedbackData);

      // Refetch updated feedbacks after posting
      const response = await axios.get(
        `${baseURL}/feedback/${encodeURIComponent(province)}`
      );
      const fetchedNeeds = response.data.flatMap((entry) => entry);
      setUserNeeds(fetchedNeeds);
      setUserInput("");
    } catch (err) {
      console.error("Failed to submit feedback:", err.message);
    }
  };

  const generateWordCloudData = () => {
    const frequencyMap = userNeeds.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(frequencyMap).map(([text, value]) => ({
      text,
      value,
    }));
  };

  return (
    <div className="user-needs-container">
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div className="user-needs-section">
            <h4>💬 บอกสิ่งที่คุณอยากเห็นในจังหวัดนี้</h4>
            <form onSubmit={handleAddNeed} className="needs-form">
              <input
                type="text"
                placeholder="เช่น ถนนดีขึ้น, สวนสาธารณะเพิ่ม"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="needs-input"
              />
              <button type="submit" className="needs-button">
                ส่ง
              </button>
            </form>
          </div>

          {userNeeds.length > 0 ? (
            <div className="wordcloud-section">
              <h4>☁️ ความต้องการของประชาชน</h4>
              <WordCloud
                words={generateWordCloudData()}
                options={{
                  rotations: 0,
                  fontSizes: [16, Math.min(30, window.innerWidth / 15)], // Dynamic font sizes based on screen size
                  rotationAngles: [0, 0],
                  enableTooltip: true,
                  fontFamily: "IBM Plex Sans Thai, serif",
                }}
              />
            </div>
          ) : (
            <p>ยังไม่มีข้อมูลความต้องการสำหรับจังหวัดนี้</p>
          )}
        </>
      )}
    </div>
  );
};

export default UserNeedsWordCloud;
