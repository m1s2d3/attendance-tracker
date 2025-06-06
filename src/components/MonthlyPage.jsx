import React from "react";
import { parseTime } from "../utils/timeUtils";

const getMonthData = (calendarMonth, calendarYear) => {
  const monthName = new Date(calendarYear, calendarMonth).toLocaleString(
    "default",
    { month: "long" }
  );
  const shortMonth = monthName.slice(0, 3);
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="invisible"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isFutureDate = new Date(calendarYear, calendarMonth, i) > new Date();
    const dateStr = `${i} ${shortMonth} ${calendarYear}`;
    const hasAttendance = attendanceHistory.some(
      (record) => record.date === dateStr
    );
    days.push(
      <button
        key={i}
        disabled={!hasAttendance || isFutureDate}
        onClick={() => !isFutureDate && handleDateClick(dateStr)}
        className={`w-full aspect-square flex items-center justify-center rounded-full text-sm ${
          isFutureDate
            ? "text-gray-300 cursor-not-allowed"
            : hasAttendance
            ? "bg-black text-white font-medium"
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        {i}
      </button>
    );
  }
  return { monthName, days };
};

const MonthlyPage = ({ 
  calendarMonth, 
  calendarYear, 
  goToPreviousMonth, 
  goToNextMonth,
  attendanceHistory,
  openCalendar,
  currentMonthName,
  filteredHistory,
  getTotalAttendanceDaysForMonth,
  setPage,
  handleDateClick
}) => {
  const getMonthData = () => {
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString(
      "default",
      { month: "long" }
    );
    const shortMonth = monthName.slice(0, 3);
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="invisible"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const isFutureDate = new Date(calendarYear, calendarMonth, i) > new Date();
      const dateStr = `${i} ${shortMonth} ${calendarYear}`;
      const hasAttendance = attendanceHistory.some(
        (record) => record.date === dateStr
      );
      days.push(
        <button
          key={i}
          disabled={!hasAttendance || isFutureDate}
          className={`w-full aspect-square flex items-center justify-center rounded-full text-sm ${
            isFutureDate
              ? "text-gray-300 cursor-not-allowed"
              : hasAttendance
              ? "bg-black text-white font-medium"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }
    return { monthName, days };
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => setPage("dashboard")}
        className="mb-4 text-black text-sm flex items-center"
      >
        ← Back
      </button>
      <header className="mb-4">
        <h1 className="text-lg font-bold">Monthly Attendance</h1>
        <p className="text-xs text-gray-500">
          {getMonthData().monthName}, {calendarYear}
        </p>
      </header>
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={goToPreviousMonth} className="p-1 text-sm">
          ←
        </button>
        <h2 className="text-sm font-medium">
          {getMonthData().monthName}, {calendarYear}
        </h2>
        <button onClick={goToNextMonth} className="p-1 text-sm">
          →
        </button>
      </div>
      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {getMonthData().days}
        </div>
      </div>
      {/* Daily Hours Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-sm font-medium mb-2">Daily Working Hours</h2>
        <div className="flex items-end space-x-1 h-20 overflow-x-auto">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record, index) => {
              const [totalHrs] = parseTime(record.totalHours || "0 hr 0 min");
              const barHeight = Math.max(totalHrs * 3, 5); // Min height for visibility
              return (
                <div
                  key={index}
                  style={{ height: `${barHeight}px`, width: "10px" }}
                  className="bg-blue-500 rounded-t"
                  title={`${record.date}: ${record.totalHours}`}
                ></div>
              );
            })
          ) : (
            <p className="text-xs italic text-gray-500 w-full text-center">
              No data available.
            </p>
          )}
        </div>
      </div>
      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <p className="text-sm">
          You marked attendance on{" "}
          <span className="font-medium">
            {getTotalAttendanceDaysForMonth()}
          </span>{" "}
          days.
        </p>
      </div>
    </div>
  );
};

export default MonthlyPage;