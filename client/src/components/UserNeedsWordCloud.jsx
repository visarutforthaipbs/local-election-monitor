import React, { useState, useEffect } from "react";
import WordCloud from "react-wordcloud";
import axios from "axios";
import "./UserNeedsWordCloud.css";

const UserNeedsWordCloud = ({ province }) => {
  const [userInput, setUserInput] = useState("");
  const [userNeeds, setUserNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user needs when the province changes
  useEffect(() => {
    const fetchUserNeeds = async () => {
      if (!province) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5005/api/feedback/${encodeURIComponent(province)}`
        );
        const fetchedNeeds = response.data.flatMap((entry) => entry.feedback);
        setUserNeeds(fetchedNeeds); // Set existing feedback for the province
      } catch (err) {
        console.error("Failed to fetch user needs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserNeeds();
  }, [province]);

  // Handle adding user feedback
  const handleAddNeed = async (e) => {
    e.preventDefault();
    if (!province) {
      alert("Please select a province first.");
      return;
    }
    if (userInput.trim()) {
      try {
        const feedbackData = {
          province: province,
          feedback: userInput.trim(),
        };

        // Post to the server
        await axios.post("http://localhost:5005/api/feedback", feedbackData);

        // Update local state to reflect the new feedback
        setUserNeeds((prevNeeds) => [...prevNeeds, userInput.trim()]);
        setUserInput(""); // Reset the input field
      } catch (err) {
        console.error("Failed to submit feedback:", err.message);
      }
    }
  };

  // Generate word cloud data
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
          {/* Input Section */}
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

          {/* Word Cloud Section */}
          {userNeeds.length > 0 ? (
            <div className="wordcloud-section">
              <h4>☁️ ความต้องการของประชาชน</h4>
              <WordCloud
                words={generateWordCloudData()}
                options={{
                  rotations: 0,
                  fontSizes: [15, 40],
                  rotationAngles: [0, 0],
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
