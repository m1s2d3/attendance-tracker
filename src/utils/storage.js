// src/utils/storage.js

export const getAttendanceHistory = () => {
    const saved = localStorage.getItem("attendanceHistory");
    return saved ? JSON.parse(saved) : [];
  };
  
  export const saveAttendanceHistory = (history) => {
    localStorage.setItem("attendanceHistory", JSON.stringify(history));
  };