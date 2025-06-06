// /components/modals/SettingsModal.jsx
import React, { useState, useEffect } from "react";

const SettingsModal = ({ onClose, setOfficeLocation }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("");

  // Load saved values when modal opens
  useEffect(() => {
    setLat(localStorage.getItem("officeLat") || "");
    setLng(localStorage.getItem("officeLng") || "");
    setRadius(localStorage.getItem("officeRadius") || "");
  }, []);

  const handleSave = () => {
    if (!lat || !lng || !radius) {
      alert("Please enter all fields");
      return;
    }

    const newLocation = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radiusMeters: parseInt(radius)
    };

    localStorage.setItem("officeLat", lat);
    localStorage.setItem("officeLng", lng);
    localStorage.setItem("officeRadius", radius);

    setOfficeLocation(newLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow w-80 max-w-md p-4 animate-fade-in-up">
        <h2 className="text-lg font-bold mb-4">Set Office Location</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="E.g. 28.4593 (Huda Metro Station)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="E.g. 77.0727 (Huda Metro Station)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Radius (meters)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="E.g. 500"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white text-sm rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;