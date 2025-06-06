export function parseTime(time) {
    if (!time || time === "-") return [0, 0];
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    return [hours, minutes];
  }
  
  export function getMinuteOptions(step = 5) {
    const arr = [];
    for (let i = 0; i < 60; i += step) {
      arr.push(i.toString().padStart(2, "0"));
    }
    return arr;
  }
