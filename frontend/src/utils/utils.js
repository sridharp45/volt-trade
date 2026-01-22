export const getCookie = (cname) => {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
};

export const handleFileChange = (event, callback) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      callback(base64String);
    };
    reader.readAsDataURL(file);
  }
};

export const arrayChecker = (arr) => {
  return arr && Array.isArray(arr);
}

export const arrayLengthChecker = (arr) => {
  return arr && Array.isArray(arr) && arr?.length>0;
}

export const dateFormat = (data) => {
  const date = new Date(data);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

export const yyyymmdd = (data) => {
  const date = new Date(data);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const dateFormat2 = (data) => {
  const date = new Date(data); // Create a Date object

  // Format the date as YYYY-MM-DD HH:MM in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}`;
  return formattedDate;
}

export const timeFormat = (data) => {
  const date = new Date(data);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formattedTime = `${hours}:${minutes}`
  return formattedTime;
}

export const formatLocalDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  const daySuffix = (day) => {
    if (day >= 11 && day <= 13) return "th"; // Special case for 11th, 12th, 13th
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${daySuffix(day)} ${month} ${year}`;
}


export const calculateTariff = (dateTime) => {
  /**
   * Function to calculate the electricity tariff for a given date and time.
   *
   * Parameters:
   * - dateTime (Date): A JavaScript Date object representing the specific date and time.
   *
   * Returns:
   * - Number: The calculated tariff (e.g., in INR/kWh).
   */
  const hour = dateTime.getHours();
  const weekday = dateTime.getDay(); // 0 = Sunday, 6 = Saturday

  // Tariff logic
  if (weekday === 0 || weekday === 6) { // Weekend (Saturday/Sunday)
      if (hour >= 2 && hour <= 5) { // Early morning
          return Math.random() * (3.0 - 2.0) + 2.0; // Low tariff
      } else if (hour >= 18 && hour <= 21) { // Evening peak
          return Math.random() * (10.0 - 8.0) + 8.0; // High tariff
      } else {
          return Math.random() * (6.0 - 4.0) + 4.0; // Moderate tariff
      }
  } else { // Weekday
      if (hour >= 2 && hour <= 5) { // Early morning
          return Math.random() * (2.5 - 1.5) + 1.5; // Low tariff
      } else if (hour >= 18 && hour <= 21) { // Evening peak
          return Math.random() * (12.0 - 9.0) + 9.0; // High tariff
      } else {
          return Math.random() * (7.0 - 3.0) + 3.0; // Moderate tariff
      }
  }
}