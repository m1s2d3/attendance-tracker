// export function parseTime(time) {
//     if (!time || time === "-") return [0, 0];
//     const [timePart, period] = time.split(" ");
//     let [hours, minutes] = timePart.split(":").map(Number);
    
//     if (period === "PM" && hours < 12) hours += 12;
//     if (period === "AM" && hours === 12) hours = 0;
    
//     return [hours, minutes];
//   }
  
  export function getMinuteOptions(step = 5) {
    const arr = [];
    for (let i = 0; i < 60; i += step) {
      arr.push(i.toString().padStart(2, "0"));
    }
    return arr;
  }

export function parseTime(time) {
  if (!time || time === "-") return [0, 0];

  // Handle format like "6 hrs 50 min"
  if (time.includes("hr")) {
    const hrMatch = time.match(/(\d+)\s*hr/);
    const minMatch = time.match(/(\d+)\s*min/);
    const hours = hrMatch ? parseInt(hrMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    return [hours, minutes];
  }

  // Handle format like "9:45 AM"
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return [hours, minutes];
}