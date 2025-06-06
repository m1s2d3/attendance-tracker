import React from "react";

const DuplicateModal = ({ setShowDuplicate }) => {
  return (
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
    </div>
  );
};

export default DuplicateModal;