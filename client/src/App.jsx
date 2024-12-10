import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Province from "./pages/Province";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/province/:name" element={<Province />} />
      </Routes>
    </Router>
  );
}

export default App;
