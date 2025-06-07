import React from "react";
import BackArrowIcon from "../icons/BackArrowIcon";
import ForwardArrowIcon from "../icons/ForwardArrowIcon";


const CalendarModal = ({ 
  month, 
  year, 
  onSelect, 
  onClose, 
  goToPreviousMonth, 
  goToNextMonth,
  attendanceHistory
}) => {
  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long"
  });
  const shortMonth = monthName.slice(0, 3);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="invisible"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isFutureDate = new Date(year, month, i) > new Date();
    const dateStr = `${i} ${shortMonth} ${year}`;
    const hasAttendance = attendanceHistory.some(
      (record) => record.date === dateStr
    );
    days.push(
      <button
        key={i}
        disabled={isFutureDate}
        onClick={() => !isFutureDate && onSelect(dateStr)}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow w-72 animate-fade-in-up">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium">{monthName}, {year}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-sm"
          >
            &times;
          </button>
        </div>
        <div className="flex justify-center items-center mb-2">
          <button
            onClick={goToPreviousMonth}
            className="px-2 text-sm"
          >
          <span><BackArrowIcon/></span>
          </button>
          <span className="mx-2 text-sm font-medium">
            {monthName}, {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="px-2 text-sm"
          >
          <span><ForwardArrowIcon/></span>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="font-medium text-gray-500">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;