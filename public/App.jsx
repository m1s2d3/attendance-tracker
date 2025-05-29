import React, { useState, useEffect } from 'react';

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // format: YYYY-MM-DD
};

const App = () => {
  const [attendance, setAttendance] = useState({});
  const todayKey = getTodayKey();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('attendance') || '{}');
    setAttendance(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  const handlePunch = (type) => {
    setAttendance((prev) => ({
      ...prev,
      [todayKey]: {
        ...(prev[todayKey] || {}),
        [type]: new Date().toLocaleTimeString(),
      },
    }));
  };

  const countOfficeDays = () =>
    Object.keys(attendance).filter((day) => attendance[day].in && attendance[day].out).length;

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Adidas Attendance Tracker</h1>

      <div className="mb-4">
        <p className="text-lg">Today: {todayKey}</p>
        <p>Punch In: {attendance[todayKey]?.in || '--'}</p>
        <p>Punch Out: {attendance[todayKey]?.out || '--'}</p>
      </div>

      <div className="space-x-4 mb-6">
        <button
          onClick={() => handlePunch('in')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Punch In
        </button>
        <button
          onClick={() => handlePunch('out')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Punch Out
        </button>
      </div>

      <div className="text-md">
        <p>✅ Office Days This Month: {countOfficeDays()}</p>
      </div>
    </div>
  );
};

export default App;
