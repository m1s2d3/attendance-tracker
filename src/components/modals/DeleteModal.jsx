import React from "react";

const DeleteModal = ({ setShowDeleteModal, deleteRecord }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow w-72 animate-fade-in-up">
        <h2 className="text-sm font-semibold mb-2">Confirm Deletion</h2>
        <p className="text-xs mb-4">
          Are you sure you want to delete this record?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-4 rounded"
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
  );
};

export default DeleteModal;