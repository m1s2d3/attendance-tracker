import React from "react";

const ExportModal = ({ setShowExportModal,attendanceHistory }) => {
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
    
  return (
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
  );
};

export default ExportModal;