import React from "react";

const ExportModal = ({ setShowExportModal, attendanceHistory }) => {
  // Helper function to parse date like "11 Mar 2025"
  const parseCustomDate = (dateStr) => {
    const [day, month, year] = dateStr.split(" ");
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    return new Date(year, monthMap[month], day);
  };

  // Get current and previous two years
  const getCurrentAndPreviousTwoYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear];
  };

  const months = [
    { value: "all", label: "All Months" },
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const years = getCurrentAndPreviousTwoYears(); // e.g. [2023, 2024, 2025]

  const [selectedMonth, setSelectedMonth] = React.useState("all");
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const exportToExcel = () => {
    let dataToExport = [];

    if (selectedMonth === "all") {
      // Export all months of selected year
      dataToExport = attendanceHistory.filter((record) => {
        try {
          const recordDate = parseCustomDate(record.date);
          return recordDate.getFullYear() === selectedYear;
        } catch (e) {
          console.error("Invalid date format:", record.date);
          return false;
        }
      });
    } else {
      // Export only selected month & year
      dataToExport = attendanceHistory.filter((record) => {
        try {
          const recordDate = parseCustomDate(record.date);
          return (
            recordDate.getMonth() === parseInt(selectedMonth) &&
            recordDate.getFullYear() === selectedYear
          );
        } catch (e) {
          console.error("Invalid date format:", record.date);
          return false;
        }
      });
    }

    if (dataToExport.length === 0) {
      alert("No records found for the selected criteria.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += ["Date", "Check In", "Check Out", "Total Hours"].join(",") + "\r\n";

    dataToExport.forEach((item) => {
      csvContent += [item.date, item.checkIn, item.checkOut, item.totalHours]
        .map(field => `"${field.replace(/"/g, '""')}"`) // Escape quotes
        .join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const now = new Date();
    const fileName = selectedMonth === "all"
      ? `attendance_full_year_${selectedYear}_${now.toISOString().slice(0, 10)}.csv`
      : `attendance_${months.find(m => m.value === selectedMonth)?.label}_${selectedYear}_${now.toISOString().slice(0, 10)}.csv`;

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow w-80 animate-fade-in-up">
        <h2 className="text-sm font-semibold mb-2">Select Month & Year</h2>
        <p className="text-xs mb-4">
          Choose the month and year for which you want to export attendance data.
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="flex-1 bg-black text-white text-sm py-2 rounded"
          >
            Export Data
          </button>
          <button
            onClick={() => setShowExportModal(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;