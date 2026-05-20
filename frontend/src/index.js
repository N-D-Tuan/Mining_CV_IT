import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Home from "./component/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Search_UI from "./component/User/Search_UI";
import Home_Jobs from "./component/User/Home_Jobs";
import Profile from "./component/User/Profile";
import Login from "./component/Auth/Login";
import Update_Profile from "./component/User/Update_Profile";
import Job_Detail from "./component/User/Job_Detail";

import "leaflet/dist/leaflet.css";
import "./lib/leaflet";
import JobsMapPage from "./pages/JobsMapPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<Home_Jobs />} />
          <Route path="/jobs" element={<Search_UI />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/update-profile" element={<Update_Profile />} />
          <Route path="/jobs/:id" element={<Job_Detail />} />
          <Route path="/map" element={<JobsMapPage />} />
        </Routes>
      </App>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
