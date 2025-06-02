import React, { useState, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("login"); // login | dashboard | monthly
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showExportModal, setShowExportModal] = useState("");
  const [error, setError] = useState({ usernameError: "", passwordError: "" });
  const [attendanceHistory, setAttendanceHistory] = useState(() => {
    const savedData = localStorage.getItem("attendanceHistory");
    return savedData
      ? JSON.parse(savedData)
      : [];
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeInput, setTimeInput] = useState({
    type: "",
    index: null,
    date: "",
    checkIn: "",
    checkOut: ""
  });

  // Save attendance history to localStorage
  useEffect(() => {
    localStorage.setItem("attendanceHistory", JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  // Auto-login on refresh
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      setPage("dashboard");
    }
  }, []);

  const handleLogin = () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    let usernameError = "";
    let passwordError = "";

    if (!trimmedUsername) {
      usernameError = "Username is required.";
    } else if (trimmedUsername.length < 3) {
      usernameError = "Username must be at least 3 characters long.";
    }

    if (!trimmedPassword) {
      passwordError = "Password is required.";
    } else if (trimmedPassword.length < 6) {
      passwordError = "Password must be at least 6 characters long.";
    }

    setError({ usernameError, passwordError });

    if (usernameError || passwordError) {
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", trimmedUsername);
    setPage("dashboard");
  };

  const openCalendar = () => {
    setCalendarMonth(new Date().getMonth());
    setCalendarYear(new Date().getFullYear());
    setShowCalendar(true);
  };

  const closeCalendar = () => {
    setShowCalendar(false);
  };

  const goToPreviousMonth = () => {
    setCalendarMonth((m) => (m === 0 ? 11 : m - 1));
    setCalendarYear((y) => (calendarMonth === 0 ? y - 1 : y));
  };

  const goToNextMonth = () => {
    setCalendarMonth((m) => (m === 11 ? 0 : m + 1));
    setCalendarYear((y) => (calendarMonth === 11 ? y + 1 : y));
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateForComparison = (day, monthName) => {
    return `${day} ${monthName.slice(0, 3)}`;
  };

  const handleDateClick = (dateString) => {
    const isDuplicate = attendanceHistory.some((record) => record.date === dateString);
    if (isDuplicate) {
      alert("Attendance already marked for this date.");
      closeCalendar();
      return;
    }
    setShowTimeModal(true);
    setTimeInput({
      type: "checkIn",
      index: null,
      date: dateString,
      checkIn: "",
      checkOut: ""
    });
  };

  const parseTime = (time) => {
    if (!time || time === "-") return [0, 0];
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return [hours, minutes];
  };

  const saveTime = () => {
    const { type, index, date } = timeInput;
    if (type === "checkIn") {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const checkInTime = `${hour12}:${formattedMinutes} ${period}`;
      const newEntry = {
        date,
        checkIn: timeInput.checkIn || checkInTime,
        checkOut: "-",
        totalHours: "-"
      };
      setAttendanceHistory([newEntry, ...attendanceHistory]);
    } else if (type === "checkOut" && index !== null) {
      const record = attendanceHistory[index];
      const [checkInHour, checkInMinute] = parseTime(record.checkIn);
      const [checkOutHour, checkOutMinute] = parseTime(timeInput.checkOut);
      let totalHours = checkOutHour - checkInHour;
      let totalMinutes = checkOutMinute - checkInMinute;
      if (totalMinutes < 0) {
        totalHours--;
        totalMinutes += 60;
      }
      const formattedTotalHours = `${totalHours} hr${totalHours !== 1 ? 's' : ''} ${totalMinutes} min`;
      const updatedHistory = [...attendanceHistory];
      updatedHistory[index].checkOut = timeInput.checkOut;
      updatedHistory[index].totalHours = formattedTotalHours;
      setAttendanceHistory(updatedHistory);
    }
    setShowTimeModal(false);
    setTimeInput({ type: "", index: null, date: "", checkIn: "", checkOut: "" });
  };

  const handleCheckOut = (index) => {
    const record = attendanceHistory[index];
    if (record.checkIn === "-") return;
    setShowTimeModal(true);
    setTimeInput({
      type: "checkOut",
      index,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: ""
    });
  };

  const getTotalAttendanceDaysForMonth = () => {
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString("default", {
      month: "short"
    });
    const filtered = attendanceHistory.filter((record) =>
      record.date.endsWith(monthName)
    );
    const uniqueDates = new Set(filtered.map((record) => record.date.split(" ")[0]));
    return uniqueDates.size;
  };

  const getMonthData = () => {
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString("default", {
      month: "long"
    });
    const shortMonth = monthName.slice(0, 3);
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="invisible"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isFutureDate = new Date(calendarYear, calendarMonth, i) > new Date();
      const dateStr = `${i} ${shortMonth}`;
      const hasAttendance = attendanceHistory.some(
        (record) => record.date === dateStr
      );

      days.push(
        <button
          key={i}
          disabled={!hasAttendance || isFutureDate}
          onClick={() => !isFutureDate && handleDateClick(dateStr)}
          className={`w-full aspect-square flex items-center justify-center rounded-full transition-colors
            ${isFutureDate 
              ? "text-gray-300 cursor-not-allowed" 
              : hasAttendance 
                ? "bg-black text-white font-medium hover:bg-gray-100 hover:text-gray-500" 
                : "text-gray-500 hover:bg-gray-100"
            }
          `}
        >
          {i}
        </button>
      );
    }

    return { monthName, days };
  };

  const exportToExcel = (type) => {
    let dataToExport = [];
    if (type === "month") {
      const monthName = new Date().toLocaleString("default", { month: "short" });
      dataToExport = attendanceHistory.filter((record) =>
        record.date.endsWith(monthName)
      );
    } else {
      dataToExport = attendanceHistory;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      ["Date", "Check In", "Check Out", "Total Hours"].join(",") + "\r\n";
    dataToExport.forEach((item) => {
      csvContent +=
        [item.date, item.checkIn, item.checkOut, item.totalHours].join(",") +
        "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `attendance_${type}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const currentMonthName = new Date(calendarYear, calendarMonth).toLocaleString("default", {
    month: "short"
  });

  const filteredHistory = attendanceHistory.filter((record) =>
    record.date.endsWith(currentMonthName)
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Dashboard */}
      {page === "dashboard" && (
        <div className="p-6 max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                {localStorage.getItem("username")
                  ? localStorage.getItem("username").charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Welcome back, {localStorage.getItem("username") || "User"}!
                </h2>
                <p className="text-sm text-gray-500">Here's your attendance summary</p>
              </div>
            </div>
            <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your attendance records.
            </p>
          </header>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Daily Attendance</h2>
              <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-md">
                <button
                  onClick={openCalendar}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <Calendar />
                  <span className="mt-2 text-sm text-black font-medium">
                    Select Date to Punch In
                  </span>
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Mark attendance by selecting a date.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Monthly Attendance</h2>
              <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-md">
                <button
                  onClick={() => setPage("monthly")}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <BarChart />
                  <span className="mt-2 text-sm text-black font-medium">
                    View Monthly Calendar
                  </span>
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                See your attendance calendar for any month.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4">Export to Excel</h2>
              <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-md">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 0 0 0-2 2v16a2 0 0 0 2 2h12a2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span className="mt-2 text-sm text-black font-medium">
                    Export Data
                  </span>
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Download your attendance as Excel file.
              </p>
            </div>
          </div>

          {/* Attendance History List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
            <ul className="space-y-4">
              {attendanceHistory.map((record, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 rounded-md p-4 space-y-3 sm:space-y-0"
                >
                  <div>
                    <p className="text-sm font-medium">{record.date}</p>
                    <p className="text-xs text-gray-500">
                      Check-in: {record.checkIn} &nbsp;&nbsp; Check-out: {record.checkOut}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-black">
                      Total Hours: {record.totalHours}
                    </div>
                    {record.checkOut === "-" && (
                      <button
                        onClick={() => handleCheckOut(index)}
                        className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition"
                      >
                        Check Out Now
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Login Page */}
      {page === "login" && (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-black px-4 gap-10 py-8">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Attendance App
            </h1>
            <p className="text-lg mb-8">
              Track your daily attendance and view monthly reports in one place.
            </p>
            <div className="bg-gray-100 text-gray-800 backdrop-blur-sm p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Key Features</h2>
              <ul className="space-y-2">
                {[
                  "Daily attendance tracking",
                  "Monthly calendar view",
                  "Export to Excel"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-.707-.707a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-full max-w-md mt-4 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Login to Your Account
            </h2>
            <input
              type="text"
              placeholder="Enter Your Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError((prev) => ({ ...prev, usernameError: "" }));
              }}
              className="w-full p-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            {error.usernameError && (
              <p className="text-red-500 text-sm mb-4">{error.usernameError}</p>
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError((prev) => ({ ...prev, passwordError: "" }));
              }}
              className="w-full p-3 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            {error.passwordError && (
              <p className="text-red-500 text-sm mb-6">{error.passwordError}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-black text-white rounded-md transition duration-300 transform hover:-translate-y-1"
            >
              Sign In
            </button>
            <p className="mt-6 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Attendance App. All rights reserved.
            </p>
          </div>
        </div>
      )}

      {/* Monthly View */}
      {page === "monthly" && (
        <div className="p-6 max-w-4xl mx-auto">
          <button
            onClick={() => setPage("dashboard")}
            className="mb-6 text-black hover:text-gray-700 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Monthly Attendance</h1>
            <p className="text-gray-600 mt-2">
              View your attendance calendar for{" "}
              {new Date(calendarYear, calendarMonth).toLocaleString("default", {
                month: "long"
              })}
              .
            </p>
          </header>

          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {new Date(calendarYear, calendarMonth).toLocaleString("default", {
                month: "long",
                year: "numeric"
              })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-7 gap-2 text-sm text-center mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm text-center">
              {getMonthData().days}
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-2">Attendance Summary</h3>
            <p className="text-gray-600">
              You marked attendance on{" "}
              <span className="text-black font-medium">
                {getTotalAttendanceDaysForMonth()}
              </span>{" "}
              days in{" "}
              <span className="font-medium">
                {new Date(calendarYear, calendarMonth).toLocaleString("default", {
                  month: "long"
                })}
              </span>
              .
            </p>
          </div>

          {/* Filtered Monthly History List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {new Date(calendarYear, calendarMonth).toLocaleString("default", {
                month: "long"
              })}{" "}
              Records
            </h2>
            <ul className="space-y-4">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 rounded-md p-4 space-y-3 sm:space-y-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{record.date}</p>
                      <p className="text-xs text-gray-500">
                        Check-in: {record.checkIn} &nbsp;&nbsp; Check-out: {record.checkOut}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-black">
                        Total Hours: {record.totalHours}
                      </div>
                      {record.checkOut === "-" && (
                        <button
                          onClick={() => handleCheckOut(index)}
                          className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition"
                        >
                          Check Out Now
                        </button>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 italic">No attendance found this month.</p>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarModal
          month={calendarMonth}
          year={calendarYear}
          onSelect={handleDateClick}
          onClose={closeCalendar}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          attendanceHistory={attendanceHistory}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Select Export Type</h2>
            <p className="text-gray-600 mb-6">
              Choose whether you want to export monthly or yearly attendance data.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => exportToExcel("month")}
                className="w-full p-4 border-2 border-black rounded-lg text-left hover:bg-gray-100 transition"
              >
                <div className="font-medium text-black">Monthly Export</div>
                <div className="text-sm text-gray-500">Export only current month's data</div>
              </button>
              <button
                onClick={() => exportToExcel("year")}
                className="w-full p-4 border-2 border-black rounded-lg text-left hover:bg-gray-100 transition"
              >
                <div className="font-medium text-black">Yearly Export</div>
                <div className="text-sm text-gray-500">Export all available data for the year</div>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Input Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">
              {timeInput.type === "checkIn"
                ? "Enter Check-In Time"
                : "Enter Check-Out Time"}
            </h2>
            <input
              type="text"
              placeholder="E.g. 9:00 AM"
              value={
                timeInput.type === "checkIn"
                  ? timeInput.checkIn
                  : timeInput.checkOut
              }
              onChange={(e) =>
                setTimeInput({
                  ...timeInput,
                  [timeInput.type]: e.target.value
                })
              }
              className="w-full p-3 mb-4 border rounded-md"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={saveTime}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SVG Icons
function Calendar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="15" x2="12" y2="15" />
      <line x1="9" y1="15" x2="9" y2="15" />
      <line x1="15" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function BarChart() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="12" width="4" height="8" />
      <rect x="9" y="8" width="4" height="12" />
      <rect x="15" y="4" width="4" height="16" />
    </svg>
  );
}

// Calendar Modal with Navigation
function CalendarModal({
  month,
  year,
  onSelect,
  onClose,
  goToPreviousMonth,
  goToNextMonth,
  attendanceHistory
}) {
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
    const dateStr = `${i} ${shortMonth}`;
    const hasAttendance = attendanceHistory.some(
      (record) => record.date === dateStr
    );

    days.push(
      <button
        key={i}
        disabled={isFutureDate}
        onClick={() => !isFutureDate && onSelect(dateStr)}
        className={`hover:bg-gray-100 w-full aspect-square flex items-center justify-center rounded-full ${
          isFutureDate
            ? "text-gray-300 cursor-not-allowed"
            : hasAttendance
            ? "bg-black text-white font-medium hover:bg-gray-100 hover:text-gray-500" 
            : "text-gray-500"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {monthName}, {year}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="flex justify-center items-center mb-4">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-1 text-sm rounded hover:bg-gray-100"
          >
            ←
          </button>
          <span className="mx-4 font-medium">{`${monthName}, ${year}`}</span>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 text-sm rounded hover:bg-gray-100"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm text-center">
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
}