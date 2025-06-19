// Helper function to get current date in YYYY-MM-DD format
export const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate  = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDateRange = () => {
  const currentDate = getCurrentDate();
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const oneYearAgo = new Date ();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const fiveYearsAgo = new Date ();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  
  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);

  return {
    currentDate,
    past30Days: formatDate(thirtyDaysAgo),
    pastYear: formatDate(oneYearAgo),
    past5Years: formatDate(fiveYearsAgo),
    in2Years: formatDate(twoYearsLater),
  };  
};