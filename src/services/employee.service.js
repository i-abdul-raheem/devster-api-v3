const employeeDetailsMap = {
  "gagtic@hotmail.com": {
    employeeID: "DL-DEV-0001",
    employeeCNIC: "42501-2209076-3",
    employeeName: "Abdul Ahad",
    employeeDesignation: "Senior React Native Developer",
    slackUserId: "U06M11UUCRL",
  },
  "jawadfarooqi@icloud.com": {
    employeeID: "DL-DEV-0002",
    employeeCNIC: "36302-7424408-5",
    employeeName: "Jawad A. Farooqi",
    employeeDesignation: "Backend Developer",
    slackUserId: "U06M11UUCRL",
  },
  "omer.arshad20@gmail.com": {
    employeeID: "DL-DEV-0003",
    employeeCNIC: "61101-8499346-1",
    employeeName: "Omer Arshad",
    employeeDesignation: "Data Scientist",
    slackUserId: "U06M11UUCRL",
  },
};

const getEmployeeByEmail = (email) => {
  return employeeDetailsMap?.[email]
}

module.exports = { getEmployeeByEmail, employeeDetailsMap };
