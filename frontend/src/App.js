import React from "react";
import { Route, Link, Routes, useLocation } from "react-router-dom";
import "./App.css";
import PathfindingVisualizerPage from "./PathfindingVisualizerPage";
import HomePage from "./HomePage";

function App() {
  const location = useLocation();
  
  return (
    <div className="App">
      <header className="header">
        <h1>Dijkstra's Algorithm</h1>
        <p>An Amazing Algorithm</p>
        <nav>
          <Link 
            to="/" 
            className={location.pathname === "/" ? "nav-link active" : "nav-link"}
          >
            Home
          </Link>
          <Link 
            to="/visualizer" 
            className={location.pathname === "/visualizer" ? "nav-link active" : "nav-link"}
          >
            Visualizer
          </Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/visualizer" element={<PathfindingVisualizerPage />} />
      </Routes>
      <footer className="footer">
        <p>
          © All rights reserved. |{" "}
          <a
            href="https://www.linkedin.com/in/shivkumar8500/"
            style={{ color: "white" }}
          >
            LinkedIn
          </a>{" "}
          |{" "}
          <a href="https://github.com/kurttzxc04" style={{ color: "white" }}>
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
