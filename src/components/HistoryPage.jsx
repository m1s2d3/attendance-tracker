import React from "react";

const HistoryPage = ({ 
  attendanceHistory,
  editRecord,
  confirmDeleteRecord,
  handleCheckOut,
  setPage
}) => {
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
      </header>
      <div
        style={{ maxHeight: "40rem" }}
        className="bg-white rounded-lg shadow p-4 overflow-y-auto"
      >
        <ul className="space-y-2">
          {attendanceHistory.length > 0 ? (
            attendanceHistory.map((record, index) => (
              <li
                key={index}
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
                        onClick={() => editRecord(index, "checkIn")}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                      >
                        Edit In
                      </button>
                    )}
                    {record.checkOut !== "-" && (
                      <button
                        onClick={() => editRecord(index, "checkOut")}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                      >
                        Edit Out
                      </button>
                    )}
                    <button
                      onClick={() => confirmDeleteRecord(index)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                    >
                      Delete
                    </button>
                    {record.checkOut === "-" && (
                      <button
                        onClick={() => handleCheckOut(index)}
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
              No attendance records found.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default HistoryPage;