import React, { useState } from "react";
import { parseTime } from "../utils/timeUtils";
import BackArrowIcon from "./icons/BackArrowIcon";

const AttendanceReport = ({ 
  calendarMonth, 
  calendarYear,
  attendanceHistory,
  getTotalAttendanceDaysForMonth,
  amPunchCount,
  pmPunchCount,
  setPage
}) => {
  const [selectedMonth, setSelectedMonth] = useState(calendarMonth);
  const [selectedYear, setSelectedYear] = useState(calendarYear);

  // Saare months ke names (long format)
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );

  // Selected month ka short month name (e.g. "Jun")
  const currentMonthName = new Date(selectedYear, selectedMonth).toLocaleString(
    "default",
    { month: "short" }
  );

  // Filter attendance by matching "Month Year" in date string, e.g. "Jun 2025"
  const filteredHistory = attendanceHistory.filter((record) =>
    record.date.includes(`${currentMonthName} ${selectedYear}`)
  );

  // Total unique attendance days for selected month
  const getTotalAttendanceDaysForSelectedMonth = () => {
    const uniqueDates = new Set(filteredHistory.map((record) => record.date.split(" ")[0]));
    return uniqueDates.size;
  };

  // Total AM punches (checkIn hour < 12)
  const totalAmPunches = filteredHistory.reduce((count, r) => {
    const [inHr] = parseTime(r.checkIn);
    return count + (inHr < 12 ? 1 : 0);
  }, 0);

  // Total PM punches (checkIn hour >= 12)
  const totalPmPunches = filteredHistory.reduce((count, r) => {
    const [inHr] = parseTime(r.checkIn);
    return count + (inHr >= 12 ? 1 : 0);
  }, 0);

  // Calculate total hours worked (ignore if totalHours === "-")
  const totalHoursWorked = filteredHistory
    .filter(r => r.totalHours !== "-")
    .reduce((sum, r) => {
      const [hours] = parseTime(r.totalHours);
      return sum + hours;
    }, 0);

  // Average daily hours
  const avgDailyHours = filteredHistory.length > 0 ? (totalHoursWorked / filteredHistory.length).toFixed(1) : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header + Month Filter - Fixed */}
      <header className="bg-gray-100  p-4 z-10">
        <button
          onClick={() => setPage("dashboard")}
          className="mb-4 text-black text-sm flex items-center"
        >
          <span><BackArrowIcon/></span><span>Back</span>
        </button>

        <h1 className="text-xl font-bold mb-2">Attendance Report</h1>
        
        {/* Month and Year Selector */}
        <div className="mt-2 flex space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-1 border rounded text-xs bg-white text-gray-700"
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 border rounded text-xs bg-white text-gray-700"
          >
            {[calendarYear - 2,calendarYear -1, calendarYear].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Scrollable Cards Section */}
      <main className="flex-1 overflow-y-auto px-4">
        {/* Stats Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-sm font-medium mb-2">📈 Monthly Summary Of {new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" })}</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{getTotalAttendanceDaysForSelectedMonth()}</p>
              <p className="text-xs opacity-90">Present Days</p>
            </div>
            <div>
              <p className="text-lg font-bold">{avgDailyHours}</p>
              <p className="text-xs opacity-90">Avg Hrs/Day</p>
            </div>
          </div>
        </div>

        {/* Monthly Progress Ring */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center mb-4">
          <h2 className="text-sm font-medium mb-3">Monthly Progress</h2>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#eee"
                strokeWidth="8"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${getTotalAttendanceDaysForSelectedMonth() * 7.5}, 300`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {getTotalAttendanceDaysForSelectedMonth()}<br />
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            You marked attendance on {getTotalAttendanceDaysForSelectedMonth()} out of{" "}
            {new Date(selectedYear, selectedMonth + 1, 0).getDate()} days.
          </p>
        </div>

        {/* Attendance Heatmap */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-sm font-medium mb-3">🔥 Attendance Heatmap</h2>
          <div className="grid grid-cols-7 gap-1 text-xs text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-medium text-gray-500">{day}</div>
            ))}
            {(() => {
              const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
              const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
              const heatmap = [];

              // Empty cells for the first week
              for (let i = 0; i < firstDayOfMonth; i++) {
                heatmap.push(<div key={`empty-${i}`} className="invisible"></div>);
              }

              // Generate heatmap cells
              for (let i = 1; i <= daysInMonth; i++) {
                // date format "5 Jun 2025"
                const dateStr = `${i} ${currentMonthName} ${selectedYear}`;
                const hasAttendance = attendanceHistory.some(
                  (r) => r.date === dateStr
                );
                const intensity = hasAttendance ? "bg-blue-500" : "bg-gray-200";
                heatmap.push(
                  <div
                    key={i}
                    className={`w-4 h-4 mx-auto my-1 rounded-sm ${intensity}`}
                    title={hasAttendance ? `Present on ${dateStr}` : `Absent on ${dateStr}`}
                  ></div>
                );
              }

              return heatmap;
            })()}
          </div>
          <div className="flex justify-between text-xs mt-2 text-gray-500">
            <span>Blue: Present</span>
            <span>Light: Absent</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceReport;
