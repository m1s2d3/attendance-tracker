import React, { useState, useEffect } from 'react';

export default function App() {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    punchIn: '',
    punchOut: '',
    isOfficeDay: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [monthSummary, setMonthSummary] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '' });

  // Required office days per month
  const REQUIRED_DAYS = 8;

  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Load saved attendance data from localStorage
    const savedAttendance = localStorage.getItem('attendance');
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }
  }, []);

  // Save attendance data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Show notification
  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // Get days in current month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Handle date click in calendar
  const handleDateClick = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const entry = attendance.find(item => item.date === dateStr);

    if (entry) {
      setFormData(entry);
      setIsEditing(true);
    } else {
      setFormData({
        date: dateStr,
        punchIn: '',
        punchOut: '',
        isOfficeDay: true,
      });
      setIsEditing(false);
    }

    setSelectedDate(dateStr);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save attendance entry
  const handleSave = () => {
    if (!formData.date || !formData.punchIn || !formData.punchOut) {
      showNotification('Please fill all fields');
      return;
    }

    if (isEditing) {
      setAttendance(prev => prev.map(entry => 
        entry.date === formData.date ? formData : entry
      ));
      showNotification('Attendance updated');
    } else {
      setAttendance(prev => [...prev, formData]);
      showNotification('Attendance saved');
    }

    setSelectedDate(null);
  };

  // Delete attendance entry
  const handleDelete = () => {
    if (window.confirm('Are you sure?')) {
      setAttendance(prev => prev.filter(entry => entry.date !== formData.date));
      setSelectedDate(null);
      showNotification('Entry deleted');
    }
  };

  // Calculate total hours worked
  const calculateHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return 0;
    const [inHour, inMin] = punchIn.split(':').map(Number);
    const [outHour, outMin] = punchOut.split(':').map(Number);
    let totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    return (totalMinutes / 60).toFixed(1);
  };

  // Generate monthly summary
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, currentDate.getMonth());

    const summary = [];
    let officeDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = attendance.find(item => item.date === dateStr);

      if (entry) {
        const hours = calculateHours(entry.punchIn, entry.punchOut);
        summary.push({
          date: dateStr,
          punchIn: entry.punchIn,
          punchOut: entry.punchOut,
          hours: hours,
          isOfficeDay: entry.isOfficeDay
        });

        if (entry.isOfficeDay) officeDays++;
      } else {
        summary.push({
          date: dateStr,
          punchIn: '-',
          punchOut: '-',
          hours: 0,
          isOfficeDay: false
        });
      }
    }

    setMonthSummary(summary);
  }, [attendance, currentDate]);

  // Download monthly summary
  const handleDownloadSummary = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date,Punch In,Punch Out,Total Hours,Office Day\n"
      + monthSummary.map(row => 
          `${row.date},${row.punchIn},${row.punchOut},${row.hours},${row.isOfficeDay ? 'Yes' : 'No'}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_summary_${formatDate(currentDate).slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Monthly summary downloaded');
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get current month name
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate office days stats
  const officeDaysCompleted = attendance.filter(
    entry => entry.isOfficeDay && 
    new Date(entry.date).getMonth() === currentDate.getMonth() && 
    new Date(entry.date).getFullYear() === currentDate.getFullYear()
  ).length;

  const officeDaysRemaining = Math.max(0, REQUIRED_DAYS - officeDaysCompleted);

  // Scroll to top when selected date changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDate]);

  return (
    <>
      {/* iOS Add to Home Screen Instructions */}
      <div className="ios-install-banner fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 px-4 hidden">
        Tap the <span className="font-bold">Share</span> button and select <span className="font-bold">Add to Home Screen</span>
      </div>

      {/* Meta Tags for iOS Web App Mode */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Adidas Attendance" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      <link rel="apple-touch-startup-image" href="/splash-screen.png" />

      {/* Main App UI */}
      <div className="min-h-screen bg-gray-50 py-4 px-4">
        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300">
            {notification.message}
          </div>
        )}

        <div className="max-w-md mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Adidas Attendance Tracker</h1>
            <p className="text-gray-600 text-sm">Track your in-office & remote work days</p>
          </header>

          {/* Office Days Counter Card - Mobile Optimized */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Office Days</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{officeDaysCompleted}</div>
                <div className="text-gray-500 text-sm">of {REQUIRED_DAYS} required</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {officeDaysRemaining > 0 ? (
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-2 rounded text-sm text-blue-700">
                Complete {officeDaysRemaining} more office days this month
              </div>
            ) : (
              <div className="mt-3 bg-green-50 border-l-4 border-green-500 p-2 rounded text-sm text-green-700">
                Completed all required office days for this month
              </div>
            )}
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{currentMonthName}</h2>
              <div className="flex space-x-2">
                <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-gray-500 font-medium py-2 text-xs">{day}</div>
              ))}

              {(() => {
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                return Array(firstDay).fill(0).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8"></div>
                ));
              })()}

              {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = attendance.find(item => item.date === dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === formatDate(new Date());

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-8 flex items-center justify-center cursor-pointer
                      rounded-full transition-all duration-200
                      ${entry ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-blue-500 text-white font-medium' : ''}
                      ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Form / Details Section */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            {selectedDate ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">
                    {new Date(selectedDate).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h2>
                  {isEditing && (
                    <button onClick={handleDelete} className="text-red-500 hover:text-red-700">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punch In</label>
                    <input
                      type="time"
                      name="punchIn"
                      value={formData.punchIn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Punch Out</label>
                    <input
                      type="time"
                      name="punchOut"
                      value={formData.punchOut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOfficeDay"
                      name="isOfficeDay"
                      checked={formData.isOfficeDay}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isOfficeDay" className="ml-2 block text-sm text-gray-700">
                      Office Day
                    </label>
                  </div>

                  <div className="pt-3">
                    {formData.punchIn && formData.punchOut && (
                      <div className="text-sm text-gray-600 mb-3">
                        Total Hours: {calculateHours(formData.punchIn, formData.punchOut)}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {isEditing ? 'Update' : 'Save'}
                      </button>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <svg className="w-12 h-12 text-gray-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-md font-medium text-gray-700 mb-1">Select a Date</h3>
                <p className="text-gray-500 text-sm">Tap a date in the calendar to log or view attendance</p>
              </div>
            )}
          </div>

          {/* Monthly Summary Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Monthly Summary</h2>
              <button
                onClick={handleDownloadSummary}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-1 text-xs">Date</th>
                    <th className="text-left py-2 px-1 text-xs">Punch In</th>
                    <th className="text-left py-2 px-1 text-xs">Punch Out</th>
                    <th className="text-left py-2 px-1 text-xs">Hours</th>
                    <th className="text-left py-2 px-1 text-xs">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {monthSummary.map((entry, index) => (
                    <tr key={index} className={`border-b hover:bg-gray-50 ${entry.punchIn === '-' ? 'text-gray-400' : ''}`}>
                      <td className="py-2 px-1 text-sm">{new Date(entry.date).toLocaleDateString('default', { day: 'numeric' })}</td>
                      <td className="py-2 px-1 text-sm">{entry.punchIn}</td>
                      <td className="py-2 px-1 text-sm">{entry.punchOut}</td>
                      <td className="py-2 px-1 text-sm">{entry.hours}</td>
                      <td className="py-2 px-1">
                        {entry.isOfficeDay ? (
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-3 h-3 bg-gray-300 rounded-full"></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Install Prompt for iOS */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Tap the <strong>Share</strong> button in Safari and select <strong>Add to Home Screen</strong></p>
          </div>
        </div>
      </div>
    </>
  );
}
