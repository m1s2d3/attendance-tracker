import React from "react";
import Calendar from "./icons/Calendar";
import BarChart from "./icons/BarChart";
import ChartIcon from "./icons/ChartIcon";
import ExportIcon from "./icons/ExportIcon";
import PieChartIcon from "./icons/PieChartIcon";
import AutoCheckinIcon from "./icons/AutoCheckinIcon";
import AttendanceHistoryIcon from "./icons/AttendanceHistoryIcon";

const Dashboard = ({ setPage, openCalendar, setShowExportModal, autoAttendanceEnabled, setAutoAttendanceEnabled,setShowSettingsModal,officeLocation }) => {
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
          <div style={{width:'69%'}}>
            <h2 className="font-semibold text-base">
              {localStorage.getItem("username") || "User"}!
            </h2>
            <p className="text-xs text-gray-500">Your attendance summary</p>
          </div>
          <div>
          <button 
          onClick={() => {setShowSettingsModal(true)}}
          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
          aria-label="Settings"
            ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
    </div>
        </div>
        <h1 className="text-xl font-bold">Attendance Dashboard</h1>
          {/* Settings Icon - Right Side */}
      </header>

    {/* Auto Attendance Toggle */}
<div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
  <div className="flex items-center space-x-3">
    <AutoCheckinIcon/>
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
        ? "bg-black after:bg-black-500" 
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
          <span className="font-medium text-sm">Monthly Attendance</span>
        </div>
        <div
          onClick={() => setPage("chart")}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <PieChartIcon />
          <span className="font-medium text-sm">Attendance Report</span>
        </div>
        <div
          onClick={() => setPage("history")}
          className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
        >
          <AttendanceHistoryIcon />
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

export default Dashboard;