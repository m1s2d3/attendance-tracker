import React, { useState } from "react";

const AttendanceHistory = ({ 
  attendanceHistory,
  editRecord,
  confirmDeleteRecord,
  handleCheckOut,
  setPage
}) => {
  const [selectedMonth, setSelectedMonth] = useState(null); // null means "All"
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Saare months ka long name
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );

  // Filtered history with original index
  const filteredHistory = attendanceHistory
    .map((record, index) => ({
      ...record,
      originalIndex: index,
    }))
    .filter((record) => {
      const recordDate = new Date(record.date);
      if (selectedMonth === null) {
        return recordDate.getFullYear() === selectedYear;
      } else {
        return (
          recordDate.getMonth() === selectedMonth &&
          recordDate.getFullYear() === selectedYear
        );
      }
    });

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => setPage("dashboard")}
        className="mb-4 text-black text-sm flex items-center"
      >
        ← Back
      </button>
      <header className="mb-4">
        <h1 className="text-lg font-bold">Attendance History</h1>

        {/* Month and Year Filter */}
        <div className="mt-3 flex space-x-2">
          <select
            value={selectedMonth === null ? "all" : selectedMonth}
            onChange={(e) => {
              if (e.target.value === "all") {
                setSelectedMonth(null); // All months
              } else {
                setSelectedMonth(parseInt(e.target.value));
              }
            }}
            className="px-3 py-1 border rounded text-xs bg-white text-gray-700"
          >
            <option value="all">All Months</option>
            {monthNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown - Past 2 Years + Current Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 border rounded text-xs bg-white text-gray-700"
          >
            {Array.from({ length: 3 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </header>

      <div
        style={{ maxHeight: "38rem" }}
        className="bg-white rounded-lg shadow p-4 overflow-y-auto"
      >
        <ul className="space-y-2">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record) => (
              <li
                key={record.originalIndex}
                className="flex flex-col bg-gray-100 rounded-md p-2 text-xs"
              >
                <p className="font-medium">{record.date}</p>
                <p className="text-gray-500">
                  Check-in: {record.checkIn}
                  {record.checkOut !== "-" && (
                    <>
                      {" | Check-out: "}
                      {record.checkOut}
                    </>
                  )}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-black">
                    Total: {record.totalHours}
                  </span>
                  <div className="flex space-x-1">
                    {record.checkIn !== "-" && (
                      <button
                        onClick={() => editRecord(record.originalIndex, "checkIn")}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                      >
                        Edit In
                      </button>
                    )}
                    {record.checkOut !== "-" && (
                      <button
                        onClick={() => editRecord(record.originalIndex, "checkOut")}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                      >
                        Edit Out
                      </button>
                    )}
                    <button
                      onClick={() => confirmDeleteRecord(record.originalIndex)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                    {record.checkOut === "-" && (
                      <button
                        onClick={() => handleCheckOut(record.originalIndex)}
                        className="px-2 py-1 bg-black text-white text-xs rounded"
                      >
                        Check Out Now
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="text-xs italic text-gray-500">
              No attendance records found for this filter.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AttendanceHistory;