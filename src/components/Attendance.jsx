import React, { useState, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("login"); // login | dashboard | monthly | history | chart
  const [username, setUsername] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [error, setError] = useState({ usernameError: "" });
  const [attendanceHistory, setAttendanceHistory] = useState(() => {
    const savedData = localStorage.getItem("attendanceHistory");
    return savedData ? JSON.parse(savedData) : [];
  });
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeInput, setTimeInput] = useState({
    type: "",
    index: null,
    date: "",
    checkIn: "",
    checkOut: ""
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDeleteIndex, setRecordToDeleteIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("attendanceHistory", JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      setPage("dashboard");
    }
  }, []);

  const handleLogin = () => {
    const trimmedUsername = username.trim();
    let usernameError = "";
    setError({ usernameError });

    if (!trimmedUsername) {
      usernameError = "Username required";
    } else if (trimmedUsername.length < 3) {
      usernameError = "At least 3 chars";
    }

    if (usernameError) return;

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", trimmedUsername);
    setPage("dashboard");
  };

  const openCalendar = () => {
    setCalendarMonth(new Date().getMonth());
    setCalendarYear(new Date().getFullYear());
    setShowCalendar(true);
  };

  const closeCalendar = () => setShowCalendar(false);

  const goToPreviousMonth = () => {
    setCalendarMonth((m) => (m === 0 ? 11 : m - 1));
    setCalendarYear((y) => (calendarMonth === 0 ? y - 1 : y));
  };

  const goToNextMonth = () => {
    setCalendarMonth((m) => (m === 11 ? 0 : m + 1));
    setCalendarYear((y) => (calendarMonth === 11 ? y + 1 : y));
  };

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month, year) =>
    new Date(year, month, 1).getDay();

  const handleDateClick = (dateString) => {
    const isDuplicate = attendanceHistory.some(
      (record) => record.date === dateString
    );
    if (isDuplicate) {
    //   alert("Attendance already marked for this date.");
    setShowDuplicate(true);
      closeCalendar();
      return;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
    const currentTime = `${hour12}:${formattedMin} ${period}`;

    setShowTimeModal(true);
    setTimeInput({
      type: "checkIn",
      index: null,
      date: dateString,
      checkIn: currentTime,
      checkOut: "-"
    });
  };

  const parseTime = (time) => {
    if (!time || time === "-") return [0, 0];
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    const finalPeriod = period || (hours < 12 ? "AM" : "PM");

    if (finalPeriod === "PM" && hours < 12) hours += 12;
    if (finalPeriod === "AM" && hours === 12) hours = 0;

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
      const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
      const checkInTime = `${hour12}:${formattedMin} ${period}`;
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
      const formattedTotalHours = `${totalHours} hr${
        totalHours !== 1 ? "s" : ""
      } ${totalMinutes} min`;
      const updatedHistory = [...attendanceHistory];
      updatedHistory[index].checkOut = timeInput.checkOut;
      updatedHistory[index].totalHours = formattedTotalHours;
      setAttendanceHistory(updatedHistory);
    } else if (type === "editCheckIn" && index !== null) {
      const updatedHistory = [...attendanceHistory];
      updatedHistory[index].checkIn = timeInput.checkIn;
      const [checkInHour, checkInMinute] = parseTime(timeInput.checkIn);
      const [checkOutHour, checkOutMinute] = parseTime(updatedHistory[index].checkOut);
      let totalHours = checkOutHour - checkInHour;
      let totalMinutes = checkOutMinute - checkInMinute;
      if (totalMinutes < 0) {
        totalHours--;
        totalMinutes += 60;
      }
      updatedHistory[index].totalHours =
        checkOutHour > 0
          ? `${totalHours} hr${totalHours !== 1 ? "s" : ""} ${totalMinutes} min`
          : "-";
      setAttendanceHistory(updatedHistory);
    } else if (type === "editCheckOut" && index !== null) {
      const updatedHistory = [...attendanceHistory];
      updatedHistory[index].checkOut = timeInput.checkOut;
      const [checkInHour, checkInMinute] = parseTime(updatedHistory[index].checkIn);
      const [checkOutHour, checkOutMinute] = parseTime(timeInput.checkOut);
      let totalHours = checkOutHour - checkInHour;
      let totalMinutes = checkOutMinute - checkInMinute;
      if (totalMinutes < 0) {
        totalHours--;
        totalMinutes += 60;
      }
      updatedHistory[index].totalHours =
        checkOutHour > 0
          ? `${totalHours} hr${totalHours !== 1 ? "s" : ""} ${totalMinutes} min`
          : "-";
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
      checkOut: getCurrentTime()
    });
  };

  const editRecord = (index, type) => {
    const record = attendanceHistory[index];
    setShowTimeModal(true);
    setTimeInput({
      type: type === "checkIn" ? "editCheckIn" : "editCheckOut",
      index,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut
    });
  };

  const confirmDeleteRecord = (index) => {
    setRecordToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const deleteRecord = () => {
    const updatedHistory = [...attendanceHistory];
    updatedHistory.splice(recordToDeleteIndex, 1);
    setAttendanceHistory(updatedHistory);
    setShowDeleteModal(false);
    setRecordToDeleteIndex(null);
  };

  const getTotalAttendanceDaysForMonth = () => {
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString(
      "default",
      { month: "short" }
    );
    const filtered = attendanceHistory.filter((record) =>
      record.date.endsWith(monthName)
    );
    const uniqueDates = new Set(filtered.map((record) => record.date.split(" ")[0]));
    return uniqueDates.size;
  };

  const getMonthData = () => {
    const monthName = new Date(calendarYear, calendarMonth).toLocaleString(
      "default",
      { month: "long" }
    );
    const shortMonth = monthName.slice(0, 3);
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
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

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
    return `${hour12}:${formattedMin} ${period}`;
  };

  const currentMonthName = new Date(calendarYear, calendarMonth).toLocaleString(
    "default",
    { month: "short" }
  );

  const filteredHistory = attendanceHistory.filter((record) =>
    record.date.endsWith(currentMonthName)
  );

  const totalWorkingHoursThisMonth = filteredHistory
    .filter((r) => r.totalHours !== "-")
    .reduce((sum, r) => {
      const [hrs] = parseTime(r.totalHours);
      return sum + hrs;
    }, 0);

  const amPunchCount = filteredHistory.reduce((count, r) => {
    const [inHr] = parseTime(r.checkIn);
    return count + (inHr < 12 ? 1 : 0);
  }, 0);

  const pmPunchCount = filteredHistory.length - amPunchCount;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Dashboard */}
      {page === "dashboard" && (
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
              <BarChart />
              <span className="font-medium text-sm">View Monthly Calendar</span>
            </div>
            <div
              onClick={() => setShowExportModal(true)}
              className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
              <span className="font-medium text-sm">Export Data</span>
            </div>
            <div
              onClick={() => setPage("history")}
              className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
              <span className="font-medium text-sm">
                View Full Attendance History
              </span>
            </div>
            <div
              onClick={() => setPage("chart")}
              className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 cursor-pointer"
            >
              <ChartIcon />
              <span className="font-medium text-sm">View Attendance Chart</span>
            </div>
          </div>
        </div>
      )}

      {/* Login Page */}
      {page === "login" && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-login px-4 py-8">
          <div className="text-white mt-2 text-center">
            <h1 className="text-4xl font-bold mb-2">Presence+</h1>
            <p className="text-sm">Track your daily attendance records.</p>
          </div>
          <div style={{ width: "15rem", height: "20rem" }}>
            <img
              src="../../public/welcome.png"
              alt="Welcome Illustration"
              className="w-full max-w-lg rounded-lg shadow-md"
            />
          </div>
          <div style={{ width: "15rem" }} className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm text-white font-medium mb-2"
            >
              Enter Your Name
            </label>
            <input
              style={{ borderRadius: "25px" }}
              type="text"
              placeholder="Enter Your Name"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError((prev) => ({ ...prev, usernameError: "" }));
              }}
              className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:border-black"
            />
            {error.usernameError && (
              <p className="text-red-500 text-xs mb-2">{error.usernameError}</p>
            )}
            <button
              style={{ borderRadius: "25px" }}
              onClick={handleLogin}
              className="w-full px-4 mt-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Monthly View */}
      {page === "monthly" && (
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
      )}

      {/* Chart View */}
      {page === "chart" && (
        <div className="p-4 max-w-md mx-auto">
          <button
            onClick={() => setPage("dashboard")}
            className="mb-4 text-black text-sm flex items-center"
          >
            ← Back
          </button>
          <header className="mb-4">
            <h1 className="text-lg font-bold">Attendance Visualization</h1>
            <p className="text-xs text-gray-500">
              {getMonthData().monthName}, {calendarYear}
            </p>
          </header>

          {/* Daily Hours Bar Chart
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
          </div> */}

          {/* Progress Circle */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center mb-4">
            <h2 className="text-sm font-medium mb-2">Monthly Progress</h2>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.084a15.916 15.916 0 0 1 0 31.832a15.916 15.916 0 0 1 0 -31.832"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d={`M18 2.084a15.916 15.916 0 0 1 0 31.832a15.916 15.916 0 0 1 0 -31.832`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${getTotalAttendanceDaysForMonth() * 3}, 100`}
                  strokeLinecap="round"
                  transform="rotate(90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {getTotalAttendanceDaysForMonth()}<br />
                <span>days</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Marked this month
            </p>
          </div>

          {/* AM / PM Pie Chart */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <h2 className="text-sm font-medium mb-2">Punch Time Distribution</h2>
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ddd"
                  strokeWidth="10"
                  strokeDasharray={`${amPunchCount} ${pmPunchCount}`}
                  strokeDashoffset="-20"
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray={`${amPunchCount} ${pmPunchCount}`}
                  strokeDashoffset="-20"
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium pointer-events-none">
                AM<br />
                {amPunchCount} Days
              </div>
            </div>
            <div className="mt-2 flex space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500"></div>
                <span>AM Punches</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500"></div>
                <span>PM Punches</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Attendance History Page */}
      {page === "history" && (
        <div className="p-4 max-w-md mx-auto">
          <button
            onClick={() => setPage("dashboard")}
            className="mb-4 text-black text-sm flex items-center"
          >
            ← Back
          </button>
          <header className="mb-4">
            <h1 className="text-lg font-bold">Full Attendance History</h1>
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
          <div className="bg-white p-4 rounded-lg shadow w-72 animate-fade-in-up">
            <h2 className="text-sm font-semibold mb-2">Select Export Type</h2>
            <p className="text-xs mb-2">
              Choose whether you want to export monthly or yearly attendance data.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => exportToExcel("month")}
                className="w-full p-3 border rounded text-left text-sm"
              >
                Monthly Export
              </button>
              <button
                onClick={() => exportToExcel("year")}
                className="w-full p-3 border rounded text-left text-sm"
              >
                Yearly Export
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="text-xs text-gray-500"
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
          <div className="bg-white p-4 rounded-lg shadow w-72 animate-fade-in-up">
            <h2 className="text-sm font-semibold mb-2">
              {timeInput.type === "checkIn" || timeInput.type === "editCheckIn"
                ? "Select Check-In Time"
                : "Select Check-Out Time"}
            </h2>
            <TimePicker
              value={
                timeInput.type === "checkIn" || timeInput.type === "editCheckIn"
                  ? timeInput.checkIn
                  : timeInput.checkOut
              }
              onChange={(selectedTime) => {
                setTimeInput((prev) => ({
                  ...prev,
                  checkIn:
                    prev.type === "checkIn" || prev.type === "editCheckIn"
                      ? selectedTime
                      : prev.checkIn,
                  checkOut:
                    prev.type === "checkOut" || prev.type === "editCheckOut"
                      ? selectedTime
                      : prev.checkOut
                }));
              }}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowTimeModal(false)}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={saveTime}
                className="px-3 py-1 bg-black text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
        {showDuplicate && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow w-72 animate-fade-in-up">
            <h2 className="text-sm font-semibold mb-2">Information</h2>
            <p className="text-xs mb-4">
            Attendance already marked for this date.
            </p>
            <div className="flex justify-end space-x-2">
            <button
                onClick={() => setShowDuplicate(false)}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>)}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow w-72 animate-fade-in-up">
            <h2 className="text-sm font-semibold mb-2">Confirm Deletion</h2>
            <p className="text-xs mb-4">
              Are you sure you want to delete this record?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={deleteRecord}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Delete
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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

function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
      <line x1="3" y1="20" x2="19" y2="20" />
    </svg>
  );
}

// Calendar Modal Component
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
            ←
          </button>
          <span className="mx-2 text-sm font-medium">
            {monthName}, {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="px-2 text-sm"
          >
            →
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
}

// 🕰️ Custom Time Picker Component
function TimePicker({ value, onChange }) {
  const [hour, minute, period] = value?.split(/[: ]/) || ["", "", "AM"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = getMinuteOptions(5); // every 5 mins

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    const newTime = `${newHour}:${minute || "00"} ${period}`;
    onChange(newTime);
  };

  const handleMinuteChange = (e) => {
    const newMin = e.target.value;
    const newTime = `${hour || "9"}:${newMin} ${period}`;
    onChange(newTime);
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    const newTime = `${hour || "9"}:${minute || "00"} ${newPeriod}`;
    onChange(newTime);
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={hour || ""}
        onChange={handleHourChange}
        className="w-1/3 p-2 border rounded text-sm appearance-none bg-white"
      >
        <option value="" disabled>
          Hr
        </option>
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <select
        value={minute || ""}
        onChange={handleMinuteChange}
        className="w-1/3 p-2 border rounded text-sm appearance-none bg-white"
      >
        <option value="" disabled>
          Min
        </option>
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={period || "AM"}
        onChange={handlePeriodChange}
        className="w-1/3 p-2 border rounded text-sm bg-white"
      >
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  );
}

function getMinuteOptions(step = 5) {
  const arr = [];
  for (let i = 0; i < 60; i += step) {
    arr.push(i.toString().padStart(2, "0"));
  }
  return arr;
}

// Parse Time Function
function parseTime(time) {
  if (!time || time === "-") return [0, 0];
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return [hours, minutes];
}
