import React from "react";
import Calendar from "./icons/Calendar";
import BarChart from "./icons/BarChart";
import ChartIcon from "./icons/ChartIcon";
import ExportIcon from "./icons/ExportIcon";
import HistoryIcon from "./icons/HistoryIcon";

const DashboardPage = ({ setPage, openCalendar, setShowExportModal, autoAttendanceEnabled, setAutoAttendanceEnabled }) => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => setPage("login")}
        className="mb-4 text-black text-sm flex items-center"
      >
        ← Back
      </button>
      <header className="mb-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold">
            {localStorage.getItem("username")
              ? localStorage.getItem("username").charAt(0).toUpperCase()
              : "U"}
          </div>
          <div>
            <h2 className="font-semibold text-base">
              Welcome back,{" "}
              {localStorage.getItem("username") || "User"}!
            </h2>
            <p className="text-xs text-gray-500">Your attendance summary</p>
          </div>
        </div>
        <h1 className="text-xl font-bold">Attendance Dashboard</h1>
      </header>

    {/* Auto Attendance Toggle */}
<div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
  <div className="flex items-center space-x-3">
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    <span className="font-medium text-sm">Auto Attendance</span>
  </div>
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={autoAttendanceEnabled}
      onChange={(e) => setAutoAttendanceEnabled(e.target.checked)}
      className="sr-only peer"
    />
    <div className={`relative w-11 h-6 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
      autoAttendanceEnabled 
        ? "bg-blue-500 after:border-blue-500" 
        : "bg-gray-200 after:border-gray-300"
    }`}></div>
  </label>
</div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div
          onClick={openCalendar}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <Calendar />
          <span className="font-medium text-sm">Select Date to Punch In</span>
        </div>
        <div
          onClick={() => setPage("monthly")}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <ChartIcon />
          <span className="font-medium text-sm">View Monthly Calendar</span>
        </div>
        <div
          onClick={() => setPage("chart")}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <ChartIcon />
          <span className="font-medium text-sm">View Attendance Chart</span>
        </div>
        <div
          onClick={() => setPage("history")}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <HistoryIcon />
          <span className="font-medium text-sm">Attendance History</span>
        </div>
        <div
          onClick={() => setShowExportModal(true)}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <ExportIcon />
          <span className="font-medium text-sm">Export Data</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;