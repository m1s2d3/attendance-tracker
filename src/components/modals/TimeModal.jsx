import React from "react";

const TimeModal = ({ 
  timeInput, 
  setTimeInput, 
  saveTime, 
  setShowTimeModal,
  TimePicker
}) => {
  return (
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
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={saveTime}
            className="bg-black text-white text-sm py-2 px-4 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeModal;