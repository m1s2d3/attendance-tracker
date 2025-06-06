import React from "react";
import { getMinuteOptions } from "../utils/timeUtils";

const TimePicker = ({ value, onChange }) => {
  const [hour, minute, period] = value?.split(/[: ]/) || ["", "", "AM"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = getMinuteOptions(5); // every 5 mins

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    const newTime = `${newHour}:${minute || "00"} ${period}`;
    onChange(newTime);
  };

  const handleMinuteChange = (e) => {
    const newMin = e.target.value;
    const newTime = `${hour || "9"}:${newMin} ${period}`;
    onChange(newTime);
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    const newTime = `${hour || "9"}:${minute || "00"} ${newPeriod}`;
    onChange(newTime);
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={hour || ""}
        onChange={handleHourChange}
        className="w-1/3 p-2 border rounded text-sm appearance-none bg-white"
      >
        <option value="" disabled>
          Hr
        </option>
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select
        value={minute || ""}
        onChange={handleMinuteChange}
        className="w-1/3 p-2 border rounded text-sm appearance-none bg-white"
      >
        <option value="" disabled>
          Min
        </option>
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={period || "AM"}
        onChange={handlePeriodChange}
        className="w-1/3 p-2 border rounded text-sm bg-white"
      >
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  );
};

export default TimePicker;