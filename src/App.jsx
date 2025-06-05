import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import MonthlyPage from "./components/MonthlyPage";
import HistoryPage from "./components/HistoryPage";
import ChartPage from "./components/ChartPage";
import CalendarModal from "./components/modals/CalendarModal";
import ExportModal from "./components/modals/ExportModal";
import TimeModal from "./components/modals/TimeModal";
import DeleteModal from "./components/modals/DeleteModal";
import SettingsModal from "./components/modals/SettingsModal";
import DuplicateModal from "./components/modals/DuplicateModal";
import TimePicker from "./components/TimePicker";
import useGeolocationTracking from "./hooks/useGeolocationTracking";
import { parseTime } from "./utils/timeUtils";

export default function App() {
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [error, setError] = useState({ usernameError: "" });
  const [attendanceHistory, setAttendanceHistory] = useState(() => {
    const savedData = localStorage.getItem("attendanceHistory");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [autoAttendanceEnabled, setAutoAttendanceEnabled] = useState(() => {
    const saved = localStorage.getItem("autoAttendanceEnabled");
    return saved ? JSON.parse(saved) : false;
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [timeInput, setTimeInput] = useState({
    type: "",
    index: null,
    date: "",
    checkIn: "",
    checkOut: ""
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDeleteIndex, setRecordToDeleteIndex] = useState(null);
  const [notification, setNotification] = useState(null);

  // Existing states ke nichese upar wala line daalna padega
const [officeLocation, setOfficeLocation] = useState(() => {
  const savedLat = localStorage.getItem("officeLat");
  const savedLng = localStorage.getItem("officeLng");
  const savedRadius = localStorage.getItem("officeRadius");

  return {
    latitude: savedLat ? parseFloat(savedLat) : 28.6734,
    longitude: savedLng ? parseFloat(savedLng) : 77.4147,
    radiusMeters: savedRadius ? parseInt(savedRadius) : 500
  };
});

  // Save auto attendance state to localStorage
  useEffect(() => {
    localStorage.setItem("autoAttendanceEnabled", JSON.stringify(autoAttendanceEnabled));
  }, [autoAttendanceEnabled]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("attendanceHistory", JSON.stringify(attendanceHistory));
  }, [attendanceHistory]);

  // Load login status
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      setPage("dashboard");
    }
  }, []);

  // Login handler
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

  // Calendar handlers
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

  // Handle manual date selection
  const handleDateClick = (dateString) => {
    const isDuplicate = attendanceHistory.some(
      (record) => record.date === dateString
    );
    if (isDuplicate) {
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

  // Save time input
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

  // Manual checkout
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

  // Auto Check-in Function
  const handleCheckIn = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString("default", { month: "short" });
    const today = `${day} ${month}`

    const exists = attendanceHistory.some(record => record.date === today);
    if (!exists) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
      const checkInTime = `${hour12}:${formattedMin} ${period}`;

      const newEntry = {
        date: today,
        checkIn: checkInTime,
        checkOut: "-",
        totalHours: "-"
      };

      setAttendanceHistory(prev => [newEntry, ...prev]);
      showNotification("Auto Check-In Done!");
    }
  };

  // Auto Check-out Function
  const autoCheckOut = () => {
    const today = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short"
    });

    const recordIndex = attendanceHistory.findIndex(
      record => record.date === today
    );

    if (recordIndex !== -1 && attendanceHistory[recordIndex].checkOut === "-") {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
      const checkOutTime = `${hour12}:${formattedMin} ${period}`;

      const updatedHistory = [...attendanceHistory];
      updatedHistory[recordIndex].checkOut = checkOutTime;

      const [inHour, inMin] = parseTime(updatedHistory[recordIndex].checkIn);
      const [outHour, outMin] = parseTime(checkOutTime);

      let totalHours = outHour - inHour;
      let totalMinutes = outMin - inMin;

      if (totalMinutes < 0) {
        totalHours--;
        totalMinutes += 60;
      }

      updatedHistory[recordIndex].totalHours =
        totalHours > 0
          ? `${totalHours} hr${totalHours !== 1 ? "s" : ""} ${totalMinutes} min`
          : "-";

      setAttendanceHistory(updatedHistory);
      showNotification("Auto Check-Out Done!");
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Use geolocation tracking
  useGeolocationTracking({
    isAutoAttendanceEnabled: autoAttendanceEnabled && page === "dashboard",
    handleCheckIn,
    handleCheckOut: autoCheckOut,
    officeLocation
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Page Components */}
      {page === "login" && <LoginPage 
        username={username} 
        setUsername={setUsername} 
        error={error} 
        handleLogin={handleLogin}
        setError={setError}
      />}
      {page === "dashboard" && <DashboardPage 
        setPage={setPage}
        openCalendar={openCalendar}
        setShowExportModal={setShowExportModal}
        autoAttendanceEnabled={autoAttendanceEnabled}
        setAutoAttendanceEnabled={setAutoAttendanceEnabled}
        setShowSettingsModal={setShowSettingsModal}
        officeLocation={officeLocation}
       />}
      {page === "monthly" && <MonthlyPage 
        calendarMonth={calendarMonth}
        calendarYear={calendarYear}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        attendanceHistory={attendanceHistory}
        openCalendar={openCalendar}
        currentMonthName={currentMonthName}
        filteredHistory={filteredHistory}
        getTotalAttendanceDaysForMonth={getTotalAttendanceDaysForMonth}
        setPage={setPage}
        handleDateClick={handleDateClick}
      />}
      {page === "history" && <HistoryPage 
        attendanceHistory={attendanceHistory}
        editRecord={editRecord}
        confirmDeleteRecord={confirmDeleteRecord}
        handleCheckOut={handleCheckOut}
        setPage={setPage}
      />}
      {page === "chart" && <ChartPage 
        calendarMonth={calendarMonth}
        calendarYear={calendarYear}
        attendanceHistory={attendanceHistory}
        getTotalAttendanceDaysForMonth={getTotalAttendanceDaysForMonth}
        amPunchCount={amPunchCount}
        pmPunchCount={pmPunchCount}
        currentMonthName={currentMonthName}
        filteredHistory={filteredHistory}
        setPage={setPage}
      />}

      {/* Modals */}
      {showCalendar && <CalendarModal 
        month={calendarMonth}
        year={calendarYear}
        onSelect={handleDateClick}
        onClose={closeCalendar}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        attendanceHistory={attendanceHistory}
      />}
      {showExportModal && <ExportModal 
        setShowExportModal={setShowExportModal}
        attendanceHistory={attendanceHistory}
      />}
      {showTimeModal && <TimeModal 
        timeInput={timeInput}
        setTimeInput={setTimeInput}
        saveTime={saveTime}
        setShowTimeModal={setShowTimeModal}
        TimePicker={TimePicker}
      />}
      {showDeleteModal && <DeleteModal 
        setShowDeleteModal={setShowDeleteModal}
        deleteRecord={deleteRecord}
      />}
      {showDuplicate && <DuplicateModal 
        setShowDuplicate={setShowDuplicate}
      />}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          setOfficeLocation={setOfficeLocation}
        />
      )}
      {/* Notification Toast */}
      {notification && (
       <div 
       className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50 animate-fade-in-up"
     >
       {notification}
     </div>
      )}
    </div>
  );
}